// Disha Sarathi - Admin User & RBAC Management (PS 26097)
import React, { useState, useEffect } from 'react';
import { createUser, getAllUsers, resetUserPassword, setUserRole, setUserStatus, UserAccount, UserRole } from '../../core/auth';

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('BENEFICIARY');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDistrict, setNewDistrict] = useState('Pune');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const list = getAllUsers();
    setUsers([...list]);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createUser({
        username: newUsername,
        name: newName,
        role: newRole,
        phone: newPhone,
        email: newEmail,
        district: newDistrict
      });
      setMsg(`✅ वापरकर्ता "${newUsername}" यशस्वीरित्या तयार केला!`);
      setShowAddModal(false);
      setNewUsername('');
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      loadUsers();
    } catch (err: any) {
      alert(`त्रुटी: ${err.message}`);
    }
  };

  const handleToggleStatus = (user: UserAccount) => {
    const nextStatus = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    setUserStatus(user.id, nextStatus);
    setMsg(`वापरकर्ता ${user.username} ची स्थिती ${nextStatus} केली.`);
    loadUsers();
  };

  const handleChangeRole = (userId: string, role: UserRole) => {
    setUserRole(userId, role);
    setMsg(`भूमिका ${role} म्हणून अद्ययावत केली.`);
    loadUsers();
  };

  const handleResetPass = (username: string) => {
    const res = resetUserPassword(username);
    alert(res.message);
  };

  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      u.username.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      (u.district && u.district.toLowerCase().includes(term));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="users-management-page" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="demo-pill" style={{ marginBottom: '6px' }}>
            System Administration • User & Role Management
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
            👥 वापरकर्ता व प्रवेश नियंत्रण व्यवस्थापन (User Management)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            लाभार्थी, GIA समन्वयक आणि प्रशासकीय खात्यांची निर्मिती, भूमिका व सक्रियता नियंत्रण.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => setShowAddModal(true)}
        >
          + नवीन वापरकर्ता जोडा (Add User)
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', background: '#E8F3ED', color: '#1F6F4A', borderRadius: '8px', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="app-input"
            style={{ flex: 1, minWidth: '220px' }}
            placeholder="वापरकर्ता नाव, नाव, फोन किंवा जिल्हा शोधा..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="app-input"
            style={{ width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">सर्व भूमिका (All Roles)</option>
            <option value="BENEFICIARY">लाभार्थी (Beneficiary)</option>
            <option value="COORDINATOR">GIA समन्वयक (Coordinator)</option>
            <option value="ADMIN">प्रशासक (Admin)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="dash-card" style={{ background: '#FFFFFF', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--stone)', display: 'flex', justifyContent: 'space-between' }}>
          <strong>नोंदणीकृत वापरकर्ते संख्या: {filtered.length}</strong>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="app-table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>वापरकर्ता नाव / ID</th>
                <th>पूर्ण नाव</th>
                <th>भूमिका (Role)</th>
                <th>संपर्क व जिल्हा</th>
                <th>स्थिती</th>
                <th>शेवटचे लॉगिन</th>
                <th>कृती</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong><code>{user.username}</code></strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{user.id}</div>
                  </td>
                  <td><strong>{user.name}</strong></td>
                  <td>
                    <select
                      className="app-input"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                    >
                      <option value="BENEFICIARY">BENEFICIARY</option>
                      <option value="COORDINATOR">COORDINATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <div>📞 {user.phone || 'N/A'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>📍 {user.district || 'Pune'}</div>
                  </td>
                  <td>
                    <span
                      className="meta-tag"
                      style={{
                        background: user.status === 'INACTIVE' ? '#F7E9E8' : '#E8F3ED',
                        color: user.status === 'INACTIVE' ? '#A8322D' : '#1F6F4A',
                        fontWeight: 800
                      }}
                    >
                      ● {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-ctrl"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === 'INACTIVE' ? 'सक्रिय करा' : 'निष्क्रिय करा'}
                      </button>
                      <button
                        type="button"
                        className="btn-ctrl"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => handleResetPass(user.username)}
                      >
                        पासवर्ड रीसेट
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(20,32,26,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="modal-dialog dash-card" style={{ background: '#FFFFFF', maxWidth: '480px', width: '100%', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>+ नवीन वापरकर्ता खाते तयार करा</h3>
              <button type="button" className="btn-ctrl" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">वापरकर्ता नाव (Username):</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="e.g. rohit.coordinator"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">पूर्ण नाव (Full Name):</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="e.g. Rohit Kamble"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">भूमिका (Role):</label>
                <select
                  className="app-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  <option value="BENEFICIARY">लाभार्थी (Beneficiary)</option>
                  <option value="COORDINATOR">GIA समन्वयक (Coordinator)</option>
                  <option value="ADMIN">प्रशासक (Admin)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">मोबाईल नंबर (Phone):</label>
                <input
                  type="text"
                  className="app-input"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">जिल्हा (District):</label>
                <input
                  type="text"
                  className="app-input"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  रद्द करा
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  खाते तयार करा (Create User)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
