import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_META = {
  placed:    { label: 'Placed',    color: 'var(--blue)',        bg: 'rgba(59,130,246,0.12)',  icon: '📋', next: 'preparing', nextLabel: '👨‍🍳 Start Preparing' },
  preparing: { label: 'Preparing', color: 'var(--yellow)',      bg: 'rgba(245,158,11,0.12)',  icon: '👨‍🍳', next: 'ready',     nextLabel: '✅ Mark Ready' },
  ready:     { label: 'Ready!',    color: 'var(--green)',       bg: 'var(--green-dim)',       icon: '✅', next: 'completed', nextLabel: '✓ Complete' },
  completed: { label: 'Completed', color: 'var(--text-muted)',  bg: 'var(--bg-elevated)',     icon: '✓',  next: null },
  cancelled: { label: 'Cancelled', color: 'var(--red)',         bg: 'var(--red-dim)',         icon: '✕',  next: null },
};

const FILTERS = ['all', 'placed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function OwnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get(`/orders?status=${filter}`);
      setOrders(data.orders || []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await API.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      toast.success(`Order marked as ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(null); }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    await updateStatus(orderId, 'cancelled');
  };

  const formatTime = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const activeCount = orders.filter(o => ['placed', 'preparing'].includes(o.status)).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <button onClick={() => navigate('/owner/dashboard')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <h2 style={{ fontSize: 20 }}>Order Management</h2>
            {activeCount > 0 && <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{activeCount} active orders need attention</p>}
          </div>
          <button onClick={fetchOrders} style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↻</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              whiteSpace: 'nowrap', border: '1.5px solid', transition: 'all var(--transition)',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
              background: filter === f ? 'var(--accent-dim)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {f === 'all' ? 'All' : STATUS_META[f]?.label} {f === 'all' ? `(${orders.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16, marginBottom: 14 }} />)
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3>No {filter !== 'all' ? filter : ''} orders</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>New orders will appear here automatically</p>
          </div>
        ) : orders.map(order => {
          const meta = STATUS_META[order.status] || {};
          const isUpdating = updating === order._id;
          const isActive = ['placed', 'preparing'].includes(order.status);

          return (
            <div key={order._id} style={{
              background: 'var(--bg-card)', borderRadius: 18, marginBottom: 16,
              border: `1.5px solid ${isActive ? 'var(--border-accent)' : 'var(--border)'}`,
              overflow: 'hidden',
              boxShadow: isActive ? '0 4px 20px rgba(255,107,53,0.08)' : 'none'
            }}>
              {/* Card header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>#{order.orderNumber}</span>
                    {isActive && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 700 }}>ACTIVE</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    👤 {order.customer?.name}
                    {order.customer?.collegeId && ` · ${order.customer.collegeId}`}
                    {' · '}{formatTime(order.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', display: 'block', marginTop: 4 }}>₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < order.items.length - 1 ? 8 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-dim)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>{item.quantity}</span>
                      <span style={{ fontSize: 14 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {order.specialInstructions && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)' }}>
                    📝 {order.specialInstructions}
                  </div>
                )}
              </div>

              {/* Payment */}
              <div style={{ padding: '8px 16px', borderBottom: meta.next ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{order.paymentMethod === 'cash' ? '💵' : order.paymentMethod === 'upi' ? '📱' : order.paymentMethod === 'card' ? '💳' : '👛'}</span>
                <span style={{ fontSize: 13, color: order.paymentMethod !== 'cash' ? 'var(--green)' : 'var(--text-muted)' }}>
                  {order.paymentMethod === 'cash' ? 'Cash on Pickup' : `Paid via ${order.paymentMethod?.toUpperCase()}`} — ₹{order.totalAmount}
                </span>
              </div>

              {/* Actions */}
              {meta.next && (
                <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => updateStatus(order._id, meta.next)}
                    disabled={isUpdating}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '11px', fontSize: 14 }}
                  >
                    {isUpdating ? '⏳ Updating...' : meta.nextLabel}
                  </button>
                  {order.status === 'placed' && (
                    <button onClick={() => cancelOrder(order._id)} disabled={isUpdating} className="btn btn-danger btn-sm" style={{ padding: '11px 16px' }}>
                      ✕ Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingBottom: 16 }}>
        🔄 Auto-refreshing every 12 seconds
      </p>
    </div>
  );
}
