import React, { useState } from 'react';

// Laravel flame SVG logo
function LaravelLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.25c0 .348-.188.67-.491.844l-8.610 4.968v9.836c0 .348-.188.67-.491.844l-17.953 10.356a.817.817 0 0 1-.114.05c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.03-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.07.008-.14.028-.208.006-.02.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .04.051.826.826 0 0 1 .067.124c.010.02.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.07.009-.14.028-.208.006-.02.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .04-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.02.018.039.023.059z" fill="#FF2D20"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#FF2D20" opacity=".6"/>
    </svg>
  );
}

export default function Login({ onLogin, onGoToRegister }) {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState(null);
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
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', color: '#111827',
    background: '#fafafa', transition: 'border-color .15s, box-shadow .15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #fef2f2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      padding: 16,
    }}>
      {/* Decorative background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,32,.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,32,.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: '#fff', borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,.08), 0 1px 0 rgba(255,255,255,.8) inset',
        border: '1px solid rgba(255,45,32,.1)',
      }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#fff5f5,#ffe4e4)', marginBottom: 14, boxShadow: '0 4px 16px rgba(255,45,32,.12)' }}>
            <LaravelLogo size={36} />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-.03em' }}>DailyMe</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>Sign in to your workspace</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '.02em' }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#FF2D20'; e.target.style.boxShadow = '0 0 0 3px rgba(255,45,32,.1)'; }}
            onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '.02em' }}>
            PASSWORD
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={(e) => { e.target.style.borderColor = '#FF2D20'; e.target.style.boxShadow = '0 0 0 3px rgba(255,45,32,.1)'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              type="button" onClick={() => setShowPass((v) => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', padding: 2 }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
            background: loading ? '#fca5a5' : 'linear-gradient(135deg,#FF2D20,#ff5c52)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(255,45,32,.3)',
            transition: 'all .2s', letterSpacing: '.01em',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          <span style={{ fontSize: 12, color: '#d1d5db' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>

        <p style={{ textAlign: 'center', margin: 0, fontSize: 13, color: '#6b7280' }}>
          Don't have an account?{' '}
          <span
            onClick={onGoToRegister}
            style={{ color: '#FF2D20', fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}