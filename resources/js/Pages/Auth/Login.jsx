import React, { useState } from 'react';

export default function Login({ onLogin, onGoToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const res = await fetch('/api/login', {
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
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 16 };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827' }}>DailyMe</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={labelStyle}>Email</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={inputStyle} />

        <label style={labelStyle}>Password</label>
        <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" style={inputStyle} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: loading ? '#c7d2fe' : '#6366f1', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 24 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
          Don't have an account?{' '}
          <span onClick={onGoToRegister} style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </div>
  );
}