import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', category: '', imageUrl: '', isVeg: true, prepTime: '10', tags: '', calories: '', isAvailable: true };

export default function OwnerAddItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories || []));
    if (isEdit) {
      API.get(`/menu/${id}`).then(r => {
        const item = r.data.item;
        setForm({
          name: item.name, description: item.description, price: String(item.price),
          category: item.category?._id || '', imageUrl: item.imageUrl || '',
          isVeg: item.isVeg, prepTime: String(item.prepTime || 10),
          tags: (item.tags || []).join(', '), calories: String(item.calories || ''),
          isAvailable: item.isAvailable
        });
        setLoading(false);
      }).catch(() => navigate('/owner/menu'));
    }
  }, [id, isEdit, navigate]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        prepTime: Number(form.prepTime) || 10,
        calories: Number(form.calories) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await API.put(`/menu/${id}`, payload);
        toast.success('Item updated successfully!');
      } else {
        await API.post('/menu', payload);
        toast.success('Item added to menu!');
      }
      navigate('/owner/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally { setSaving(false); }
  };

  const Field = ({ label, required, hint, children }) => (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 7 }}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{hint}</p>}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🍽️</div>
    </div>
  );

  return (
    <div className="page page-with-nav container">
      <h2 style={{ fontSize: 20, padding: '8px 20px 0' }}>{isEdit ? 'Edit Menu Item' : 'Add New Item'}</h2>

      <form onSubmit={submit} style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600, margin: '0 auto' }}>

        {/* Image preview */}
        {form.imageUrl && (
          <div style={{ width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
            <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          </div>
        )}

        <Field label="Item Name" required>
          <input name="name" value={form.name} onChange={handle} placeholder="e.g. Masala Dosa" required />
        </Field>

        <Field label="Description" required>
          <textarea name="description" value={form.description} onChange={handle} placeholder="Describe the dish — ingredients, how it's made, flavors..." rows={3} style={{ resize: 'vertical' }} required />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Price (₹)" required>
            <input name="price" type="number" min="1" value={form.price} onChange={handle} placeholder="50" required />
          </Field>
          <Field label="Prep Time (min)">
            <input name="prepTime" type="number" min="1" value={form.prepTime} onChange={handle} placeholder="10" />
          </Field>
        </div>

        <Field label="Category" required>
          <select name="category" value={form.category} onChange={handle} required>
            <option value="">Select category...</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </Field>

        <Field label="Image URL" hint="Paste a URL from Unsplash or any image host">
          <input name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://images.unsplash.com/..." />
        </Field>

        <Field label="Tags" hint="Comma-separated: popular, spicy, bestseller">
          <input name="tags" value={form.tags} onChange={handle} placeholder="popular, healthy, spicy" />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Calories">
            <input name="calories" type="number" min="0" value={form.calories} onChange={handle} placeholder="350" />
          </Field>
        </div>

        {/* Toggle row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { name: 'isVeg', label: 'Vegetarian', yesColor: 'var(--green)', yesLabel: '🟢 Veg', noLabel: '🔴 Non-Veg' },
            { name: 'isAvailable', label: 'Available', yesColor: 'var(--accent)', yesLabel: '✅ Available', noLabel: '🔴 Unavailable' },
          ].map(toggle => (
            <button key={toggle.name} type="button" onClick={() => setForm(f => ({ ...f, [toggle.name]: !f[toggle.name] }))}
              style={{
                flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid',
                borderColor: form[toggle.name] ? toggle.yesColor + '60' : 'var(--border)',
                background: form[toggle.name] ? toggle.yesColor + '18' : 'var(--bg-elevated)',
                color: form[toggle.name] ? toggle.yesColor : 'var(--text-muted)',
                fontWeight: 700, fontSize: 14, transition: 'all var(--transition)'
              }}>
              {form[toggle.name] ? toggle.yesLabel : toggle.noLabel}
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>{toggle.label}</p>
            </button>
          ))}
        </div>

        {/* Submit */}
        <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
          {saving ? '⏳ Saving...' : isEdit ? '✅ Update Item' : '🍽️ Add to Menu'}
        </button>

        {isEdit && (
          <button type="button" onClick={() => navigate('/owner/menu')} className="btn btn-ghost" style={{ width: '100%' }}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
