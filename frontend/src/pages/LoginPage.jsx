import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | signup
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', collegeId: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password, role);
        toast.success(`Welcome back! 👋`);
        navigate(role === 'owner' ? '/owner/dashboard' : '/home');
      } else {
        await register({ ...form, role });
        toast.success('Account created! Welcome to QuickBite 🎉');
        navigate(role === 'owner' ? '/owner/dashboard' : '/home');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(255,107,53,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,107,53,0.05) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), #ff3d00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, margin: '0 auto 16px',
            boxShadow: '0 12px 40px rgba(255,107,53,0.35)'
          }}>🍔</div>
          <h1 style={{ fontSize: 32, letterSpacing: '-0.5px' }}>
            Quick<span style={{ color: 'var(--accent)' }}>Bite</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 28, boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>I am a</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { value: 'customer', label: 'Student', icon: '🎓', desc: 'Order food' },
                { value: 'owner', label: 'Shop Owner', icon: '👨‍🍳', desc: 'Manage orders' }
              ].map(r => (
                <button key={r.value} onClick={() => setRole(r.value)} style={{
                  padding: '14px 12px', borderRadius: 12, border: '2px solid',
                  borderColor: role === r.value ? 'var(--accent)' : 'var(--border)',
                  background: role === r.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                  color: role === r.value ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all var(--transition)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 10, padding: 4, marginBottom: 22 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '9px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                transition: 'all var(--transition)'
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Full Name</label>
                <input name="name" placeholder="Arjun Kumar" value={form.name} onChange={handle} required />
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handle} required />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required minLength={6} />
            </div>

            {mode === 'signup' && role === 'customer' && (
              <>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Phone (optional)</label>
                  <input name="phone" placeholder="9876543210" value={form.phone} onChange={handle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>College ID (optional)</label>
                  <input name="collegeId" placeholder="CS2024001" value={form.collegeId} onChange={handle} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 6, width: '100%' }} disabled={loading}>
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Demo credentials:</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🎓 Student: student@quickbite.com</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>👨‍🍳 Owner: owner@quickbite.com</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Password: password123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
