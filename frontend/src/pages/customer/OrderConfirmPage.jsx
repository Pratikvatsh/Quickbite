import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [confettiItems] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: ['#ff6b35', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][i % 6],
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }))
  );

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => navigate('/home'));
  }, [id, navigate]);

  if (!order) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48, animation: 'pulse 1s ease infinite' }}>🍔</div>
      <p style={{ color: 'var(--text-muted)' }}>Loading your order...</p>
    </div>
  );

  const payWithCard = order.paymentMethod === 'card';
  const payWithUPI = order.paymentMethod === 'upi';
  const payWithWallet = order.paymentMethod === 'wallet';
  const isPaid = payWithCard || payWithUPI || payWithWallet;

  return (
    <div className="page-with-nav" style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 20px rgba(52,211,153,0.3); }
          50% { box-shadow: 0 0 40px rgba(52,211,153,0.6); }
        }
      `}</style>

      {/* Confetti */}
      {confettiItems.map(c => (
        <div key={c.id} style={{
          position: 'fixed', top: 0, left: `${c.left}%`, width: c.size, height: c.size,
          background: c.color, borderRadius: Math.random() > 0.5 ? '50%' : 2,
          animation: `confettiFall ${c.duration}s ${c.delay}s ease-in both`,
          zIndex: 999, pointerEvents: 'none'
        }} />
      ))}

      {/* Header gradient */}
      <div style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, transparent 100%)', padding: '48px 16px 32px', textAlign: 'center' }}>
        <div className="container">
          {/* Big checkmark */}
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52, margin: '0 auto 20px',
            animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, glow 2s 0.8s ease infinite',
            boxShadow: '0 8px 32px rgba(34,197,94,0.4)'
          }}>✅</div>

          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6, animation: 'slideUp 0.5s 0.3s both' }}>
            Order Confirmed! 🎉
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, animation: 'slideUp 0.5s 0.4s both' }}>
            {isPaid ? 'Paid & confirmed! Your food is being prepared.' : 'Your order has been sent to the canteen.'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '0 16px' }}>

        {/* Order Number Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), #ff3d00)',
          borderRadius: 20, padding: '20px 24px', marginBottom: 16,
          textAlign: 'center', animation: 'slideUp 0.5s 0.5s both',
          boxShadow: '0 8px 32px rgba(255,107,53,0.35)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Order Number</p>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-2px', lineHeight: 1 }}>
            #{order.orderNumber}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 }}>Show this number at the counter</p>
        </div>

        {/* Status + Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, animation: 'slideUp 0.5s 0.6s both' }}>
          <div className="glass-panel" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>⏱</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{order.estimatedTime}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>MINUTES EST.</div>
          </div>
          <div className="glass-panel" style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{isPaid ? '💳' : '💵'}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: isPaid ? 'var(--green)' : 'var(--accent)' }}>{isPaid ? 'PAID' : 'PAY AT COUNTER'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>₹{order.totalAmount}</div>
          </div>
        </div>

        {/* Payment Status Banner */}
        <div style={{
          background: isPaid ? 'rgba(34,197,94,0.1)' : 'var(--accent-dim)',
          border: `1px solid ${isPaid ? 'rgba(34,197,94,0.25)' : 'var(--border-accent)'}`,
          borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          display: 'flex', gap: 12, alignItems: 'center',
          animation: 'slideUp 0.5s 0.7s both'
        }}>
          <span style={{ fontSize: 30 }}>{isPaid ? '🎊' : '💵'}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: isPaid ? 'var(--green)' : 'var(--accent)' }}>
              {isPaid ? 'Payment Received' : 'Pay at Counter'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {isPaid
                ? `₹${order.totalAmount} paid via ${order.paymentMethod?.toUpperCase() || 'online'}`
                : `Please pay ₹${order.totalAmount} in cash when collecting your food`}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="glass-panel" style={{ padding: 16, marginBottom: 16, animation: 'slideUp 0.5s 0.8s both' }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🍽️ Your Order</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>×{item.quantity}</span>
              </div>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="divider" style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Live Order Progress */}
        <div className="glass-panel" style={{ padding: 16, marginBottom: 24, animation: 'slideUp 0.5s 0.9s both' }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📍 Order Progress</p>
          {[
            { label: 'Order Placed', done: true, icon: '✅' },
            { label: 'Preparing your food', done: true, icon: '👨‍🍳' },
            { label: 'Ready for pickup', done: false, icon: '🔔' },
            { label: 'Picked up', done: false, icon: '🎉' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 16 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: step.done ? 'var(--green)' : 'var(--bg-elevated)', border: `2px solid ${step.done ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {step.done ? '✓' : step.icon}
              </div>
              {i < 3 && <div style={{ position: 'absolute', left: 50, height: 16, width: 2, background: step.done ? 'var(--green)' : 'var(--border)' }} />}
              <span style={{ fontSize: 14, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step.done ? 700 : 400 }}>{step.label}</span>
              {step.done && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>DONE</span>}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideUp 0.5s 1s both' }}>
          <button onClick={() => navigate(`/order-tracking/${order._id}`)} className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 20px rgba(255,107,53,0.35)' }}>
            📍 Track My Order Live
          </button>
          <button onClick={() => navigate('/menu')} className="btn btn-ghost">
            🍔 Order More Food
          </button>
          <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: 8 }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
