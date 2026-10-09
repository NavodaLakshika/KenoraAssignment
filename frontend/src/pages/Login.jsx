import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, KeyRound, LogIn, ShieldCheck, Briefcase, UserCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    login(demoEmail, demoPassword)
      .then((user) => {
        toast.success(`Logged in as ${user.fullName} (${user.role})`);
        navigate('/dashboard');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Login failed.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="split-auth-wrapper">
      {/* Outer Split Card */}
      <div className="split-auth-card">
        
        {/* Left Side: Login Form Card */}
        <div className="split-auth-form-side">
          <div className="split-auth-header">
            <h2 className="split-auth-title">
              Login please
            </h2>
            <p className="split-auth-subtitle">
              Training Centre Workshop Registration Service
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email Field with Left Blue Border & Divider */}
            <div className="split-input-box">
              <span className="split-input-icon">
                <Mail size={18} />
              </span>
              <span className="split-input-divider">|</span>
              <input
                id="email"
                type="email"
                className="split-input-field"
                placeholder="Input your user ID or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password Field with Left Blue Border & Divider */}
            <div className="split-input-box">
              <span className="split-input-icon">
                <KeyRound size={18} />
              </span>
              <span className="split-input-divider">|</span>
              <input
                id="password"
                type="password"
                className="split-input-field"
                placeholder="Input your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="split-checkbox-row">
              <label className="split-checkbox-label">
                <input
                  type="checkbox"
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="split-forgot-link"
                onClick={() => toast.info('Please contact System Administrator to reset credentials.')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div style={{ paddingTop: '0.25rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="split-submit-btn"
              >
                <LogIn size={16} />
                <span>{loading ? 'LOGGING IN...' : 'LOG IN'}</span>
              </button>
            </div>
          </form>

          {/* Demo tip */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Tip: Use demo quick links on the right panel
            </span>
          </div>
        </div>

        {/* Right Side: Fluid Blue Waves Panel */}
        <div className="split-blue-panel">
          
          {/* Organic Fluid Wavy Layer Shapes */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <svg
              style={{ position: 'absolute', right: '-40px', top: '-40px', width: '380px', height: '380px', opacity: 0.22 }}
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
              style={{ position: 'absolute', left: '-50px', bottom: '-50px', width: '380px', height: '380px', opacity: 0.2 }}
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

          {/* Foreground Text Content */}
          <div className="split-blue-panel-content">
            <h3 className="split-welcome-title">
              WELCOME!
            </h3>
            <p className="split-welcome-subtitle">
              Enter your details and start journey with us
            </p>

            {/* Quick Demo Role Switching Pills */}
            <div className="split-demo-pills-container">
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', color: '#bfdbfe', display: 'block', marginBottom: '0.25rem' }}>
                1-Click Demo Accounts
              </span>

              <div
                onClick={() => handleQuickLogin('admin@workshop.com', 'Admin123!')}
                className="split-demo-pill"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={14} color="#d8b4fe" />
                  <span style={{ fontWeight: 600 }}>Eleanor Vance</span>
                </div>
                <span style={{ background: 'rgba(168, 85, 247, 0.35)', color: '#f3e8ff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(168, 85, 247, 0.5)' }}>
                  ADMIN
                </span>
              </div>

              <div
                onClick={() => handleQuickLogin('manager@workshop.com', 'Manager123!')}
                className="split-demo-pill"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={14} color="#67e8f9" />
                  <span style={{ fontWeight: 600 }}>Mark Robinson</span>
                </div>
                <span style={{ background: 'rgba(6, 182, 212, 0.35)', color: '#cffafe', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(6, 182, 212, 0.5)' }}>
                  MANAGER
                </span>
              </div>

              <div
                onClick={() => handleQuickLogin('staff@workshop.com', 'Staff123!')}
                className="split-demo-pill"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={14} color="#6ee7b7" />
                  <span style={{ fontWeight: 600 }}>Sarah Jenkins</span>
                </div>
                <span style={{ background: 'rgba(16, 185, 129, 0.35)', color: '#d1fae5', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.5)' }}>
                  STAFF
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
