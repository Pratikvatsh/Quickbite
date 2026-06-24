import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import FoodCard from '../../components/common/FoodCard';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState({ mostOrdered: [], juices: [], snacks: [], meals: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          API.get('/menu?available=true'),
          API.get('/categories')
        ]);
        const items = menuRes.data.items || [];
        setCategories(catRes.data.categories || []);
        
        setSections({
          mostOrdered: [...items].sort((a, b) => b.rating - a.rating).slice(0, 2),
          juices: items.filter(i => i.category?.name === 'Juices & Shakes').slice(0, 2),
          snacks: items.filter(i => i.category?.name === 'Snacks').slice(0, 2),
          meals: items.filter(i => i.category?.name === 'Rice & Meals').slice(0, 2)
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/menu?search=${encodeURIComponent(search)}`);
  };

  const getCategoryId = (name) => categories.find(c => c.name === name)?._id || '';

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="page page-with-nav" style={{ padding: '0 0 90px' }}>

      {/* Live ticker */}
      <div style={{ background: 'linear-gradient(90deg, #ff6b35, #ff3d00)', overflow: 'hidden', padding: '7px 0', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 48, animation: 'marquee 18s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {['🍔 Order fresh canteen food', '⚡ Skip the queue, pick up fast', '🎓 Exclusive campus discount', '📱 Pay with UPI or card', '🍕 New items added daily', '🔔 Get notified when ready'].concat(
            ['🍔 Order fresh canteen food', '⚡ Skip the queue, pick up fast', '🎓 Exclusive campus discount', '📱 Pay with UPI or card']
          ).map((t, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{t}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>
      {/* Hero */}
      <div style={{
        padding: '28px 16px 24px',
        background: 'linear-gradient(160deg, rgba(255,107,53,0.1) 0%, transparent 60%)'
      }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Good {getGreeting()} 👋</p>
          <h1 style={{ fontSize: 26, marginBottom: 20, lineHeight: 1.2 }}>
            Hey <span style={{ color: 'var(--accent)' }}>{firstName}</span>,<br />
            What are you craving?
          </h1>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search food, snacks, beverages..."
                style={{ paddingLeft: 44, borderRadius: 14, height: 50, fontSize: 15 }}
              />
              {search && (
                <button type="submit" style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  padding: '6px 14px', borderRadius: 8, fontWeight: 600, fontSize: 13
                }}>Go</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="container" style={{ padding: '0 16px', marginBottom: 28 }}>
        <div className="section-header">
          <h2 style={{ fontSize: 18 }}>Categories</h2>
          <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>See all →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {loading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ minWidth: 80, height: 80, borderRadius: 14 }} />
          )) : categories.map(cat => (
            <button key={cat._id} onClick={() => navigate(`/menu?category=${cat._id}`)} style={{
              minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 6, padding: '12px 8px',
              background: 'rgba(22,22,31,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, cursor: 'pointer', transition: 'all var(--transition)', flexShrink: 0
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: 26 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="container" style={{ padding: '0 16px', marginBottom: 28 }}>
        <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,61,0,0.1))',
          borderColor: 'var(--border-accent)', borderRadius: 18,
          padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden', cursor: 'pointer'
        }} onClick={() => navigate('/menu')}>
          {/* Shimmer overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 3s infinite' }} />
          <div style={{ fontSize: 50, animation: 'float 3s ease infinite', zIndex: 1 }}>🎓</div>
          <div style={{ zIndex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skip the queue</p>
            <h3 style={{ fontSize: 18, lineHeight: 1.2 }}>Order ahead,<br />pick up fast!</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Pay at counter · No waiting 🚀</p>
          </div>
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 24, color: 'var(--accent)', zIndex: 1 }}>→</div>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,107,53,0.08)' }} />
        </div>
      </div>

      {/* Curated Sections */}
      <FoodSection title="⭐ Most Ordered" items={sections.mostOrdered} loading={loading} onMenu={() => navigate('/menu')} />
      <FoodSection title="🥤 Fresh Juices & Shakes" items={sections.juices} loading={loading} onMenu={() => navigate(`/menu?category=${getCategoryId('Juices & Shakes')}`)} />
      <FoodSection title="🌯 Popular Rolls & Snacks" items={sections.snacks} loading={loading} onMenu={() => navigate(`/menu?category=${getCategoryId('Snacks')}`)} />
      <FoodSection title="🍛 Hearty Meals" items={sections.meals} loading={loading} onMenu={() => navigate(`/menu?category=${getCategoryId('Rice & Meals')}`)} />

    </div>
  );
}

function FoodSection({ title, items, loading, onMenu }) {
  if (!loading && items.length === 0) return null;
  return (
    <div className="container" style={{ padding: '0 16px', marginBottom: 28, animation: 'cardPop 0.5s ease both' }}>
      <div className="section-header">
        <h2 style={{ fontSize: 18 }}>{title}</h2>
        <button onClick={onMenu} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>See all →</button>
      </div>
      {loading ? (
        <div className="food-grid">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="food-grid">
          {items.map((item, idx) => (
            <div key={item._id} style={{ animation: `cardPop 0.4s ${idx * 0.08}s ease both` }}>
              <FoodCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
