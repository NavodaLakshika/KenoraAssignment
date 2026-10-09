import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workshops from './pages/Workshops';
import Registrations from './pages/Registrations';
import History from './pages/History';
import Users from './pages/Users';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function RoleGuard({ allowedRoles, children }) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workshops" element={<Workshops />} />

              <Route
                path="/registrations"
                element={
                  <RoleGuard allowedRoles={['Manager', 'Staff']}>
                    <Registrations />
                  </RoleGuard>
                }
              />

              <Route
                path="/history"
                element={
                  <RoleGuard allowedRoles={['Manager', 'Staff']}>
                    <History />
                  </RoleGuard>
                }
              />

              <Route
                path="/users"
                element={
                  <RoleGuard allowedRoles={['Admin']}>
                    <Users />
                  </RoleGuard>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
