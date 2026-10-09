import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  History 
} from 'lucide-react';

export default function WelcomeModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const getRoleDetails = (role) => {
    switch (role) {
      case 'Admin':
        return {
          title: 'System Administrator',
          color: '#7c3aed',
          badgeClass: 'role-admin',
          icon: <ShieldCheck size={20} />,
          desc: 'Manage staff and manager accounts, control system access, and oversee administrative security.',
        };
      case 'Manager':
        return {
          title: 'Workshop Manager',
          color: '#2563eb',
          badgeClass: 'role-manager',
          icon: <Briefcase size={20} />,
          desc: 'Create and update workshop schedules, configure seat capacities, and monitor registrations across all venues.',
        };
      case 'Staff':
      default:
        return {
          title: 'Training Staff Specialist',
          color: '#059669',
          badgeClass: 'role-staff',
          icon: <UserCheck size={20} />,
          desc: 'Look up workshop availability in real-time, register attendees safely without overbooking risks, and manage cancellations.',
        };
    }
  };

  const details = getRoleDetails(user.role);

  return (
    <div className="modal-backdrop welcome-modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content welcome-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with gradient & animated sparkles */}
        <div className="welcome-banner">
          <div className="welcome-sparkle-float">
            <Sparkles size={32} />
          </div>
          <span className="welcome-greeting-pill">Welcome to WorkshopHub</span>
          <h2 className="welcome-title">Good day, {user.fullName}!</h2>
          <p className="welcome-subtitle">
            Your centralized portal for training workshops and attendee registration.
          </p>
        </div>

        <div className="welcome-body">
          {/* Role Card */}
          <div className="welcome-role-card">
            <div className="welcome-role-header">
              <div className="welcome-role-icon-box" style={{ color: details.color }}>
                {details.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {details.title}
                  </span>
                  <span className={`role-badge ${details.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                    {user.role}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {details.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Key Highlights */}
          <div className="welcome-highlights">
            <div className="welcome-highlight-item">
              <div className="welcome-highlight-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Zap size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                  Zero Overbooking Guarantee
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Atomic SQL Server transaction locks prevent exceeding workshop capacities.
                </span>
              </div>
            </div>

            <div className="welcome-highlight-item">
              <div className="welcome-highlight-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <History size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                  Permanent Audit History
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Cancellations are non-destructive and retain timestamps and staff actor logs.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <button
            type="button"
            className="btn btn-primary welcome-continue-btn"
            onClick={onClose}
          >
            <span>Get Started with WorkshopHub</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
