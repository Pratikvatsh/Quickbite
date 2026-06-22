import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../utils/api';
import FoodCard from '../../components/common/FoodCard';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [vegOnly, setVegOnly] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (search) params.set('search', search);
      params.set('available', 'false'); // show all, including unavailable (greyed)
      const { data } = await API.get(`/menu?${params}`);
      let filtered = data.items || [];
      if (vegOnly) filtered = filtered.filter(i => i.isVeg);
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, vegOnly]);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearSearch = () => {
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="page page-with-nav" style={{ paddingBottom: 90 }}>
      {/* Search */}
      <div style={{ padding: '16px 16px 12px', position: 'sticky', top: 64, zIndex: 50, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search food..."
              style={{ paddingLeft: 42, paddingRight: search ? 76 : 16, height: 46, borderRadius: 12 }}
            />
            {search && (
              <button type="button" onClick={clearSearch} style={{
                position: 'absolute', right: 70, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16
              }}>✕</button>
            )}
            <button type="submit" style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '6px 12px', borderRadius: 8, fontWeight: 600, fontSize: 13
            }}>Search</button>
          </div>
        </form>

        {/* Veg toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <button onClick={() => setVegOnly(!vegOnly)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 999, border: '1.5px solid',
            borderColor: vegOnly ? 'var(--green)' : 'var(--border)',
            background: vegOnly ? 'var(--green-dim)' : 'transparent',
            color: vegOnly ? 'var(--green)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, transition: 'all var(--transition)'
          }}>
            <div className={`veg-dot veg`} style={{ width: 14, height: 14 }} />
            Veg only
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{items.length} items</span>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding: '14px 16px', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none', flexShrink: 0 }}>
        {[{ _id: 'all', name: 'All', icon: '🍽️' }, ...categories].map(cat => (
          <button key={cat._id} onClick={() => setActiveCategory(cat._id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap',
            borderColor: activeCategory === cat._id ? 'var(--accent)' : 'var(--border)',
            background: activeCategory === cat._id ? 'var(--accent-dim)' : 'var(--bg-card)',
            color: activeCategory === cat._id ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, transition: 'all var(--transition)'
          }}>
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <h3 style={{ marginBottom: 8 }}>No items found</h3>
            <p style={{ fontSize: 14 }}>Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); setVegOnly(false); }} className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {items.map(item => <FoodCard key={item._id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
