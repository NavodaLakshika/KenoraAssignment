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
  BookOpen,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  HelpCircle
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
    if (role === 'Admin') {
      navigate('/users', { replace: true });
      return;
    }

    fetchWorkshops();

    if (user?.id) {
      const key = `hub_welcome_shown_${user.id}`;
      const shown = sessionStorage.getItem(key);
      if (!shown) {
        setShowWelcomeModal(true);
        sessionStorage.setItem(key, 'true');
      }
    }
  }, [user, role, navigate]);

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
        <span className="dash-hero-role-pill" style={{ borderRadius: '5px' }}>
          <ShieldCheck size={13} color="#ffffff" />
          <span>ADMIN CONSOLE</span>
        </span>
      );
    }
    if (role === 'Manager') {
      return (
        <span className="dash-hero-role-pill" style={{ borderRadius: '5px' }}>
          <Briefcase size={13} color="#ffffff" />
          <span>MANAGER PORTAL</span>
        </span>
      );
    }
    return (
      <span className="dash-hero-role-pill" style={{ borderRadius: '5px' }}>
        <UserCheck size={13} color="#ffffff" />
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
      {/* Corporate Hero Banner (Clean, Professional Blue, 5px radius, No AI blobs) */}
      <div className="dash-hero-banner" style={{ borderRadius: '5px' }}>
        
        {/* Banner Left Info */}
        <div className="dash-hero-content">
          <div className="dash-hero-badge-row">
            {getRoleBadge()}
            <span className="dash-hero-status-pill" style={{ borderRadius: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
              <span>Live Attendance Sync</span>
            </span>
            <span className="dash-hero-status-pill" style={{ borderRadius: '5px' }}>
              <Calendar size={12} color="#bfdbfe" />
              <span>{todayFormatted}</span>
            </span>
          </div>

          <h1 className="dash-hero-title">
            Good day, {user?.fullName?.split(' ')[0] || 'User'}
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
            style={{ borderRadius: '5px' }}
            onClick={() => setShowWelcomeModal(true)}
            title="View User Guide"
          >
            <HelpCircle size={15} color="#ffffff" />
            <span>User Guide</span>
          </button>

          {role === 'Manager' && (
            <button
              type="button"
              className="dash-btn-white"
              style={{ borderRadius: '5px' }}
              onClick={() => setShowWorkshopModal(true)}
            >
              <PlusCircle size={15} />
              <span>New Workshop</span>
            </button>
          )}

          {role === 'Admin' && (
            <button
              type="button"
              className="dash-btn-white"
              style={{ borderRadius: '5px' }}
              onClick={() => navigate('/users')}
            >
              <Users size={15} />
              <span>User Management</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid (5px border radius, professional corporate colors, NO AI Purple) */}
      <div className="stats-grid">
        <div className="dash-stat-card dash-stat-blue" style={{ borderRadius: '5px' }}>
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb', borderRadius: '5px' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div className="dash-stat-value">{upcomingWorkshops.length}</div>
              <div className="dash-stat-label">Upcoming Workshops</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '5px' }}>
            Scheduled
          </span>
        </div>

        <div className="dash-stat-card dash-stat-emerald" style={{ borderRadius: '5px' }}>
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#f0fdf4', color: '#15803d', borderRadius: '5px' }}>
              <UserCheck size={22} />
            </div>
            <div>
              <div className="dash-stat-value">{totalAvailableSeats}</div>
              <div className="dash-stat-label">Seats Available</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '5px' }}>
            Open Slots
          </span>
        </div>

        <div className="dash-stat-card dash-stat-slate" style={{ borderRadius: '5px' }}>
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="dash-stat-value">{totalActiveRegistrations}</div>
              <div className="dash-stat-label">Active Attendees</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '5px' }}>
            Confirmed
          </span>
        </div>

        <div className="dash-stat-card dash-stat-navy" style={{ borderRadius: '5px' }}>
          <div className="dash-stat-body">
            <div className="dash-stat-icon-box" style={{ background: '#eff6ff', color: '#1e40af', borderRadius: '5px' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div className="dash-stat-value">{workshops.length}</div>
              <div className="dash-stat-label">Total Managed</div>
            </div>
          </div>
          <span className="dash-stat-pill" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '5px' }}>
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
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, padding: '0.6rem 1.15rem', borderRadius: '5px' }}
          onClick={() => navigate('/workshops')}
        >
          <span>View All Workshops</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
          <div>Loading scheduled workshops...</div>
        </div>
      ) : upcomingWorkshops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '5px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '5px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Calendar size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>No Scheduled Workshops</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            There are currently no scheduled workshops in the system. Check back later or create a new workshop.
          </p>
          {role === 'Manager' && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ borderRadius: '5px' }}
              onClick={() => setShowWorkshopModal(true)}
            >
              <PlusCircle size={15} />
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
              <div key={ws.id} className="dash-workshop-card" style={{ borderRadius: '5px' }}>
                <div>
                  <div className="workshop-header">
                    <span className="workshop-code" style={{ borderRadius: '5px' }}>{ws.code}</span>
                    <span className="status-badge status-scheduled" style={{ borderRadius: '5px' }}>
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
                      <Clock size={15} color="#475569" />
                      <span>{formatDate(ws.startDateTime)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="capacity-box" style={{ borderRadius: '5px' }}>
                    <div className="capacity-header">
                      <span style={{ color: '#475569', fontWeight: 600 }}>Capacity ({ws.activeRegistrationsCount}/{ws.capacity})</span>
                      <span style={{
                        fontWeight: 700,
                        color: isFull ? '#dc2626' : '#059669',
                      }}>
                        {isFull ? 'Sold Out' : `${ws.availableSeats} seats left`}
                      </span>
                    </div>
                    <div className="capacity-bar" style={{ borderRadius: '5px' }}>
                      <div
                        className={`capacity-progress ${isFull ? 'capacity-full' : (percent > 75 ? 'capacity-warning' : 'capacity-normal')}`}
                        style={{ width: `${percent}%`, borderRadius: '5px' }}
                      />
                    </div>
                  </div>

                  {(role === 'Manager' || role === 'Staff') && (
                    <button
                      type="button"
                      className="dash-workshop-register-btn"
                      style={{ borderRadius: '5px' }}
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

      {/* User Guide Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        user={user}
      />
    </div>
  );
}


