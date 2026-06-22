import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

const STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Canteen is preparing your food' },
  { key: 'ready', label: 'Ready for Pickup', icon: '✅', desc: 'Your order is ready! Head to the counter' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data.order);
    } catch { navigate('/orders'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return (
    <div className="page page-with-nav" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'bounce 1s ease infinite' }}>🍔</div>
      <p style={{ color: 'var(--text-secondary)' }}>Loading order...</p>
    </div>
  );

  if (!order) return null;

  const currentIdx = STATUSES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';

  const statusColor = {
    placed: 'var(--blue)',
    preparing: 'var(--yellow)',
    ready: 'var(--green)',
    completed: 'var(--text-muted)',
    cancelled: 'var(--red)',
  }[order.status] || 'var(--accent)';

  return (
    <div className="page page-with-nav" style={{ padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Order Number</p>
        <h1 style={{ fontSize: 36, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
          #{order.orderNumber}
        </h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 14px', borderRadius: 999, background: `${statusColor}20`, border: `1px solid ${statusColor}50` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, animation: order.status !== 'ready' && !isCancelled && !isCompleted ? 'pulse 1.5s ease infinite' : 'none' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, textTransform: 'capitalize' }}>{order.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && !isCompleted && (
        <div style={{ background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '24px 20px', marginBottom: 20 }}>
          {STATUSES.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} style={{ display: 'flex', gap: 16, marginBottom: i < STATUSES.length - 1 ? 0 : 0 }}>
                {/* Left: icon + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    background: done ? (active ? 'var(--accent)' : 'var(--green-dim)') : 'var(--bg-elevated)',
                    border: `2px solid ${done ? (active ? 'var(--accent)' : 'var(--green)') : 'var(--border)'}`,
                    boxShadow: active ? '0 0 20px var(--accent-glow)' : 'none',
                    transition: 'all 0.4s ease',
                    animation: active ? 'glow 2s ease infinite' : 'none'
                  }}>
                    {done && !active ? '✓' : s.icon}
                  </div>
                  {i < STATUSES.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 32,
                      background: i < currentIdx ? 'var(--green)' : 'var(--border)',
                      margin: '4px 0', transition: 'background 0.4s ease'
                    }} />
                  )}
                </div>

                {/* Right: text */}
                <div style={{ paddingBottom: i < STATUSES.length - 1 ? 24 : 0, paddingTop: 10, flex: 1 }}>
                  <p style={{ fontWeight: active ? 700 : 600, fontSize: 15, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</p>
                  <p style={{ fontSize: 13, color: active ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: 2 }}>{s.desc}</p>
                  {active && order.estimatedTime && s.key !== 'ready' && (
                    <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent-dim)', borderRadius: 999 }}>
                      <span style={{ fontSize: 12 }}>⏱</span>
                      <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>~{order.estimatedTime} mins</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ready! Banner */}
      {order.status === 'ready' && (
        <div style={{
          background: 'var(--green-dim)', border: '1.5px solid var(--green)',
          borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center',
          animation: 'glow 2s ease infinite'
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={{ color: 'var(--green)', marginBottom: 6 }}>Your order is ready!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Please head to the canteen counter and pay ₹{order.totalAmount} in cash.</p>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>❌</div>
          <h2 style={{ color: 'var(--red)', marginBottom: 4 }}>Order Cancelled</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your order was cancelled. Please contact the canteen.</p>
        </div>
      )}

      {/* Order details */}
      <div style={{ background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Order Items</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.image && (
                <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>×{item.quantity} · ₹{item.price} each</p>
              </div>
            </div>
            <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17 }}>
          <span>Total to pay</span>
          <span style={{ color: 'var(--accent)' }}>₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Payment pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,107,53,0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 12, marginBottom: 24, border: '1px solid rgba(255,107,53,0.2)' }}>
        <span style={{ fontSize: 22 }}>💵</span>
        <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>Cash on Pickup — Pay at counter</span>
      </div>

      {/* Polling indicator */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
        🔄 Auto-refreshing every 10 seconds
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/orders')} className="btn btn-ghost" style={{ flex: 1 }}>Order History</button>
        <button onClick={() => navigate('/home')} className="btn btn-primary" style={{ flex: 1 }}>Home</button>
      </div>
    </div>
  );
}
