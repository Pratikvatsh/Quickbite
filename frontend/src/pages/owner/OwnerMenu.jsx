import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function OwnerMenu() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchItems = async () => {
    try {
      const { data } = await API.get('/menu');
      setItems(data.items || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const toggleAvailability = async (id, name) => {
    setToggling(id);
    try {
      const { data } = await API.patch(`/menu/${id}/availability`);
      setItems(prev => prev.map(i => i._id === id ? data.item : i));
      toast.success(`${name} marked as ${data.item.isAvailable ? 'available' : 'unavailable'}`);
    } catch { toast.error('Failed to update availability'); }
    finally { setToggling(null); }
  };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await API.delete(`/menu/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success(`${name} deleted`);
    } catch { toast.error('Failed to delete item'); }
    finally { setDeleting(null); }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'available' ? item.isAvailable : !item.isAvailable);
    return matchSearch && matchFilter;
  });

  const availableCount = items.filter(i => i.isAvailable).length;
  const unavailableCount = items.filter(i => !i.isAvailable).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <button onClick={() => navigate('/owner/dashboard')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20 }}>Menu Management</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{availableCount} available · {unavailableCount} unavailable</p>
          </div>
          <button onClick={() => navigate('/owner/menu/add')} className="btn btn-primary btn-sm">+ Add Item</button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ paddingLeft: 36, height: 42, borderRadius: 10 }} />
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['available', '✅ Available'], ['unavailable', '🔴 Unavailable']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              border: '1.5px solid', transition: 'all var(--transition)',
              borderColor: filter === val ? 'var(--accent)' : 'var(--border)',
              background: filter === val ? 'var(--accent-dim)' : 'transparent',
              color: filter === val ? 'var(--accent)' : 'var(--text-muted)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 14, marginBottom: 12 }} />)
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🍽️</div>
            <p>No items found</p>
            <button onClick={() => navigate('/owner/menu/add')} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>+ Add First Item</button>
          </div>
        ) : filtered.map(item => (
          <div key={item._id} style={{
            background: 'var(--bg-card)', border: `1px solid ${item.isAvailable ? 'var(--border)' : 'rgba(239,68,68,0.15)'}`,
            borderRadius: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden',
            opacity: item.isAvailable ? 1 : 0.75, transition: 'all var(--transition)'
          }}>
            {/* Image */}
            <div style={{ width: 80, height: 80, flexShrink: 0, background: 'var(--bg-elevated)' }}>
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🍽️</div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} style={{ width: 14, height: 14 }} />
                <h4 style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>₹{item.price}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⭐ {item.rating}</span>
                {item.category && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.category.icon} {item.category.name}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', alignItems: 'flex-end', flexShrink: 0 }}>
              {/* Toggle availability */}
              <button
                onClick={() => toggleAvailability(item._id, item.name)}
                disabled={toggling === item._id}
                style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid',
                  borderColor: item.isAvailable ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                  background: item.isAvailable ? 'var(--green-dim)' : 'var(--red-dim)',
                  color: item.isAvailable ? 'var(--green)' : 'var(--red)',
                  cursor: 'pointer', transition: 'all var(--transition)'
                }}
              >
                {toggling === item._id ? '...' : item.isAvailable ? '✅ Live' : '🔴 Off'}
              </button>

              {/* Edit + Delete */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => navigate(`/owner/menu/edit/${item._id}`)} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                <button onClick={() => deleteItem(item._id, item.name)} disabled={deleting === item._id} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {deleting === item._id ? '...' : '🗑'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
