import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function FoodCard({ item }) {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const inCart = cart.items?.find(i => i.foodItem?._id === item._id);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    setAdding(true);
    try {
      await addToCart(item._id, 1);
      toast.success(`${item.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card" onClick={() => navigate(`/food/${item._id}`)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '55%', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform 0.4s ease'
          }} onError={e => {
            if (!e.target.src.includes('placehold.co')) {
              e.target.src = 'https://placehold.co/500x400/1e1e2a/9090a8?text=Food';
            }
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🍽️</div>
        )}
        {!item.isAvailable && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Unavailable</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} style={{ background: 'var(--bg-primary)', padding: 2 }} />
        </div>
        {item.rating >= 4.5 && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span className="badge badge-orange" style={{ fontSize: 11 }}>⭐ {item.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, marginBottom: 2 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.3, flex: 1 }}>{item.name}</h3>
          {item.rating < 4.5 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>⭐ {item.rating}</span>
          )}
        </div>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>₹{item.price}</span>
            {item.prepTime && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>⏱ {item.prepTime}m</span>}
          </div>

          <button onClick={handleAdd} disabled={!item.isAvailable || adding} style={{
            width: 26, height: 26, borderRadius: 8,
            background: inCart ? 'var(--green-dim)' : 'var(--accent)',
            border: inCart ? '1px solid rgba(34,197,94,0.3)' : 'none',
            color: inCart ? 'var(--green)' : '#fff',
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, transition: 'all var(--transition)',
            opacity: !item.isAvailable ? 0.4 : 1
          }}>
            {adding ? '...' : inCart ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}
