import React, { useState, useEffect, useRef } from 'react';

// ── Palette ────────────────────────────────────────────────────────────────
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

// ── Laravel Logo ───────────────────────────────────────────────────────────
function LaravelLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#7c3aed"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#7c3aed" opacity=".35"/>
    </svg>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Users:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Folder:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Ticket:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>,
  Tasks:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Shield:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Trash:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  LogOut:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Back:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Crown:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

// ── apiFetch ───────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('auth_token') || '';
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: P.textPrimary, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999 }}>
          {label}
          <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: 4, borderStyle: 'solid', borderColor: `transparent transparent ${P.textPrimary} transparent` }} />
        </div>
      )}
    </div>
  );
}

// ── Profile Dropdown ───────────────────────────────────────────────────────
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || 'A';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: 34, height: 34, borderRadius: '50%', background: open ? P.purple600 : P.purple500, border: open ? `2px solid ${P.purple300}` : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s', boxShadow: open ? `0 0 0 3px ${P.purple100}` : 'none' }}>
        {initial}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: P.white, border: `1px solid ${P.purple200}`, borderRadius: 14, boxShadow: '0 8px 30px rgba(124,58,237,.12)', minWidth: 200, overflow: 'hidden', zIndex: 1001 }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: P.purple500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>{initial}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: P.textPrimary }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: P.purple600, fontWeight: 600, background: P.purple100, padding: '1px 8px', borderRadius: 20, display: 'inline-block', marginTop: 2 }}>Admin</div>
            </div>
          </div>
          <div style={{ padding: '6px 0' }}>
            <button onClick={onLogout}
              style={{ width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#dc2626', transition: 'background .12s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              <Icons.LogOut /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg, border, sub }) {
  return (
    <div style={{ background: P.white, borderRadius: 16, padding: '20px 22px', border: `1px solid ${border || P.border}`, boxShadow: '0 1px 6px rgba(124,58,237,.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: P.textPrimary, letterSpacing: '-.03em', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.textSecondary, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: P.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Mini Bar Chart ─────────────────────────────────────────────────────────
function MiniBarChart({ title, data, colorMap }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div style={{ background: P.white, borderRadius: 16, padding: '20px 22px', border: `1px solid ${P.border}`, boxShadow: '0 1px 6px rgba(124,58,237,.05)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: P.textPrimary, marginBottom: 16, letterSpacing: '-.01em' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(data).map(([key, count]) => {
          const pct = Math.round((count / max) * 100);
          const col = colorMap[key] || { bar: P.purple400, label: key, text: P.purple600, bg: P.purple100 };
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.bar }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: P.textSecondary, textTransform: 'capitalize' }}>{col.label || key.replace(/_/g, ' ')}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: P.textPrimary }}>{count}</span>
              </div>
              <div style={{ height: 6, background: P.purple50, borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: col.bar, width: `${pct}%`, transition: 'width .4s ease' }} />
              </div>
            </div>
          );
        })}
        {Object.keys(data).length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: P.textMuted, fontSize: 13 }}>No data</div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Modal ──────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 400, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: P.textPrimary }}>Are you sure?</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: P.textSecondary, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14, transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Users Table ────────────────────────────────────────────────────────────
function UsersTable({ users, currentUserId, onToggleAdmin, onDeleteUser }) {
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'admin'|'delete', user }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === 'admin') onToggleAdmin(confirm.user);
    if (confirm.type === 'delete') onDeleteUser(confirm.user);
    setConfirm(null);
  }

  function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <>
      <div style={{ background: P.white, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: '0 1px 6px rgba(124,58,237,.05)', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.purple600 }}>
            <Icons.Users />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: P.textPrimary }}>All Users</div>
            <div style={{ fontSize: 12, color: P.textMuted }}>{users.length} registered user{users.length !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ flex: 1 }} />
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: P.textMuted, display: 'flex' }}>
              <Icons.Search />
            </div>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{ padding: '8px 12px 8px 34px', borderRadius: 9, border: `1.5px solid ${P.border}`, fontSize: 13, outline: 'none', background: P.purple50, color: P.textPrimary, width: 200, transition: 'border-color .15s' }}
              onFocus={(e) => e.target.style.borderColor = P.purple400}
              onBlur={(e) => e.target.style.borderColor = P.border}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: P.purple50 }}>
                {['User', 'Email', 'Role', 'Tasks', 'Projects Owned', 'Member Of', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: P.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap', borderBottom: `1px solid ${P.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 0', textAlign: 'center', color: P.textMuted, fontSize: 13 }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const isCurrentUser = u.id === currentUserId;
                  return (
                    <tr key={u.id}
                      style={{ borderBottom: `1px solid ${P.border}`, background: i % 2 === 0 ? P.white : '#fdfcff', transition: 'background .1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = P.purple50}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? P.white : '#fdfcff'}>

                      {/* User */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.is_admin ? P.purple600 : P.purple400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: P.textPrimary }}>{u.name}</div>
                            {isCurrentUser && <div style={{ fontSize: 10, color: P.purple600, fontWeight: 600 }}>You</div>}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px', fontSize: 13, color: P.textSecondary, whiteSpace: 'nowrap' }}>{u.email}</td>

                      {/* Role */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {u.is_admin ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: P.purple100, color: P.purple600, border: `1px solid ${P.purple200}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Icons.Shield /> Admin
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                            User
                          </span>
                        )}
                      </td>

                      {/* Tasks */}
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: P.textPrimary, textAlign: 'center' }}>{u.tasks_count ?? 0}</td>

                      {/* Projects owned */}
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: P.textPrimary, textAlign: 'center' }}>{u.projects_owned ?? 0}</td>

                      {/* Member of */}
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: P.textPrimary, textAlign: 'center' }}>{u.projects_member ?? 0}</td>

                      {/* Joined */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: P.textMuted, whiteSpace: 'nowrap' }}>{formatDate(u.created_at)}</td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Tooltip label={u.is_admin ? 'Revoke Admin' : 'Make Admin'}>
                            <button
                              onClick={() => !isCurrentUser && setConfirm({ type: 'admin', user: u })}
                              disabled={isCurrentUser}
                              style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${u.is_admin ? P.purple300 : P.border}`, background: u.is_admin ? P.purple100 : P.white, color: u.is_admin ? P.purple600 : P.textSecondary, cursor: isCurrentUser ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, opacity: isCurrentUser ? .4 : 1, transition: 'all .15s' }}
                              onMouseEnter={(e) => { if (!isCurrentUser) { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple400; } }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = u.is_admin ? P.purple100 : P.white; e.currentTarget.style.borderColor = u.is_admin ? P.purple300 : P.border; }}>
                              <Icons.Crown /> {u.is_admin ? 'Revoke' : 'Admin'}
                            </button>
                          </Tooltip>
                          <Tooltip label="Delete User">
                            <button
                              onClick={() => !isCurrentUser && setConfirm({ type: 'delete', user: u })}
                              disabled={isCurrentUser}
                              style={{ padding: '5px 9px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: isCurrentUser ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: isCurrentUser ? .4 : 1, transition: 'all .15s' }}
                              onMouseEnter={(e) => { if (!isCurrentUser) e.currentTarget.style.background = '#fecaca'; }}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                              <Icons.Trash />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={
            confirm.type === 'delete'
              ? `Delete "${confirm.user.name}"? This will remove all their tasks and data permanently.`
              : confirm.user.is_admin
                ? `Revoke admin access from "${confirm.user.name}"?`
                : `Grant admin access to "${confirm.user.name}"?`
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ── Main AdminDashboard ────────────────────────────────────────────────────
export default function AdminDashboard({ user, onBack, onLogout }) {
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [statsData, usersData] = await Promise.all([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/users'),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleToggleAdmin(targetUser) {
    try {
      const res = await apiFetch(`/api/admin/users/${targetUser.id}/toggle-admin`, { method: 'PATCH' });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_admin: res.user.is_admin } : u));
      setStats(prev => prev ? { ...prev, admin_count: prev.admin_count + (res.user.is_admin ? 1 : -1) } : prev);
    } catch {
      alert('Failed to update admin status.');
    }
  }

  async function handleDeleteUser(targetUser) {
    try {
      await apiFetch(`/api/admin/users/${targetUser.id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      setStats(prev => prev ? { ...prev, total_users: prev.total_users - 1 } : prev);
    } catch {
      alert('Failed to delete user.');
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  async function handleLogout() {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch {}
    onLogout();
  }

  // Color maps for charts
  const ticketStatusColors = {
    todo:        { bar: P.purple400, label: 'To Do' },
    in_progress: { bar: '#0ea5e9',   label: 'In Progress' },
    review:      { bar: '#8b5cf6',   label: 'Review' },
    qa_approved: { bar: '#f59e0b',   label: 'QA Approved' },
    done:        { bar: '#10b981',   label: 'Done' },
    archived:    { bar: '#9ca3af',   label: 'Archived' },
  };
  const priorityColors = {
    low:    { bar: '#34d399', label: 'Low' },
    medium: { bar: '#fbbf24', label: 'Medium' },
    high:   { bar: '#f87171', label: 'High' },
  };
  const taskStatusColors = {
    todo:        { bar: P.purple400, label: 'To Do' },
    in_progress: { bar: '#0ea5e9',   label: 'In Progress' },
    done:        { bar: '#10b981',   label: 'Done' },
  };
  const roleColors = {
    owner:  { bar: P.purple600, label: 'Owner' },
    member: { bar: '#0ea5e9',   label: 'Member' },
    qa:     { bar: '#f59e0b',   label: 'QA' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: P.purple500, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", gap: 10 }}>
      <div style={{ width: 18, height: 18, border: `2px solid ${P.purple100}`, borderTopColor: P.purple600, borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
      Loading admin dashboard…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: '100vh', background: P.bg }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 8px rgba(124,58,237,.06)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
            <LaravelLogo size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary, letterSpacing: '-.03em' }}>DailyMe</span>
        </div>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />

        {/* Admin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: P.purple600, background: P.purple100, padding: '4px 12px', borderRadius: 20, border: `1px solid ${P.purple200}` }}>
          <Icons.Shield /> Admin Dashboard
        </div>

        <div style={{ flex: 1 }} />

        {/* Refresh */}
        <Tooltip label="Refresh data">
          <button onClick={handleRefresh}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid transparent', background: 'transparent', color: P.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.textSecondary; }}>
            <div style={{ animation: refreshing ? 'spin .6s linear infinite' : 'none' }}><Icons.Refresh /></div>
          </button>
        </Tooltip>

        {/* Back to app */}
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', color: P.textSecondary, border: `1.5px solid ${P.border}`, borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
          <Icons.Back /> Back to App
        </button>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 4px' }} />
        <ProfileDropdown user={user} onLogout={handleLogout} />
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ padding: '28px 28px 60px', maxWidth: 1400, margin: '0 auto' }}>

        {error && (
          <div style={{ padding: '11px 16px', background: '#fef3c7', borderRadius: 10, color: '#92400e', fontSize: 13, marginBottom: 20, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: P.textPrimary, letterSpacing: '-.03em' }}>AdminDashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: P.textMuted }}>User management</p>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard icon={<Icons.Users />}  label="Total Users"    value={stats?.total_users}    color={P.purple600} bg={P.purple100} sub={`${stats?.admin_count ?? 0} admin${stats?.admin_count !== 1 ? 's' : ''}`} />
          <StatCard icon={<Icons.Folder />} label="Total Projects" value={stats?.total_projects}  color="#0ea5e9"   bg="#e0f2fe" border="#bae6fd" />
          <StatCard icon={<Icons.Ticket />} label="Total Tickets"  value={stats?.total_tickets}   color="#8b5cf6"  bg="#f5f3ff" border="#ddd6fe" />
          <StatCard icon={<Icons.Tasks />}  label="Daily Tasks"    value={stats?.total_tasks}     color="#10b981"  bg="#ecfdf5" border="#a7f3d0" />
        </div>

        {/* ── Charts ──────────────────────────────────────────── */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
            <MiniBarChart title="Tickets by Status"   data={Object.fromEntries(Object.entries(stats.tickets_by_status   || {}))} colorMap={ticketStatusColors} />
            <MiniBarChart title="Tickets by Priority" data={Object.fromEntries(Object.entries(stats.tickets_by_priority || {}))} colorMap={priorityColors} />
            <MiniBarChart title="Daily Tasks by Status" data={Object.fromEntries(Object.entries(stats.tasks_by_status   || {}))} colorMap={taskStatusColors} />
            <MiniBarChart title="Project Member Roles" data={Object.fromEntries(Object.entries(stats.members_by_role    || {}))} colorMap={roleColors} />
          </div>
        )}

        {/* ── Users Table ─────────────────────────────────────── */}
        <UsersTable
          users={users}
          currentUserId={user.id}
          onToggleAdmin={handleToggleAdmin}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}