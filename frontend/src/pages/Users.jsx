import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/services';
import { 
  Users as UsersIcon, 
  UserPlus, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import UserModal from '../components/UserModal';

export default function Users() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (role !== 'Admin') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 style={{ color: 'var(--accent-rose)' }}>403 Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Only System Administrators are authorized to view and manage user accounts.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account Management</h1>
          <p className="page-description">
            Administer staff and manager credentials. Public registration is permanently disabled.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus size={16} />
          <span>Add Staff / Manager</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading user accounts...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                  </td>

                  <td>{getRoleBadge(u.role)}</td>

                  <td>
                    <span className="status-badge status-active">
                      <CheckCircle size={12} /> Active
                    </span>
                  </td>

                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <UserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
