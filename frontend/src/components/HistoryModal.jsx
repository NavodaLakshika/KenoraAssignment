import React, { useEffect, useState } from 'react';
import { X, History, Clock, UserCheck, Ban, Activity } from 'lucide-react';
import { registrationsApi } from '../api/services';

export default function HistoryModal({ registrationId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && registrationId) {
      setLoading(true);
      setError('');
      registrationsApi
        .getHistory(registrationId)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load registration history.');
          setLoading(false);
        });
    }
  }, [isOpen, registrationId]);

  if (!isOpen) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} color="#0284c7" />
            <span className="modal-title">Registration History & Audit Trail</span>
          </div>
          <button type="button" className="toast-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Loading audit history...
            </div>
          )}

          {error && (
            <div style={{ color: '#dc2626', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          )}

          {!loading && data && (
            <div>
              {/* Summary Overview */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>{data.attendeeName}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{data.attendeeEmail}</p>
                  </div>
                  <span className={`status-badge ${data.status === 'Active' ? 'status-active' : 'status-cancelled'}`}>
                    {data.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
                  <strong>Workshop:</strong> {data.workshopTitle} ({data.workshopCode})
                </div>
              </div>

              {/* Lifecycle Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <UserCheck size={14} /> Registered By
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>{data.registeredByName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                    {formatDate(data.registeredAt)}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: data.cancelledAt ? '#dc2626' : '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <Ban size={14} /> Cancelled By
                  </div>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                    {data.cancelledByName || 'Not Cancelled'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {data.cancelledAt ? (
                      <>
                        <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {formatDate(data.cancelledAt)}
                      </>
                    ) : (
                      'Registration is currently active'
                    )}
                  </div>
                </div>
              </div>

              {/* Audit Timeline */}
              <div>
                <h4 style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={15} color="#2563eb" /> System Audit Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {data.auditTrail && data.auditTrail.length > 0 ? (
                    data.auditTrail.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderLeft: `3px solid ${log.action === 'Cancelled' ? '#dc2626' : '#059669'}`,
                          padding: '0.75rem 1rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <strong style={{ color: '#0f172a' }}>{log.action} by {log.userName}</strong>
                          <span style={{ color: '#64748b' }}>{formatDate(log.createdAt)}</span>
                        </div>
                        <p style={{ color: '#475569', fontSize: '0.8rem' }}>{log.details}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No audit records found.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
