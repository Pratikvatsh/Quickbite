import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';

export default function TopNav() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (user?.role === 'customer') fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/users/notifications');
      setNotifications(data.notifications || []);
    } catch {}
  };

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async () => {
    if (unread > 0) {
      await API.put('/users/notifications/read');
      setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    }
  };

  const isOwner = user?.role === 'owner';
  const title = getTitle(location.pathname);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px',
      background: 'rgba(10,10,15,0.65)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.25)'
    }}>
      {/* Left: Logo or back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {canGoBack(location.pathname) ? (
          <button onClick={() => navigate(-1)} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(30,30,42,0.5)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>←</button>
        ) : (
          <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Quick<span style={{ color: 'var(--accent)' }}>Bite</span>
          </span>
        )}
        {title && canGoBack(location.pathname) && (
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isOwner && (
          <>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowNotif(!showNotif); markRead(); }} style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(30,30,42,0.5)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
              }}>🔔
                {unread > 0 && <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--accent)', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>{unread}</span>}
              </button>

              {showNotif && (
                <div style={{
                  position: 'absolute', top: 44, right: 0, width: 300,
                  background: 'rgba(22,22,31,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, boxShadow: '0 12px 48px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Notifications</div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</div>
                  ) : notifications.slice(0, 5).map((n, i) => (
                    <div key={i} onClick={() => { setShowNotif(false); if (n.orderId) navigate(`/order-tracking/${n.orderId}`); }} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--border)',
                      background: n.read ? 'transparent' : 'var(--accent-dim)',
                      cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)'
                    }}>{n.message}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => navigate('/cart')} style={{
              width: 38, height: 38, borderRadius: 10,
              background: cartCount > 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              border: `1px solid ${cartCount > 0 ? 'var(--border-accent)' : 'var(--border)'}`,
              color: cartCount > 0 ? 'var(--accent)' : 'var(--text-primary)',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>🛒
              {cartCount > 0 && <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--accent)', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>{cartCount}</span>}
            </button>
          </>
        )}

        {/* Avatar/logout */}
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #ff3d00)',
          color: '#fff', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          title: 'Logout'
        }} title="Logout">
          {user?.name?.charAt(0).toUpperCase()}
        </button>
      </div>
    </nav>
  );
}

function getTitle(path) {
  const map = {
    '/cart': 'My Cart', '/checkout': 'Checkout', '/orders': 'Order History',
    '/profile': 'Profile', '/menu': 'Menu',
    '/owner/orders': 'Orders', '/owner/menu': 'Menu', '/owner/menu/add': 'Add Item',
  };
  return map[path] || '';
}

function canGoBack(path) {
  const noBacks = ['/home', '/owner/dashboard'];
  return !noBacks.includes(path) && !path.startsWith('/order-tracking');
}
