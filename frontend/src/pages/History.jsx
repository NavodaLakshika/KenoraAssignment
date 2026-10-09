import React, { useState, useEffect } from 'react';
import { registrationsApi } from '../api/services';
import { History as HistoryIcon, UserCheck, Ban, Search, RotateCcw } from 'lucide-react';

export default function History() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    registrationsApi
      .getAll()
      .then((res) => {
        setRegistrations(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = registrations.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.attendeeName.toLowerCase().includes(s) ||
      r.attendeeEmail.toLowerCase().includes(s) ||
      r.workshopTitle.toLowerCase().includes(s) ||
      r.workshopCode.toLowerCase().includes(s) ||
      r.registeredByName.toLowerCase().includes(s) ||
      (r.cancelledByName && r.cancelledByName.toLowerCase().includes(s))
    );
  });

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registration Lifecycle Audit</h1>
          <p className="page-description">
            Complete chronological record of all registration actions, actors, and cancellations.
          </p>
        </div>
      </div>

      {/* Simple & Professional Filter Card */}
      <div className="filter-card">
        <div className="filter-group">
          <label className="filter-label" htmlFor="search-history">Search Audit Records</label>
          <div className="filter-input-wrap">
            <Search className="filter-input-icon" size={16} />
            <input
              id="search-history"
              type="text"
              className="filter-input filter-input-with-icon"
              placeholder="Search by attendee, workshop code, or staff member..."
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

        <div className="filter-footer">
          <div className="filter-results-count">
            Showing <strong>{filtered.length}</strong> of <strong>{registrations.length}</strong> audit records
          </div>
          {search && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <RotateCcw size={13} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading lifecycle history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <HistoryIcon size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>No records found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            No registration history matches your search query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span className="workshop-code" style={{ marginRight: '0.5rem' }}>{item.workshopCode}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{item.workshopTitle}</span>
                </div>
                <span className={`status-badge ${item.status === 'Active' ? 'status-active' : 'status-cancelled'}`}>
                  {item.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Attendee Details</div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{item.attendeeName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.attendeeEmail}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <UserCheck size={12} /> Registration Event
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>By {item.registeredByName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatDate(item.registeredAt)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: item.cancelledAt ? '#dc2626' : '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Ban size={12} /> Cancellation Event
                  </div>
                  {item.cancelledAt ? (
                    <>
                      <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>By {item.cancelledByName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatDate(item.cancelledAt)}</div>
                    </>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Active — Not Cancelled</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
