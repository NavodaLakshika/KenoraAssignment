import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workshopsApi } from '../api/services';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import RegisterModal from '../components/RegisterModal';
import WorkshopModal from '../components/WorkshopModal';
import WelcomeModal from '../components/WelcomeModal';

export default function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshopForReg, setSelectedWorkshopForReg] = useState(null);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const res = await workshopsApi.getAll();
      setWorkshops(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();

    if (user?.id) {
      const key = `hub_welcome_shown_${user.id}`;
      const shown = sessionStorage.getItem(key);
      if (!shown) {
        setShowWelcomeModal(true);
        sessionStorage.setItem(key, 'true');
      }
    }
  }, [user]);

  const upcomingWorkshops = workshops.filter((w) => w.status === 'Scheduled');
  const totalAvailableSeats = upcomingWorkshops.reduce((sum, w) => sum + (w.availableSeats > 0 ? w.availableSeats : 0), 0);
  const totalActiveRegistrations = workshops.reduce((sum, w) => sum + w.activeRegistrationsCount, 0);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getRoleBadge = () => {
    if (role === 'Admin') {
      return (
        <span className="dash-hero-role-pill">
          <ShieldCheck size={13} color="#f3e8ff" />
          <span>ADMIN CONSOLE</span>
        </span>
      );
    }
    if (role === 'Manager') {
      return (
        <span className="dash-hero-role-pill">
          <Briefcase size={13} color="#cffafe" />
          <span>MANAGER PORTAL</span>
        </span>
      );
    }
    return (
      <span className="dash-hero-role-pill">
        <UserCheck size={13} color="#d1fae5" />
        <span>STAFF WORKSPACE</span>
      </span>
    );
  };

  const getRoleDescription = () => {
    if (role === 'Admin') {
      return 'Global administration, system credentials, security oversight & live audit registry.';
    }
    if (role === 'Manager') {
      return 'Schedule planning, capacity control, event creation & real-time attendee management.';
    }
    return 'Live workshop availability, participant verification & rapid attendee registration.';
  };

  return (
    <div>
      {/* Hero Welcome Banner (Matches Login Page Fluid Blue Aesthetic) */}
      <div className="dash-hero-banner">
        
        {/* Background Organic Wave SVGs (Exact match to Login Page) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <svg
            style={{ position: 'absolute', right: '-40px', top: '-40px', width: '380px', height: '380px', opacity: 0.18 }}
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
            style={{ position: 'absolute', left: '-50px', bottom: '-50px', width: '380px', height: '380px', opacity: 0.15 }}
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

        {/* Banner Left Info */}
        <div className="dash-hero-content">
          <div className="dash-hero-badge-row">
            {getRoleBadge()}
            <span className="dash-hero-status-pill">
              <span className="dash-hero-pulse-dot" />
              <span>Live Attendance Sync</span>
            </span>
            <span className="dash-hero-status-pill">
              <Calendar size={12} color="#bfdbfe" />
              <span>{todayFormatted}</span>
            </span>
          </div>

          <h1 className="dash-hero-title">
            Good day, {user?.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="dash-hero-desc">
            {getRoleDescription()}
          </p>
        </div>

        {/* Banner Right Actions */}
        <div className="dash-hero-actions">
          <button
            type="button"
            className="dash-btn-glass"
            onClick={() => setShowWelcomeModal(true)}
            title="View Interactive Welcome Guide"
          >
            <Sparkles size={16} color="#bfdbfe" />
            <span>Welcome Guide</span>
          </button>

          {role === 'Manager' && (
            <button
              type="button"
              className="dash-btn-white"
              onClick={() => setShowWorkshopModal(true)}
            >
              <PlusCircle size={16} />
              <span>New Workshop</span>
            </button>
          )}

          {role === 'Admin' && (
            <button
              type="button"
              className="dash-btn-white"
              onClick={() => navigate('/users')}
            >
              <Users size={16} />
              <span>User Management</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid (Matching Login Input Left-Border Style) */}
      <div className="stats-grid">
        <div className="dash-stat-card dash-stat-blue">
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div className="dash-stat-value">{upcomingWorkshops.length}</div>
              <div className="dash-stat-label">Upcoming Workshops</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            Scheduled
          </span>
        </div>

        <div className="dash-stat-card dash-stat-emerald">
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div className="dash-stat-value">{totalAvailableSeats}</div>
              <div className="dash-stat-label">Seats Available</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
            Open Slots
          </span>
        </div>

        <div className="dash-stat-card dash-stat-sky">
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="dash-stat-value">{totalActiveRegistrations}</div>
              <div className="dash-stat-label">Active Attendees</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
            Confirmed
          </span>
        </div>

        <div className="dash-stat-card dash-stat-purple">
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#faf5ff', color: '#7e22ce' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div className="dash-stat-value">{workshops.length}</div>
              <div className="dash-stat-label">Total Managed</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
            Directory
          </span>
        </div>
      </div>

      {/* Upcoming Workshops Section */}
      <div className="dash-section-header">
        <div>
          <h2 className="dash-section-title">Upcoming Scheduled Workshops</h2>
          <p className="dash-section-subtitle">Live seating capacity, instructors, and instant attendee registration</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.6rem 1.15rem' }}
          onClick={() => navigate('/workshops')}
        >
          <span>View All Workshops</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
          <div>Loading scheduled workshops...</div>
        </div>
      ) : upcomingWorkshops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Calendar size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>No Scheduled Workshops</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            There are currently no scheduled workshops in the system. Check back later or create a new workshop.
          </p>
          {role === 'Manager' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowWorkshopModal(true)}
            >
              <PlusCircle size={16} />
              <span>Create First Workshop</span>
            </button>
          )}
        </div>
      ) : (
        <div className="workshops-grid">
          {upcomingWorkshops.slice(0, 6).map((ws) => {
            const percent = Math.min(100, Math.round((ws.activeRegistrationsCount / ws.capacity) * 100));
            const isFull = ws.availableSeats <= 0;

            return (
              <div key={ws.id} className="dash-workshop-card">
                <div>
                  <div className="workshop-header">
                    <span className="workshop-code">{ws.code}</span>
                    <span className="status-badge status-scheduled">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
                      {ws.status}
                    </span>
                  </div>

                  <h3 className="workshop-title">{ws.title}</h3>

                  <div className="workshop-meta">
                    <div className="meta-row">
                      <Users size={15} color="#0284c7" />
                      <span>Instructor: <strong style={{ color: '#334155' }}>{ws.instructor}</strong></span>
                    </div>
                    <div className="meta-row">
                      <MapPin size={15} color="#059669" />
                      <span>{ws.location}</span>
                    </div>
                    <div className="meta-row">
                      <Clock size={15} color="#7c3aed" />
                      <span>{formatDate(ws.startDateTime)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="capacity-box">
                    <div className="capacity-header">
                      <span style={{ color: '#475569', fontWeight: 600 }}>Capacity ({ws.activeRegistrationsCount}/{ws.capacity})</span>
                      <span style={{
                        fontWeight: 700,
                        color: isFull ? '#dc2626' : '#059669',
                      }}>
                        {isFull ? 'Sold Out' : `${ws.availableSeats} seats left`}
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div
                        className={`capacity-progress ${isFull ? 'capacity-full' : (percent > 75 ? 'capacity-warning' : 'capacity-normal')}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {(role === 'Manager' || role === 'Staff') && (
                    <button
                      type="button"
                      className="dash-workshop-register-btn"
                      disabled={isFull}
                      onClick={() => setSelectedWorkshopForReg(ws)}
                    >
                      <span>{isFull ? 'Capacity Full' : 'Register Attendee'}</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Attendee Modal */}
      {selectedWorkshopForReg && (
        <RegisterModal
          workshop={selectedWorkshopForReg}
          isOpen={!!selectedWorkshopForReg}
          onClose={() => setSelectedWorkshopForReg(null)}
          onSuccess={fetchWorkshops}
        />
      )}

      {/* Workshop Create Modal */}
      {showWorkshopModal && (
        <WorkshopModal
          isOpen={showWorkshopModal}
          onClose={() => setShowWorkshopModal(false)}
          onSuccess={fetchWorkshops}
        />
      )}

      {/* Welcome Modal with Guidance & Highlights */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        user={user}
      />
    </div>
  );
}

