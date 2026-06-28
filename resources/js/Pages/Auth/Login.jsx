import React, { useState } from 'react';
import { Card } from 'antd';
import logo from '../../assets/logo-dailyme(1).png';

// ── Palette (matches DailyMe exactly) ─────────────────────────────────────
const P = {
  purple50:  '#f5f3ff',
  purple100: '#ede9fe',
  purple200: '#ddd6fe',
  purple300: '#c4b5fd',
  purple400: '#a78bfa',
  purple500: '#8b5cf6',
  purple600: '#7c3aed',
  purple700: '#6d28d9',
  textPrimary:   '#1e1b4b',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  border:        '#ede9fe',
  white:         '#ffffff',
  bg:            '#faf9ff',
};

// ── DailyMe Logo ───────────────────────────────────────────────────────────
function DailyMeLogo({ size = 28 }) {
  return (
    <img src={logo} alt="DailyMe" style={{ width: size, height: size, objectFit: 'contain' }} />
  );
}

export default function Login({ onLogin, onGoToRegister, prefillEmail }) {
  const [form, setForm]       = useState({ email: typeof prefillEmail === 'string' ? prefillEmail : '', password: '' });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError(null);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const res  = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('auth_token', data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1.5px solid ${P.border}`, fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', color: P.textPrimary,
    background: P.purple50, transition: 'border-color .15s, box-shadow .15s',
  };
  const focusIn  = (e) => { e.target.style.borderColor = P.purple500; e.target.style.boxShadow = `0 0 0 3px ${P.purple100}`; };
  const focusOut = (e) => { e.target.style.borderColor = P.border;    e.target.style.boxShadow = 'none'; };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: P.textSecondary, marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' };

  return (
    <div style={{
      minHeight: '100vh',
      background: P.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background orbs matching app feel */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', right: '-4%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-6%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,253,.06) 0%, transparent 70%)' }} />
      </div>

      <Card style={{
        position: 'relative', zIndex: 1,
        borderRadius: 24,
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(124,58,237,.10), 0 1px 0 rgba(255,255,255,.8) inset',
        border: `1px solid ${P.purple200}`,
      }}
      styles={{ body: { padding: '40px 36px' } }}
      >

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ marginBottom: 4 }}>
            <DailyMeLogo size={72} />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: P.textPrimary, letterSpacing: '-.03em' }}>
            DailyMe
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: P.textMuted }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Email Address</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" style={inputStyle}
            onFocus={focusIn} onBlur={focusOut}
            autoFocus
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28 }}>
          <label style={lbl}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={focusIn} onBlur={focusOut}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              type="button" onClick={() => setShowPass((v) => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: P.textMuted, padding: 2, display: 'flex', alignItems: 'center' }}
            >
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
            background: loading ? 'linear-gradient(135deg, #93c5fd 0%, #6ee7b7 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(16,185,129,.30)',
            transition: 'all .2s', letterSpacing: '.01em',
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #059669 100%)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
          onMouseLeave={(e) => { e.currentTarget.style.background = loading ? 'linear-gradient(135deg, #93c5fd 0%, #6ee7b7 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: P.border }} />
          <span style={{ fontSize: 12, color: P.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: P.border }} />
        </div>

        <p style={{ textAlign: 'center', margin: 0, fontSize: 13, color: P.textSecondary }}>
          Don't have an account?{' '}
          <span
            onClick={onGoToRegister}
            style={{ color: '#2563eb', fontWeight: 700, cursor: 'pointer', transition: 'color .15s', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
          >
            Create one
          </span>
        </p>
        </Card>
    </div>
  );
}