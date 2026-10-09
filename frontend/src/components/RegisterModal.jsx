import React, { useState } from 'react';
import { X, User, Mail, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registrationsApi } from '../api/services';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

export default function RegisterModal({ workshop, isOpen, onClose, onSuccess }) {
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  if (!isOpen || !workshop) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setError('Please provide both attendee name and email.');
      return;
    }

    setShowConfirm(true);
  };

  const executeRegister = async () => {
    try {
      setSubmitting(true);
      setShowConfirm(false);
      await registrationsApi.register({
        workshopId: workshop.id,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
      });

      toast.success(`Successfully registered ${attendeeName} for ${workshop.title}!`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete registration.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isFull = workshop.availableSeats <= 0;
  const percent = Math.min(100, Math.round((workshop.activeRegistrationsCount / workshop.capacity) * 100));

  return (
    <div 
      className="modal-backdrop reg-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Modal Dialog with Split Wave Design */}
      <div 
        className="reg-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.28)',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="reg-modal-close-btn"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            zIndex: 30,
            transition: 'all 0.15s ease',
          }}
        >
          <X size={16} />
        </button>

        {/* Left Side: Registration Input Form */}
        <div 
          className="reg-modal-form-side"
          style={{
            flex: '1.25',
            padding: '2.5rem 2.25rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              display: 'inline-block',
              paddingBottom: '0.25rem',
              borderBottom: '3px solid #2563eb',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Register please
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500, margin: '0.4rem 0 0' }}>
              Enter attendee credentials for admission
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {/* Attendee Name Field */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label 
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }} 
                htmlFor="attendeeName"
              >
                Attendee Full Name *
              </label>
              <div 
                className="split-input-box"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '10px',
                  padding: '0.7rem 0.95rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <span className="split-input-icon" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', marginRight: '0.65rem' }}>
                  <User size={17} />
                </span>
                <span className="split-input-divider" style={{ color: '#cbd5e1', marginRight: '0.65rem', fontWeight: 300, userSelect: 'none' }}>
                  |
                </span>
                <input
                  id="attendeeName"
                  type="text"
                  className="split-input-field"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.885rem',
                    color: '#0f172a',
                    fontWeight: 500,
                  }}
                  placeholder="Input attendee full name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  required
                  disabled={submitting || isFull}
                  autoFocus
                />
              </div>
            </div>

            {/* Attendee Email Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label 
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }} 
                htmlFor="attendeeEmail"
              >
                Attendee Email Address *
              </label>
              <div 
                className="split-input-box"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '10px',
                  padding: '0.7rem 0.95rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <span className="split-input-icon" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', marginRight: '0.65rem' }}>
                  <Mail size={17} />
                </span>
                <span className="split-input-divider" style={{ color: '#cbd5e1', marginRight: '0.65rem', fontWeight: 300, userSelect: 'none' }}>
                  |
                </span>
                <input
                  id="attendeeEmail"
                  type="email"
                  className="split-input-field"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.885rem',
                    color: '#0f172a',
                    fontWeight: 500,
                  }}
                  placeholder="Input attendee email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                  disabled={submitting || isFull}
                />
              </div>
            </div>

            {isFull && (
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', margin: '0 0 1rem' }}>
                Notice: All seats have been filled for this workshop.
              </p>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={submitting || isFull}
                className="split-submit-btn"
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isFull ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  opacity: isFull ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <UserPlus size={16} />
                <span>{submitting ? 'PROCESSING...' : 'REGISTER'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn btn-secondary"
                style={{
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Fluid Blue Waves Workshop Info Panel */}
        <div 
          className="reg-modal-blue-side"
          style={{
            flex: '0.9',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e3a8a 100%)',
            padding: '2.5rem 2rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Organic Fluid Wavy Layer Shapes */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <svg
              style={{ position: 'absolute', right: '-40px', top: '-40px', width: '280px', height: '280px', opacity: 0.22 }}
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#ffffff"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.6,81.2,29.1,72.4,41.4C63.6,53.7,51.8,63.7,38.3,70.5C24.8,77.3,9.6,80.9,-5.3,81C-20.2,81.1,-40.4,77.7,-55.8,68.9C-71.2,60.1,-81.8,45.9,-86.6,29.9C-91.4,13.9,-90.4,-3.9,-84.9,-20.1C-79.4,-36.3,-69.4,-50.9,-56,-58.3C-42.6,-65.7,-25.8,-65.9,-9.9,-71.4C6,-76.9,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
            <svg
              style={{ position: 'absolute', left: '-50px', bottom: '-50px', width: '280px', height: '280px', opacity: 0.2 }}
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#38bdf8"
                d="M39.9,-65.7C54.1,-60.5,69.7,-53.7,78.2,-41.8C86.7,-29.9,88.1,-15,86.2,-0.9C84.3,13.2,79.1,26.4,71.1,38.3C63.1,50.2,52.3,60.8,39.4,67.7C26.5,74.6,11.5,77.8,-3.4,79.8C-18.3,81.8,-36.6,82.6,-50.2,74.8C-63.8,67,-72.7,50.6,-77.9,34.5C-83.1,18.4,-84.6,2.6,-81.5,-12.3C-78.4,-27.2,-70.7,-41.2,-59.4,-48.8C-48.1,-56.4,-33.2,-57.6,-19.9,-63.3C-6.6,-69,7.8,-79.2,25.7,-70.9L39.9,-65.7Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>

          {/* Workshop Details Overlay */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              marginBottom: '0.75rem',
              backdropFilter: 'blur(4px)',
            }}>
              {workshop.code}
            </span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.35, marginBottom: '0.5rem', color: '#ffffff' }}>
              {workshop.title}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#dbeafe', margin: '0 0 0.35rem', fontWeight: 300 }}>
              Instructor: <strong style={{ color: '#ffffff', fontWeight: 600 }}>{workshop.instructor}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: 0, fontWeight: 300 }}>
              Location: <strong style={{ color: '#ffffff', fontWeight: 600 }}>{workshop.location}</strong>
            </p>
          </div>

          {/* Live Capacity Card */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '14px',
            padding: '1rem 1.15rem',
            backdropFilter: 'blur(8px)',
            marginTop: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#dbeafe', fontWeight: 500 }}>Available Seats</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                {isFull ? '0 (Full)' : `${workshop.availableSeats} of ${workshop.capacity}`}
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
              <div 
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                  width: `${percent}%`,
                  backgroundColor: isFull ? '#f87171' : (percent > 75 ? '#fbbf24' : '#34d399'),
                }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal Before Saving Registration */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeRegister}
        title="Confirm Attendee Registration"
        message={`Are you sure you want to register ${attendeeName} (${attendeeEmail}) for "${workshop.title}" (${workshop.code})?`}
        confirmText="Yes, Confirm Registration"
        cancelText="Review Details"
        variant="primary"
        icon={<CheckCircle2 size={26} color="#2563eb" />}
        submitting={submitting}
      />
    </div>
  );
}
