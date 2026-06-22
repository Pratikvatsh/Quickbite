import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=logo, 1=text, 2=tagline

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => navigate('/login'), 3000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 40%, rgba(255,107,53,0.18) 0%, var(--bg-primary) 65%)',
      gap: 0, overflow: 'hidden', position: 'relative'
    }}>
      {/* Background rings */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,107,53,0.06)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'ringPulse 3s ease infinite' }} />
      <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,107,53,0.1)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'ringPulse 3s ease 0.5s infinite' }} />

      <style>{`
        @keyframes ringPulse { 0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.05)} }
        @keyframes logoIn { from{opacity:0;transform:scale(0.5) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes textIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Logo */}
      <div style={{ animation: 'logoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, floatUp 3s ease 1s infinite', marginBottom: 28 }}>
        <div style={{
          width: 110, height: 110, borderRadius: 32,
          background: 'linear-gradient(135deg, #ff6b35, #ff3d00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 58, boxShadow: '0 24px 64px rgba(255,107,53,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
        }}>🍔</div>
      </div>

      {/* Brand name */}
      <div style={{ textAlign: 'center', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)', marginBottom: 10 }}>
        <h1 style={{ fontSize: 48, fontFamily: 'var(--font-display)', letterSpacing: '-2px', lineHeight: 1 }}>
          Quick<span style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(255,107,53,0.5)' }}>Bite</span>
        </h1>
      </div>

      {/* Tagline */}
      <div style={{ textAlign: 'center', opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s 0.1s cubic-bezier(0.4,0,0.2,1)', marginBottom: 40 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, letterSpacing: '0.02em' }}>
          Campus food, ordered fast ⚡
        </p>
      </div>

      {/* Loading bar */}
      <div style={{ width: 120, height: 3, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden', opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.4s 0.3s' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #ff3d00)', borderRadius: 99, animation: 'progress 2s 1s linear forwards', width: '0%' }} />
      </div>

      <style>{`@keyframes progress { from{width:0%} to{width:100%} }`}</style>
    </div>
  );
}
