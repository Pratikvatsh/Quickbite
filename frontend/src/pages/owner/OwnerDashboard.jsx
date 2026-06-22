import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 18, flex: 1, minWidth: 0
  }}>
    <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color: color || 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: color || 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </div>
);

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          API.get('/orders/stats/dashboard'),
          API.get('/orders/all?status=all')
        ]);
        setStats(statsRes.data.stats);
        setRecentOrders((ordersRes.data.orders || []).slice(0, 5));
      } finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const STATUS_META = {
    placed:    { color: 'var(--blue)',   label: 'Placed' },
    preparing: { color: 'var(--yellow)', label: 'Preparing' },
    ready:     { color: 'var(--green)',  label: 'Ready' },
    completed: { color: 'var(--text-muted)', label: 'Done' },
    cancelled: { color: 'var(--red)',    label: 'Cancelled' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 }}>
      {/* Owner top bar */}
      <div style={{
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>
            Quick<span style={{ color: 'var(--accent)' }}>Bite</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>Owner Panel</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #ff3d00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
            {user?.name?.charAt(0)}
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600, fontSize: 13 }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Welcome back 👋</p>
          <h2 style={{ fontSize: 24 }}>{user?.name}</h2>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <StatCard icon="📋" label="Total Orders" value={stats.totalOrders} color="var(--blue)" />
            <StatCard icon="🌅" label="Today's Orders" value={stats.todayOrders} color="var(--yellow)" />
            <StatCard icon="🔥" label="Active Orders" value={stats.activeOrders} color="var(--accent)" sub={stats.activeOrders > 0 ? 'Need attention!' : 'All clear ✓'} />
            <StatCard icon="💰" label="Revenue" value={`₹${stats.revenue}`} color="var(--green)" />
          </div>
        )}

        {/* Quick actions */}
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { icon: '📦', label: 'Manage Orders', sub: 'View & update', path: '/owner/orders', color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)' },
            { icon: '🍽️', label: 'Menu Items', sub: 'Add/edit food', path: '/owner/menu', color: 'var(--green)', bg: 'var(--green-dim)' },
            { icon: '➕', label: 'Add Item', sub: 'New menu item', path: '/owner/menu/add', color: 'var(--accent)', bg: 'var(--accent-dim)' },
            { icon: '📊', label: 'Active Orders', sub: `${stats?.activeOrders || 0} pending`, path: '/owner/orders?status=placed', color: 'var(--yellow)', bg: 'rgba(245,158,11,0.12)' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              padding: 18, borderRadius: 16,
              background: a.bg, border: `1px solid ${a.color}30`,
              textAlign: 'left', cursor: 'pointer', transition: 'all var(--transition)'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: a.color }}>{a.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.sub}</p>
            </button>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }}>Recent Orders</h3>
          <button onClick={() => navigate('/owner/orders')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>View all →</button>
        </div>

        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 12, marginBottom: 10 }} />)
        ) : recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
            <p>No orders yet today. Menu is live!</p>
          </div>
        ) : recentOrders.map(order => {
          const meta = STATUS_META[order.status] || {};
          return (
            <div key={order._id} onClick={() => navigate('/owner/orders')} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '12px 16px', marginBottom: 10, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all var(--transition)'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>#{order.orderNumber}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.customer?.name}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {order.items.length} items · ₹{order.totalAmount}
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, padding: '3px 10px', background: `${meta.color}18`, borderRadius: 999 }}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
