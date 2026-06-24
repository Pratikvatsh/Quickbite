import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const STATUS_META = {
  placed:    { label: 'Placed',    color: 'var(--blue)',        bg: 'rgba(59,130,246,0.12)',  icon: '📋' },
  preparing: { label: 'Preparing', color: 'var(--yellow)',      bg: 'rgba(245,158,11,0.12)',  icon: '👨‍🍳' },
  ready:     { label: 'Ready!',    color: 'var(--green)',       bg: 'var(--green-dim)',       icon: '✅' },
  completed: { label: 'Completed', color: 'var(--text-muted)',  bg: 'var(--bg-elevated)',     icon: '✓' },
  cancelled: { label: 'Cancelled', color: 'var(--red)',         bg: 'var(--red-dim)',         icon: '✕' },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/orders/my-orders')
      .then(r => setOrders(r.data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="page page-with-nav container" style={{ padding: '20px 16px' }}>
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 14 }} />
      ))}
    </div>
  );

  return (
    <div className="page page-with-nav container" style={{ padding: '20px 16px 100px' }}>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>Order History</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Your order history will appear here.</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary">Browse Menu</button>
        </div>
      ) : orders.map(order => {
        const meta = STATUS_META[order.status] || STATUS_META.placed;
        const active = ['placed', 'preparing', 'ready'].includes(order.status);
        return (
          <div key={order._id} onClick={() => navigate(active ? `/order-tracking/${order._id}` : `/order-tracking/${order._id}`)}
            className="card" style={{ marginBottom: 14, padding: 16, cursor: 'pointer', borderColor: active ? 'var(--border-accent)' : 'var(--border)' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>#{order.orderNumber}</span>
                  {active && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 700 }}>LIVE</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  color: meta.color, background: meta.bg
                }}>{meta.icon} {meta.label}</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Items preview */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {order.items.slice(0, 3).map((item, i) => (
                <span key={i} style={{ fontSize: 12, padding: '3px 10px', background: 'rgba(30,30,42,0.5)', backdropFilter: 'blur(8px)', borderRadius: 999, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {item.name} ×{item.quantity}
                </span>
              ))}
              {order.items.length > 3 && (
                <span style={{ fontSize: 12, padding: '3px 10px', background: 'rgba(30,30,42,0.5)', backdropFilter: 'blur(8px)', borderRadius: 999, color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  +{order.items.length - 3} more
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>💵</span> Cash on Pickup
              </span>
              <span style={{ fontSize: 12, color: active ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                {active ? 'Track order →' : 'View details →'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
