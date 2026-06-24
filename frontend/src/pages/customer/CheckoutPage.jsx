import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const METHODS = [
  { id: 'upi',    label: 'UPI / QR Code',       icon: '📱', sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card',   label: 'Credit / Debit Card',  icon: '💳', sub: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'Wallet',               icon: '👛', sub: 'Paytm, Amazon Pay, Mobikwik' },
  { id: 'cash',   label: 'Cash on Pickup',       icon: '💵', sub: 'Pay at the counter' },
];

/* ── Realistic UPI QR SVG ── */
function UPIQRCode({ amount }) {
  // Deterministic QR-like pattern using a seeded array
  const seed = amount * 37 + 13;
  const size = 21;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size), c = i % size;
    // Finder patterns (top-left, top-right, bottom-left)
    const inFinder = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
    if (inFinder) {
      const dr = r < 7 ? r : r - (size - 7);
      const dc = c < 7 ? c : c - (size - 7);
      if (r < 7 && c >= size - 7) { const dr2 = r; const dc2 = c - (size - 7); return (dr2 === 0 || dr2 === 6 || dc2 === 0 || dc2 === 6) || (dr2 >= 2 && dr2 <= 4 && dc2 >= 2 && dc2 <= 4); }
      return (dr === 0 || dr === 6 || dc === 0 || dc === 6) || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    }
    // Timing patterns
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    // Data modules (pseudo-random)
    const v = (i * 2654435761 + seed) >>> 0;
    return (v % 3) !== 0;
  });

  const moduleSize = 8;
  const qrSize = size * moduleSize;

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 12, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      {/* UPI Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ background: '#5f259f', borderRadius: 4, padding: '2px 6px', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>UPI</div>
        <div style={{ height: 14, width: 1, background: '#ddd' }} />
        <span style={{ fontSize: 10, color: '#555', fontWeight: 600 }}>Scan &amp; Pay</span>
      </div>

      {/* SVG QR */}
      <svg width={qrSize} height={qrSize} viewBox={`0 0 ${qrSize} ${qrSize}`} style={{ display: 'block' }}>
        <rect width={qrSize} height={qrSize} fill="#fff" />
        {cells.map((on, i) => {
          if (!on) return null;
          const r = Math.floor(i / size), c = i % size;
          return <rect key={i} x={c * moduleSize} y={r * moduleSize} width={moduleSize} height={moduleSize} fill="#000" />;
        })}
        {/* centre logo overlay */}
        <rect x={qrSize / 2 - 14} y={qrSize / 2 - 14} width={28} height={28} rx={4} fill="#fff" />
        <rect x={qrSize / 2 - 10} y={qrSize / 2 - 10} width={20} height={20} rx={3} fill="#5f259f" />
        <text x={qrSize / 2} y={qrSize / 2 + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">₹</text>
      </svg>

      {/* Amount */}
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>₹{amount}</div>
        <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>quickbite@upi</div>
      </div>

      {/* UPI app logos row */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
        {[['#1a73e8','G'], ['#5f259f','P'], ['#00b9f1','T'], ['#004B87','B']].map(([bg, letter], idx) => (
          <div key={idx} style={{ width: 24, height: 24, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{letter}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Payment Modal ── */
function PaymentModal({ method, amount, onSuccess, onClose }) {
  const [step, setStep] = useState('input');
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const processPayment = () => {
    setStep('processing');
    setTimeout(() => { setStep('success'); setTimeout(onSuccess, 1400); }, 2600);
  };

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  /* Processing */
  if (step === 'processing') return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: '5px solid var(--accent)', borderTopColor: 'transparent', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Processing Payment…</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Please do not close this screen</p>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #ff3d00)', borderRadius: 99, animation: 'progress 2.6s linear forwards' }} />
          </div>
        </div>
      </div>
    </div>
  );

  /* Success */
  if (step === 'success') return (
    <div style={overlayStyle}>
      <div style={sheetStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 72, marginBottom: 12, animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>✅</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginBottom: 6 }}>Payment Successful!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>₹{amount} paid via {method.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );

  /* ── Input forms ── */
  return (
    <div style={overlayStyle}>
      {/* Sheet — content scrolls, button is FIXED to viewport bottom */}
      <div style={{ ...sheetStyle, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {method === 'upi' ? '📱 Pay via UPI' : method === 'card' ? '💳 Card Details' : '👛 Pay via Wallet'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Scrollable content — extra bottom padding so content isn't hidden behind fixed button */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: method !== 'wallet' ? 90 : 8 }}>

          {/* ── UPI ── */}
          {method === 'upi' && (
            <div>
              {/* Compact layout: QR left, UPI input right on wide screens, stacked on small */}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <UPIQRCode amount={amount} compact />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or enter UPI ID</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <input
                placeholder="yourname@upi  /  9876543210@ybl"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                style={{ marginBottom: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 0 }}>
                Scan QR with any UPI app, or type your UPI ID above.
              </p>
            </div>
          )}

          {/* ── CARD ── */}
          {method === 'card' && (
            <div>
              {/* Card visual */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: '20px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,107,53,0.15)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -30, right: 20, width: 80, height: 80, background: 'rgba(255,107,53,0.08)', borderRadius: '50%' }} />
                <div style={{ fontSize: 10, opacity: 0.55, marginBottom: 14, letterSpacing: '0.12em' }}>CREDIT / DEBIT CARD</div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.18em', marginBottom: 18, fontFamily: 'monospace' }}>{cardNo || '•••• •••• •••• ••••'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 9, opacity: 0.5, marginBottom: 2 }}>CARD HOLDER</div><div style={{ fontSize: 13, fontWeight: 600 }}>{cardName || 'YOUR NAME'}</div></div>
                  <div><div style={{ fontSize: 9, opacity: 0.5, marginBottom: 2 }}>EXPIRES</div><div style={{ fontSize: 13, fontWeight: 600 }}>{expiry || 'MM/YY'}</div></div>
                </div>
              </div>
              {[
                { ph: 'Card Number', val: cardNo, set: e => setCardNo(formatCard(e.target.value)), mono: true },
                { ph: 'Card Holder Name', val: cardName, set: e => setCardName(e.target.value) },
              ].map(f => (
                <input key={f.ph} placeholder={f.ph} value={f.val} onChange={f.set}
                  style={{ marginBottom: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: f.mono ? 'monospace' : 'inherit' }} />
              ))}
              <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                <input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'monospace' }} />
                <input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} type="password" style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
            </div>
          )}

          {/* ── WALLET ── */}
          {method === 'wallet' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Choose your wallet to pay ₹{amount}:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[['🟦', 'Paytm'], ['🟨', 'Amazon Pay'], ['🟪', 'PhonePe'], ['🟥', 'Freecharge']].map(([icon, name]) => (
                  <button key={name} onClick={processPayment}
                    style={{ padding: '16px 8px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'center', color: 'var(--text-primary)' }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>You will be redirected to the wallet app</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pay button FIXED to bottom of SCREEN — always visible no matter what ── */}
      {method !== 'wallet' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 20px 28px',
          background: 'rgba(10,10,15,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 1100,
        }}>
          <button
            onClick={processPayment}
            disabled={
              (method === 'upi' && !upiId.trim()) ||
              (method === 'card' && (cardNo.length < 19 || !expiry || cvv.length < 3 || !cardName))
            }
            style={{
              width: '100%', padding: '16px 0', borderRadius: 14,
              background: 'linear-gradient(135deg, #ff6b35, #ff3d00)',
              color: '#fff', border: 'none', fontSize: 17, fontWeight: 900,
              cursor: 'pointer', letterSpacing: '0.02em',
              boxShadow: '0 4px 24px rgba(255,107,53,0.5)',
              opacity: ((method === 'upi' && !upiId.trim()) || (method === 'card' && (cardNo.length < 19 || !expiry || cvv.length < 3 || !cardName))) ? 0.4 : 1,
              transition: 'opacity 0.2s, transform 0.1s',
            }}>
            {method === 'upi' ? `📱  Pay ₹${amount} via UPI` : `💳  Pay ₹${amount} Securely`}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>🔒 256-bit SSL encrypted · 100% secure</p>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
  zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
};
const sheetStyle = {
  background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
  padding: '22px 20px 28px', width: '100%', maxWidth: 500,
  border: '1px solid var(--border)', borderBottom: 'none',
};

/* ── Main Checkout Page ── */
export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [savedAmount, setSavedAmount] = useState(0);
  const items = cart.items || [];

  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await API.post('/orders', { specialInstructions: instructions, paymentMethod: selectedMethod });
      setOrderId(data.order._id);
      setSavedAmount(cart.totalAmount);
      // Refresh cart to show it's now empty
      await fetchCart();
      if (selectedMethod === 'cash') {
        toast.success('Order placed! 🎉');
        navigate(`/order-confirm/${data.order._id}`);
      } else {
        setShowPayModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const onPaymentSuccess = () => {
    setShowPayModal(false);
    toast.success('Payment successful! 🎉');
    navigate(`/order-confirm/${orderId}`);
  };

  return (
    <div className="page page-with-nav container" style={{ padding: '16px 16px 100px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
        @keyframes scaleIn { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Checkout</h2>

      {/* ── Your Details ── */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Details</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #ff3d00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</p>
            {user?.collegeId && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>ID: {user.collegeId}</p>}
          </div>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Order Summary</p>
        {items.map(item => item.foodItem && (
          <div key={item.foodItem._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`veg-dot ${item.foodItem.isVeg ? 'veg' : 'nonveg'}`} style={{ width: 12, height: 12 }} />
              <span>{item.foodItem.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
            </div>
            <span style={{ fontWeight: 600 }}>₹{item.foodItem.price * item.quantity}</span>
          </div>
        ))}
        <div className="divider" style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
          <span>Total</span>
          <span style={{ color: 'var(--accent)' }}>₹{cart.totalAmount}</span>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Payment Method</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {METHODS.map(m => (
            <div key={m.id} onClick={() => setSelectedMethod(m.id)}
              className="glass-panel"
              style={{
                background: selectedMethod === m.id ? 'var(--accent-dim)' : undefined,
                borderColor: selectedMethod === m.id ? 'var(--accent)' : undefined,
                borderRadius: 14, padding: '13px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s'
              }}>
              <span style={{ fontSize: 26, width: 36, textAlign: 'center' }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.sub}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedMethod === m.id ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedMethod === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Special Instructions ── */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Special Instructions</p>
        <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
          placeholder="No onions, extra spicy, less oil..." rows={2}
          style={{ resize: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }} />
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <div className="sticky-cta" style={{ padding: '12px 16px 24px', background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}>
        <div className="bar-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)' }}>₹{cart.totalAmount}</div>
          </div>
          <button onClick={handleCheckout} disabled={placing || items.length === 0}
            style={{ flex: 1, padding: '15px 0', borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), #ff3d00)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,53,0.4)', letterSpacing: '0.02em' }}>
            {placing ? '⏳ Placing...' : selectedMethod === 'cash' ? '📦 Place Order' : `💳 Pay ₹${cart.totalAmount}`}
          </button>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPayModal && orderId && (
        <PaymentModal method={selectedMethod} amount={savedAmount || 0} onSuccess={onPaymentSuccess} onClose={() => setShowPayModal(false)} />
      )}
    </div>
  );
}
