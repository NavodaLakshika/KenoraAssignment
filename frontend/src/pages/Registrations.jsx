import React, { useState, useEffect } from 'react';
import { registrationsApi, workshopsApi } from '../api/services';
import { useToast } from '../context/ToastContext';
import { 
  ClipboardList, 
  Ban, 
  FileText, 
  Search, 
  RotateCcw,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import HistoryModal from '../components/HistoryModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [historyRegId, setHistoryRegId] = useState(null);
  const [cancellingReg, setCancellingReg] = useState(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWorkshopId) params.workshopId = selectedWorkshopId;
      if (selectedStatus) params.status = selectedStatus;

      const [regRes, wsRes] = await Promise.all([
        registrationsApi.getAll(params),
        workshopsApi.getAll(),
      ]);

      setRegistrations(regRes.data);
      setWorkshops(wsRes.data);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWorkshopId, selectedStatus]);

  const handleConfirmCancel = async () => {
    if (!cancellingReg) return;

    try {
      setSubmittingCancel(true);
      await registrationsApi.cancel(cancellingReg.id);
      toast.success(`Registration for ${cancellingReg.attendeeName} cancelled successfully.`);
      setCancellingReg(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel registration.';
      toast.error(msg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      reg.attendeeName.toLowerCase().includes(s) ||
      reg.attendeeEmail.toLowerCase().includes(s) ||
      reg.workshopCode.toLowerCase().includes(s) ||
      reg.workshopTitle.toLowerCase().includes(s) ||
      reg.registeredByName.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrations & History</h1>
          <p className="page-description">
            Complete audit trail of active and cancelled registrations. Cancelled entries are permanently preserved.
          </p>
        </div>
      </div>

      {/* Simple & Professional Filter Card */}
      <div className="filter-card">
        <div className="filter-grid" style={{ gridTemplateColumns: '1.4fr 1.3fr 1fr' }}>
          {/* Search Attendee */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="search-attendee">Search Attendee or Email</label>
            <div className="filter-input-wrap">
              <Search className="filter-input-icon" size={16} />
              <input
                id="search-attendee"
                type="text"
                className="filter-input filter-input-with-icon"
                placeholder="e.g. Sam Wilson or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => setSearch('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Workshop Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="workshop-select">Workshop Offering</label>
            <div className="filter-input-wrap">
              <select
                id="workshop-select"
                className="filter-select"
                value={selectedWorkshopId}
                onChange={(e) => setSelectedWorkshopId(e.target.value)}
              >
                <option value="">All Workshops</option>
                {workshops.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.code} - {ws.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="status-select">Registration Status</label>
            <div className="filter-input-wrap">
              <select
                id="status-select"
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All (Active & Cancelled)</option>
                <option value="Active">Active Only</option>
                <option value="Cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <div className="filter-results-count">
            Showing <strong>{filteredRegistrations.length}</strong> of <strong>{registrations.length}</strong> records
          </div>
          {(search || selectedWorkshopId || selectedStatus) && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={() => {
                setSearch('');
                setSelectedWorkshopId('');
                setSelectedStatus('');
              }}
              title="Reset Filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading registrations...
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <ClipboardList size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>No registrations found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            There are no registration records matching your filter criteria.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Attendee</th>
                <th style={{ width: '24%' }}>Workshop</th>
                <th style={{ width: '11%' }}>Status</th>
                <th style={{ width: '15%' }}>Registered By</th>
                <th style={{ width: '14%' }}>Cancelled By / At</th>
                <th style={{ textAlign: 'right', width: '14%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id}>
                  {/* Attendee with Avatar & Clean Spacing */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="table-avatar">
                        {getInitials(reg.attendeeName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.885rem' }}>
                          {reg.attendeeName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {reg.attendeeEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Workshop Code & Title */}
                  <td>
                    <span className="workshop-code" style={{ marginRight: '0.4rem', fontSize: '0.72rem' }}>
                      {reg.workshopCode}
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                      {reg.workshopTitle}
                    </span>
                  </td>

                  {/* Status Pill */}
                  <td>
                    {reg.status === 'Active' ? (
                      <span className="status-badge status-active">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="status-badge status-cancelled">
                        <Ban size={12} /> Cancelled
                      </span>
                    )}
                  </td>

                  {/* Registered By & Timestamp */}
                  <td>
                    <div style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 600 }}>
                      {reg.registeredByName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                      <Clock size={11} />
                      <span>{formatDate(reg.registeredAt)}</span>
                    </div>
                  </td>

                  {/* Cancelled By & Timestamp */}
                  <td>
                    {reg.cancelledByName ? (
                      <div>
                        <div style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
                          {reg.cancelledByName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                          <Clock size={11} />
                          <span>{formatDate(reg.cancelledAt)}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>—</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setHistoryRegId(reg.id)}
                        title="View Official Audit Report"
                      >
                        <FileText size={13} />
                        <span>Audit Log</span>
                      </button>

                      {reg.status === 'Active' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setCancellingReg(reg)}
                          title="Cancel Registration"
                        >
                          <Ban size={13} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Audit Report Modal */}
      {historyRegId && (
        <HistoryModal
          registrationId={historyRegId}
          isOpen={!!historyRegId}
          onClose={() => setHistoryRegId(null)}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cancellingReg}
        onClose={() => setCancellingReg(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Attendee Registration?"
        message={
          <div>
            <p style={{ marginBottom: '0.65rem' }}>
              Are you sure you want to cancel the registration for <strong style={{ color: '#0f172a' }}>{cancellingReg?.attendeeName}</strong> in workshop <strong style={{ color: '#0f172a' }}>{cancellingReg?.workshopTitle}</strong>?
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '0.75rem 0.85rem', fontSize: '0.8rem', color: '#dc2626', textAlign: 'left' }}>
              ℹ️ The reserved seat will be returned to the pool immediately. An immutable cancellation event will be recorded in the audit history.
            </div>
          </div>
        }
        confirmText="Yes, Cancel Registration"
        cancelText="Keep Active"
        variant="danger"
        icon={<Ban size={26} color="#dc2626" />}
        submitting={submittingCancel}
      />
    </div>
  );
}
