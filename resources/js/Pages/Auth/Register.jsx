import React, { useState } from 'react';

// Laravel flame SVG logo
function LaravelLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#b94040"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#b94040" opacity=".4"/>
    </svg>
  );
}

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  const levels = [
    { label: 'Too short', color: '#e5e7eb' },
    { label: 'Weak',      color: '#ef4444' },
    { label: 'Fair',      color: '#f59e0b' },
    { label: 'Good',      color: '#6366f1' },
    { label: 'Strong',    color: '#10b981' },
  ];
  if (!password) return null;
  const lvl = levels[score] || levels[0];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? lvl.color : '#e5e7eb', transition: 'background .2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: lvl.color, fontWeight: 600 }}>{lvl.label}</span>
    </div>
  );
}

export default function Register({ onGoToLogin }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError(null);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const res  = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Object.values(data.errors || {})[0]?.[0] || data.message || 'Registration failed');
      // Don't store token — send user to login to sign in manually
      onGoToLogin();
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
  const focusIn  = (e) => { e.target.style.borderColor = '#FF2D20'; e.target.style.boxShadow = '0 0 0 3px rgba(255,45,32,.1)'; };
  const focusOut = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '.02em' };

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
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,32,.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,32,.04) 0%, transparent 70%)' }} />
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
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>FULL NAME</label>
          <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>EMAIL ADDRESS</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={focusIn} onBlur={focusOut}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', padding: 2 }}>
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
          <PasswordStrength password={form.password} />
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>CONFIRM PASSWORD</label>
          <input
            type="password" value={form.password_confirmation} onChange={set('password_confirmation')}
            placeholder="Repeat your password" style={{
              ...inputStyle,
              borderColor: form.password_confirmation && form.password !== form.password_confirmation ? '#ef4444' : '#e5e7eb',
            }}
            onFocus={focusIn} onBlur={focusOut}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {form.password_confirmation && form.password !== form.password_confirmation && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Passwords don't match</p>
          )}
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
          {loading ? 'Creating account…' : 'Create Account →'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          <span style={{ fontSize: 12, color: '#d1d5db' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
        </div>

        <p style={{ textAlign: 'center', margin: 0, fontSize: 13, color: '#6b7280' }}>
          Already have an account?{' '}
          <span
            onClick={onGoToLogin}
            style={{ color: '#FF2D20', fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}