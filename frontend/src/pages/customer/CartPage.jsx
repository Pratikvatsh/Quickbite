import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];

  const handleUpdate = async (foodItemId, qty) => {
    try { await updateQuantity(foodItemId, qty); }
    catch { toast.error('Failed to update cart'); }
  };

  const handleRemove = async (foodItemId, name) => {
    try { await removeItem(foodItemId); toast.success(`${name} removed`); }
    catch { toast.error('Failed to remove item'); }
  };

  if (items.length === 0) return (
    <div className="page page-with-nav" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
      <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15 }}>Looks like you haven't added anything yet!</p>
      <button onClick={() => navigate('/menu')} className="btn btn-primary">Browse Menu</button>
    </div>
  );

  return (
    <div className="page page-with-nav" style={{ padding: '16px 16px 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22 }}>My Cart <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>({items.length} items)</span></h2>
        <button onClick={async () => { await clearCart(); toast.success('Cart cleared'); }} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>Clear all</button>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {items.map(item => {
          const food = item.foodItem;
          if (!food) return null;
          return (
            <div key={food._id} style={{ background: 'rgba(22,22,31,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍽️</div>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div className={`veg-dot ${food.isVeg ? 'veg' : 'nonveg'}`} style={{ width: 14, height: 14 }} />
                  <h4 style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</h4>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>₹{food.price * item.quantity}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{food.price} each</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <button onClick={() => handleRemove(food._id, food.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, padding: 4 }}>🗑</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => handleUpdate(food._id, item.quantity - 1)} style={{
                    width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>−</button>
                  <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => handleUpdate(food._id, item.quantity + 1)} style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none',
                    background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill summary */}
      <div style={{ background: 'rgba(22,22,31,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Bill Summary</h3>
        {items.map(item => item.foodItem && (
          <div key={item.foodItem._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span>{item.foodItem.name} × {item.quantity}</span>
            <span>₹{item.foodItem.price * item.quantity}</span>
          </div>
        ))}
        <div className="divider" style={{ margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
          <span>Total</span>
          <span style={{ color: 'var(--accent)' }}>₹{cart.totalAmount}</span>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💵</span>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Pay ₹{cart.totalAmount} in cash at counter</span>
        </div>
      </div>

      {/* Checkout button */}
      <div style={{ position: 'fixed', bottom: 72, left: 0, right: 0, padding: '12px 16px', background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Proceed to Checkout — ₹{cart.totalAmount}
        </button>
      </div>
    </div>
  );
}
