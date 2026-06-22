import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cart } = useCart();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const cartItem = cart.items?.find(i => i.foodItem?._id === id);
  const inCart = !!cartItem;

  useEffect(() => {
    setLoading(true); setImgLoaded(false);
    API.get(`/menu/${id}`)
      .then(r => {
        const foodItem = r.data.item;
        setItem(foodItem);
        if (foodItem?.category?._id) {
          API.get(`/menu?category=${foodItem.category._id}&available=true`)
            .then(res => setRelated((res.data.items || []).filter(i => i._id !== id).slice(0, 4)))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => navigate('/menu'));
  }, [id, navigate]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(item._id, qty);
      toast.success(`${qty}x ${item.name} added! 🛒`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setAdding(false); }
  };

  const handleUpdateCart = async (newQty) => {
    try { await updateQuantity(item._id, newQty); } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="skeleton" style={{ height: 300, width: '100%' }} />
      <div style={{ padding: '20px 16px' }}>
        {[['70%',28],['50%',18],['100%',80],['100%',52]].map(([w,h],i) => (
          <div key={i} className="skeleton" style={{ height: h, width: w, borderRadius: 10, marginBottom: 14 }} />
        ))}
      </div>
    </div>
  );
  if (!item) return null;

  const isBestseller = item.tags?.includes('bestseller');
  const isNew = item.tags?.includes('new');
  const isSpicy = item.tags?.includes('spicy');
  const totalPrice = item.price * qty;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 110 }}>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 300, background: 'var(--bg-elevated)' }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name}
            onLoad={() => setImgLoaded(true)}
            onError={e => { if (!e.target.src.includes('placehold.co')) e.target.src = 'https://placehold.co/800x600/1e1e2a/9090a8?text=Food'; setImgLoaded(true); }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.5s ease', opacity: imgLoaded ? 1 : 0 }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90 }}>🍽️</div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 45%, var(--bg-primary) 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
        }}>‹</button>

        {/* Heart / Favorite button */}
        <button onClick={() => { setLiked(l => !l); if (!liked) toast('Added to favourites ❤️', { icon: '💝' }); }} style={{
          position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%',
          background: liked ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10, transition: 'all 0.25s ease',
          transform: liked ? 'scale(1.15)' : 'scale(1)'
        }}>{liked ? '❤️' : '🤍'}</button>

        {/* Veg/Non-veg pill */}
        <div style={{ position: 'absolute', bottom: 52, left: 16, zIndex: 10 }}>
          <div style={{
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} style={{ width: 11, height: 11 }} />
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{item.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
          </div>
        </div>

        {/* Rating pill */}
        {item.rating >= 4.0 && (
          <div style={{ position: 'absolute', bottom: 52, right: 16, zIndex: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.4)' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fbbf24' }}>⭐ {item.rating}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bestseller / New / Spicy Banner ── */}
      {(isBestseller || isNew || isSpicy) && (
        <div style={{
          background: isBestseller
            ? 'linear-gradient(90deg, rgba(255,107,53,0.18), rgba(255,61,0,0.08))'
            : isNew ? 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)'
            : 'linear-gradient(90deg, rgba(239,68,68,0.15), transparent)',
          borderBottom: `1px solid ${isBestseller ? 'var(--border-accent)' : isNew ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'}`,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 18 }}>{isBestseller ? '🏆' : isNew ? '✨' : '🌶️'}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: isBestseller ? 'var(--accent)' : isNew ? '#818cf8' : '#f87171', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {isBestseller ? 'Bestseller' : isNew ? 'New Arrival' : 'Spicy Hot'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {isBestseller ? 'Most loved by our customers' : isNew ? 'Just added to the menu' : 'Contains chilli peppers'}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* Category + Title */}
        <div style={{ marginBottom: 14 }}>
          {item.category && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '1px solid var(--border-accent)', borderRadius: 999,
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8
            }}>
              {item.category.icon} {item.category.name}
            </span>
          )}
          <h1 style={{ fontSize: 27, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px', fontFamily: 'var(--font-display)', margin: '6px 0 0' }}>
            {item.name}
          </h1>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { emoji: '⭐', value: item.rating, sub: 'Rating' },
            { emoji: '⏱', value: `${item.prepTime}m`, sub: 'Prep Time' },
            { emoji: '🔥', value: item.calories > 0 ? item.calories : '—', sub: 'Calories' },
          ].map(s => (
            <div key={s.sub} style={{
              background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '12px 8px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 16, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>About this dish</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14, margin: 0 }}>{item.description}</p>
        </div>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {item.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(10px)',
                borderRadius: 999, fontSize: 12, color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.1)', fontWeight: 500
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Special Instructions */}
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setShowInstructions(s => !s)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            padding: '13px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600
          }}>
            <span>📝 Special Instructions</span>
            <span style={{ transition: 'transform 0.2s', transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
          </button>
          {showInstructions && (
            <div style={{ marginTop: 6 }}>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="e.g. Extra spicy, no onions, less salt..."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'none',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '12px 14px',
                  color: 'var(--text-primary)', fontSize: 14,
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.6
                }}
              />
            </div>
          )}
        </div>

        {/* Unavailable */}
        {!item.isAvailable && (
          <div style={{ padding: '13px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: 12, color: '#f87171', marginBottom: 14, fontSize: 14, fontWeight: 600, border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ This item is currently unavailable
          </div>
        )}

        {/* Quantity Selector */}
        {item.isAvailable && !inCart && (
          <div style={{
            background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '14px 16px', marginBottom: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>₹{item.price} × {qty} = <strong style={{ color: 'var(--text-primary)' }}>₹{totalPrice}</strong></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '10px 0 0 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
              <div style={{ width: 48, height: 36, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: '0 10px 10px 0', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        )}

        {/* In-cart adjustment */}
        {inCart && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'var(--green)', fontWeight: 700 }}>✓ In your cart</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => handleUpdateCart(cartItem.quantity - 1)} style={{ width: 34, height: 34, borderRadius: '10px 0 0 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
              <div style={{ width: 42, height: 34, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderLeft: 'none', borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>{cartItem.quantity}</div>
              <button onClick={() => handleUpdateCart(cartItem.quantity + 1)} style={{ width: 34, height: 34, borderRadius: '0 10px 10px 0', background: 'var(--green)', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        )}

        {/* Related Items */}
        {related.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
              More from {item.category?.name} {item.category?.icon}
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {related.map(rel => (
                <div key={rel._id} onClick={() => navigate(`/food/${rel._id}`)}
                  style={{ minWidth: 130, flexShrink: 0, background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ position: 'relative', paddingTop: '60%', background: 'var(--bg-elevated)' }}>
                    <img src={rel.imageUrl} alt={rel.name}
                      onError={e => { if (!e.target.src.includes('placehold.co')) e.target.src = 'https://placehold.co/260x200/1e1e2a/9090a8?text=Food'; }}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, color: 'var(--text-primary)' }}>{rel.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>₹{rel.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(14,14,22,0.7)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', lineHeight: 1.1 }}>
            ₹{inCart ? item.price * cartItem.quantity : totalPrice}
          </div>
        </div>
        {!inCart ? (
          <button onClick={handleAdd} disabled={!item.isAvailable || adding} style={{
            flex: 1, padding: '14px 0', borderRadius: 14,
            background: item.isAvailable ? 'linear-gradient(135deg, #ff6b35, #ff3d00)' : 'var(--bg-elevated)',
            color: item.isAvailable ? '#fff' : 'var(--text-muted)',
            border: 'none', fontSize: 15, fontWeight: 800,
            cursor: item.isAvailable ? 'pointer' : 'not-allowed',
            boxShadow: item.isAvailable ? '0 4px 20px rgba(255,107,53,0.45)' : 'none',
            transition: 'all 0.2s', letterSpacing: '0.02em'
          }}>
            {adding ? '⏳ Adding...' : `🛒 Add to Cart`}
          </button>
        ) : (
          <button onClick={() => navigate('/cart')} style={{
            flex: 1, padding: '14px 0', borderRadius: 14,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', border: 'none', fontSize: 15, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
            letterSpacing: '0.02em'
          }}>
            🛒 View Cart →
          </button>
        )}
      </div>
    </div>
  );
}
