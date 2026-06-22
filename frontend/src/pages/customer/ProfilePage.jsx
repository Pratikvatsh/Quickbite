import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', collegeId: user?.collegeId || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePw = e => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await API.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setShowPw(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const doLogout = () => { logout(); navigate('/login'); };

  const avatarLetter = user?.name?.charAt(0).toUpperCase();

  return (
    <div className="page page-with-nav" style={{ padding: '20px 16px 100px' }}>

      {/* Avatar header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
          background: 'linear-gradient(135deg, var(--accent), #ff3d00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, fontWeight: 800, color: '#fff',
          boxShadow: '0 8px 30px var(--accent-glow)'
        }}>{avatarLetter}</div>
        <h2 style={{ fontSize: 22 }}>{user?.name}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
        <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 12px', background: 'var(--accent-dim)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
          🎓 Student
        </span>
      </div>

      {/* Profile card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 16 }}>Personal Info</h3>
          <button onClick={() => setEditing(!editing)} style={{
            padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: editing ? 'var(--red-dim)' : 'var(--accent-dim)',
            color: editing ? 'var(--red)' : 'var(--accent)',
            border: `1px solid ${editing ? 'rgba(239,68,68,0.2)' : 'var(--border-accent)'}`,
          }}>{editing ? 'Cancel' : '✏️ Edit'}</button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
              <input name="name" value={form.name} onChange={handle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="9876543210" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>College ID</label>
              <input name="collegeId" value={form.collegeId} onChange={handle} placeholder="CS2024001" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Name', value: user?.name, icon: '👤' },
              { label: 'Email', value: user?.email, icon: '📧' },
              { label: 'Phone', value: user?.phone || 'Not set', icon: '📱' },
              { label: 'College ID', value: user?.collegeId || 'Not set', icon: '🎓' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: f.value === 'Not set' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change password */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16 }}>🔒 Change Password</h3>
          <button onClick={() => setShowPw(!showPw)} style={{
            padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}>{showPw ? 'Cancel' : 'Change'}</button>
        </div>

        {showPw && (
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
              <div key={field}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  {['Current Password', 'New Password', 'Confirm New Password'][i]}
                </label>
                <input type="password" name={field} value={pwForm[field]} onChange={handlePw} placeholder="••••••••" />
              </div>
            ))}
            <button onClick={changePassword} disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: 8, marginBottom: 16 }}>
        {[
          { icon: '📋', label: 'My Orders', sub: 'View order history', action: () => navigate('/orders') },
          { icon: '🍽️', label: 'Menu', sub: 'Browse canteen menu', action: () => navigate('/menu') },
        ].map((item, i) => (
          <button key={i} onClick={item.action} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px',
            background: 'none', border: 'none', borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
            color: 'var(--text-primary)', cursor: 'pointer', borderRadius: 10,
            transition: 'background var(--transition)'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.sub}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={doLogout} className="btn btn-danger" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
        🚪 Sign Out
      </button>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        QuickBite v1.0 · Campus Canteen System
      </p>
    </div>
  );
}
