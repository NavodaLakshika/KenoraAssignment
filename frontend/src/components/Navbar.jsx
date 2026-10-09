import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Briefcase, 
  UserCheck 
} from 'lucide-react';

import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'Admin':
        return <span className="role-badge role-admin"><ShieldCheck size={12} /> Admin</span>;
      case 'Manager':
        return <span className="role-badge role-manager"><Briefcase size={12} /> Manager</span>;
      case 'Staff':
        return <span className="role-badge role-staff"><UserCheck size={12} /> Staff</span>;
      default:
        return <span className="role-badge">{userRole}</span>;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/dashboard" className="brand-link">
            <div className="brand-icon">
              <Calendar size={22} />
            </div>
            <div>
              <div className="brand-title">WorkshopHub</div>
              <div className="brand-subtitle">Training Centre Portal</div>
            </div>
          </NavLink>

          <div className="nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/workshops"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Calendar size={16} />
              <span>Workshops</span>
            </NavLink>

            {(role === 'Manager' || role === 'Staff') && (
              <NavLink
                to="/registrations"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <ClipboardList size={16} />
                <span>Registrations</span>
              </NavLink>
            )}

            {role === 'Admin' && (
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={16} />
                <span>User Management</span>
              </NavLink>
            )}
          </div>

          <div className="nav-user">
            {user && (
              <div className="user-badge-container">
                <span className="user-name">{user.fullName}</span>
                {getRoleBadge(user.role)}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="btn btn-secondary btn-sm"
              title="Log Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message={`Are you sure you want to log out of your session, ${user?.fullName || ''}? You will need to log back in to access the system.`}
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
        variant="danger"
        icon={<LogOut size={26} color="#dc2626" />}
      />
    </>
  );
}
