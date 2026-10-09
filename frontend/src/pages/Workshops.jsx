import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { workshopsApi } from '../api/services';
import { 
  Calendar, 
  Search, 
  Filter, 
  PlusCircle, 
  Edit3, 
  UserPlus, 
  MapPin, 
  Clock, 
  Users,
  RotateCcw
} from 'lucide-react';
import RegisterModal from '../components/RegisterModal';
import WorkshopModal from '../components/WorkshopModal';
import CalendarModal from '../components/CalendarModal';

export default function Workshops() {
  const { role } = useAuth();

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modals state
  const [registerWorkshop, setRegisterWorkshop] = useState(null);
  const [editWorkshop, setEditWorkshop] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null); // 'from' | 'to' | null

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (from) params.from = new Date(from).toISOString();
      if (to) params.to = new Date(to).toISOString();
      if (status) params.status = status;
      if (availableOnly) params.availableOnly = true;

      const res = await workshopsApi.getAll(params);
      setWorkshops(res.data);
    } catch (err) {
      console.error('Failed to fetch workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly or fetch on change
    const timer = setTimeout(() => {
      fetchWorkshops();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, from, to, status, availableOnly]);

  const handleResetFilters = () => {
    setSearch('');
    setFrom('');
    setTo('');
    setStatus('');
    setAvailableOnly(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (wsStatus) => {
    switch (wsStatus) {
      case 'Scheduled':
        return <span className="status-badge status-scheduled">Scheduled</span>;
      case 'InProgress':
        return <span className="status-badge status-inprogress">In Progress</span>;
      case 'Completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'Cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{wsStatus}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workshops Directory</h1>
          <p className="page-description">
            Explore schedules, check seat availability, and coordinate attendee registrations.
          </p>
        </div>

        {role === 'Manager' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={16} />
            <span>Create Workshop</span>
          </button>
        )}
      </div>

      {/* Simple & Professional Filter Card */}
      <div className="filter-card">
        <div className="filter-grid">
          {/* Search */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="search-input">Search Title or Code</label>
            <div className="filter-input-wrap">
              <Search className="filter-input-icon" size={16} />
              <input
                id="search-input"
                type="text"
                className="filter-input filter-input-with-icon"
                placeholder="e.g. Pottery or WS001"
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

          {/* Date From */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="date-from">From Date</label>
            <div className="filter-input-wrap" style={{ cursor: 'pointer' }} onClick={() => setCalendarTarget('from')}>
              <Calendar className="filter-input-icon" size={16} />
              <input
                id="date-from"
                type="text"
                readOnly
                className="filter-input filter-input-with-icon"
                style={{ cursor: 'pointer' }}
                placeholder="Select start date..."
                value={from ? new Date(from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              />
              {from && (
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrom('');
                  }}
                  title="Clear start date"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Date To */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="date-to">To Date</label>
            <div className="filter-input-wrap" style={{ cursor: 'pointer' }} onClick={() => setCalendarTarget('to')}>
              <Calendar className="filter-input-icon" size={16} />
              <input
                id="date-to"
                type="text"
                readOnly
                className="filter-input filter-input-with-icon"
                style={{ cursor: 'pointer' }}
                placeholder="Select end date..."
                value={to ? new Date(to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              />
              {to && (
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTo('');
                  }}
                  title="Clear end date"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="status-filter">Status</label>
            <div className="filter-input-wrap">
              <select
                id="status-filter"
                className="filter-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Footer Controls */}
        <div className="filter-footer">
          {/* Available only toggle pill */}
          <label className={`filter-toggle-pill ${availableOnly ? 'active' : ''}`}>
            <input
              type="checkbox"
              id="availableOnly"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            <Users size={15} />
            <span>Seats Available Only</span>
          </label>

          <div className="filter-actions">
            {(search || from || to || status || availableOnly) && (
              <button
                type="button"
                className="filter-reset-btn"
                onClick={handleResetFilters}
                title="Reset All Filters"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
            <span className="filter-results-count">
              Showing <strong>{workshops.length}</strong> {workshops.length === 1 ? 'workshop' : 'workshops'}
            </span>
          </div>
        </div>
      </div>

      {/* Workshop Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading workshops...
        </div>
      ) : workshops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Calendar size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>No workshops found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Try adjusting your search criteria or date filters.
          </p>
        </div>
      ) : (
        <div className="workshops-grid">
          {workshops.map((ws) => {
            const percent = Math.min(100, Math.round((ws.activeRegistrationsCount / ws.capacity) * 100));
            const isFull = ws.availableSeats <= 0;
            const canRegister = (role === 'Manager' || role === 'Staff') && ws.status === 'Scheduled';

            return (
              <div key={ws.id} className="workshop-card">
                <div>
                  <div className="workshop-header">
                    <span className="workshop-code">{ws.code}</span>
                    {getStatusBadge(ws.status)}
                  </div>

                  <h3 className="workshop-title">{ws.title}</h3>

                  <div className="workshop-meta">
                    <div className="meta-row">
                      <Users size={14} color="var(--accent-cyan)" />
                      <span>Instructor: {ws.instructor}</span>
                    </div>
                    <div className="meta-row">
                      <MapPin size={14} color="var(--accent-emerald)" />
                      <span>{ws.location}</span>
                    </div>
                    <div className="meta-row">
                      <Clock size={14} color="var(--accent-purple)" />
                      <span>{formatDate(ws.startDateTime)} - {formatDate(ws.endDateTime)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Capacity Bar */}
                  <div className="capacity-box">
                    <div className="capacity-header">
                      <span style={{ color: 'var(--text-muted)' }}>Capacity ({ws.activeRegistrationsCount}/{ws.capacity})</span>
                      <span style={{
                        fontWeight: 700,
                        color: isFull ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                      }}>
                        {isFull ? 'Sold Out' : `${ws.availableSeats} left`}
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div
                        className={`capacity-progress ${isFull ? 'capacity-full' : (percent > 75 ? 'capacity-warning' : 'capacity-normal')}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {canRegister && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={isFull}
                        onClick={() => setRegisterWorkshop(ws)}
                      >
                        <UserPlus size={15} />
                        <span>{isFull ? 'Full' : 'Register'}</span>
                      </button>
                    )}

                    {role === 'Manager' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditWorkshop(ws)}
                        title="Edit Workshop"
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Attendee Modal */}
      {registerWorkshop && (
        <RegisterModal
          workshop={registerWorkshop}
          isOpen={!!registerWorkshop}
          onClose={() => setRegisterWorkshop(null)}
          onSuccess={fetchWorkshops}
        />
      )}

      {/* Workshop Create Modal */}
      {showCreateModal && (
        <WorkshopModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchWorkshops}
        />
      )}

      {/* Workshop Edit Modal */}
      {editWorkshop && (
        <WorkshopModal
          workshop={editWorkshop}
          isOpen={!!editWorkshop}
          onClose={() => setEditWorkshop(null)}
          onSuccess={fetchWorkshops}
        />
      )}

      {/* Calendar Filter Modal */}
      <CalendarModal
        isOpen={!!calendarTarget}
        onClose={() => setCalendarTarget(null)}
        onSelect={(val) => {
          if (calendarTarget === 'from') setFrom(val);
          if (calendarTarget === 'to') setTo(val);
        }}
        initialValue={calendarTarget === 'from' ? from : to}
        mode="date"
        title={calendarTarget === 'from' ? 'Select Start Date (From)' : 'Select End Date (To)'}
      />
    </div>
  );
}
