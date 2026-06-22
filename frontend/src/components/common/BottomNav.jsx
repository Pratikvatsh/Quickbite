import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const tabs = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/menu', icon: '🍽️', label: 'Menu' },
  { path: '/cart', icon: '🛒', label: 'Cart' },
  { path: '/orders', icon: '📋', label: 'Orders' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 72, display: 'flex', alignItems: 'center',
      background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.1)', padding: '0 8px',
      boxShadow: '0 -4px 30px rgba(0,0,0,0.3)'
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        const isCart = tab.path === '/cart';
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: '8px 4px',
            background: 'none', border: 'none', position: 'relative',
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all var(--transition)'
          }}>
            <div style={{
              fontSize: active ? 24 : 22,
              transform: active ? 'scale(1.1)' : 'scale(1)',
              transition: 'all var(--transition)', position: 'relative'
            }}>
              {tab.icon}
              {isCart && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  width: 17, height: 17, borderRadius: '50%',
                  background: 'var(--accent)', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>{cartCount}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>{tab.label}</span>
            {active && <div style={{ position: 'absolute', bottom: 2, width: 20, height: 3, borderRadius: 99, background: 'var(--accent)' }} />}
          </button>
        );
      })}
    </nav>
  );
}
