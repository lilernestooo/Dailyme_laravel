import React, { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';

// ── Laravel Flame Logo ─────────────────────────────────────────────────────
function LaravelLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#7c3aed"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#7c3aed" opacity=".35"/>
    </svg>
  );
}

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

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('auth_token') || '';
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      Accept: "application/json",
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: P.textPrimary, color: "#fff", fontSize: 11, fontWeight: 600,
          padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none",
          letterSpacing: ".03em", zIndex: 9999,
        }}>
          {label}
          <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", borderWidth: 4, borderStyle: "solid", borderColor: `transparent transparent ${P.textPrimary} transparent` }} />
        </div>
      )}
    </div>
  );
}

// ── NavIcon ────────────────────────────────────────────────────────────────
function NavIcon({ icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <Tooltip label={label}>
      <button onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: "1.5px solid transparent",
          background: hover ? P.purple50 : "transparent",
          color: hover ? P.purple500 : P.textSecondary,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </button>
    </Tooltip>
  );
}

// ── Profile Dropdown ────────────────────────────────────────────────────────
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: open ? P.purple600 : P.purple500,
          border: open ? `2px solid ${P.purple300}` : "2px solid transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 13,
          cursor: "pointer", transition: "all .15s",
          boxShadow: open ? `0 0 0 3px ${P.purple100}` : "none",
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: P.white, border: `1px solid ${P.purple200}`,
          borderRadius: 14, boxShadow: "0 8px 30px rgba(124,58,237,.12)",
          minWidth: 200, overflow: "hidden", zIndex: 1001,
        }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: P.purple500, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: P.textPrimary }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 11.5, color: P.textMuted }}>{user?.email || ""}</div>
            </div>
          </div>
          <div style={{ padding: "6px 0" }}>
            <button
              onClick={onLogout}
              style={{ width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#dc2626", textAlign: "left", transition: "background .12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project Modal ──────────────────────────────────────────────────────────
function ProjectModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim().length > 0;

  const field = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1.5px solid ${P.border}`, fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', color: P.textPrimary,
    background: P.purple50, transition: 'border-color .15s, box-shadow .15s',
  };
  const focusIn  = (e) => { e.target.style.borderColor = P.purple500; e.target.style.boxShadow = `0 0 0 3px ${P.purple100}`; };
  const focusOut = (e) => { e.target.style.borderColor = P.border; e.target.style.boxShadow = 'none'; };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: P.textSecondary, marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: '.06em' };

  async function handleSave() {
    if (!valid) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 460, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }}
        onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
            <LaravelLogo size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>New Project</h2>
            <p style={{ margin: 0, fontSize: 12, color: P.textMuted }}>Create a new project board</p>
          </div>
        </div>

        <label style={lbl}>Project Name *</label>
        <input value={form.name} onChange={set('name')} placeholder="e.g. Website Redesign" style={field} onFocus={focusIn} onBlur={focusOut} autoFocus />

        <label style={lbl}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="What is this project about?" rows={3}
          style={{ ...field, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14, transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading || !valid}
            style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: valid ? P.purple600 : P.purple300, color: '#fff', cursor: valid ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, boxShadow: valid ? '0 4px 16px rgba(124,58,237,.3)' : 'none', transition: 'all .2s' }}
            onMouseEnter={(e) => { if (valid) e.currentTarget.style.background = P.purple700; }}
            onMouseLeave={(e) => { if (valid) e.currentTarget.style.background = P.purple600; }}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function ProjectList({ user, onOpenProject, onGoToDaily, onLogout }) {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState(null);

  async function loadProjects() {
    try {
      const data = await apiFetch('/api/projects');
      setProjects(data);
    } catch {
      setError('Could not load projects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleCreate(form) {
    try {
      await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(form) });
      setShowModal(false);
      loadProjects();
    } catch {
      alert('Failed to create project.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project and all its tickets?')) return;
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadProjects();
  }

  async function handleLogout() {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch {}
    onLogout();
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: '100vh', background: P.bg }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header style={{
        background: P.white, borderBottom: `1px solid ${P.border}`,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 1px 8px rgba(124,58,237,.06)',
      }}>
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
            <LaravelLogo size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary, letterSpacing: '-.03em' }}>DailyMe</span>
        </div>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />

        {/* Icon nav group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavIcon
            label="Daily Tasks"
            onClick={onGoToDaily}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <Tooltip label="Notifications">
            <NotificationBell onOpenProject={onOpenProject} />
          </Tooltip>
        </div>

        <div style={{ flex: 1 }} />

        {/* Project count chip */}
        <div style={{ fontSize: 12, fontWeight: 600, color: P.purple600, background: P.purple100, padding: '4px 12px', borderRadius: 20, border: `1px solid ${P.purple200}` }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>

        {/* New project button */}
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '7px 16px', background: P.purple600, color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(124,58,237,.3)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = P.purple700; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = P.purple600; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span style={{ fontSize: 16, fontWeight: 400 }}>+</span> New Project
        </button>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 4px' }} />

        {/* Profile dropdown */}
        <ProfileDropdown user={user} onLogout={handleLogout} />
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ padding: '32px 28px' }}>
        {error && (
          <div style={{ padding: '11px 16px', background: '#fef3c7', borderRadius: 10, color: '#92400e', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #fde68a' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: P.purple500, gap: 10 }}>
            <div style={{ width: 18, height: 18, border: `2px solid ${P.purple100}`, borderTopColor: P.purple600, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            Loading projects…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>

        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: P.purple300 }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', color: P.textPrimary, fontSize: 18, fontWeight: 700 }}>No projects yet</h3>
            <p style={{ margin: '0 0 24px', color: P.textSecondary, fontSize: 14 }}>Create your first project to get started</p>
            <button onClick={() => setShowModal(true)}
              style={{ padding: '10px 24px', background: P.purple600, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(124,58,237,.3)', transition: 'all .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = P.purple700; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = P.purple600; e.currentTarget.style.transform = 'translateY(0)'; }}>
              + Create Project
            </button>
          </div>

        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => onOpenProject(project)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && <ProjectModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen, onDelete }) {
  const [hover, setHover] = useState(false);
  const isOwner = project.is_owner;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: P.white, borderRadius: 16, padding: 22,
        border: hover ? `1px solid ${P.purple300}` : `1px solid ${P.border}`,
        boxShadow: hover ? '0 4px 24px rgba(124,58,237,.1)' : '0 1px 6px rgba(124,58,237,.05)',
        transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 0,
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.purple600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: isOwner ? P.purple100 : '#ecfdf5',
          color: isOwner ? P.purple600 : '#10b981',
          border: `1px solid ${isOwner ? P.purple200 : '#a7f3d0'}`,
        }}>
          {isOwner ? 'Owner' : 'Member'}
        </span>
      </div>

      <h3 style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 700, color: P.textPrimary }}>{project.name}</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: P.textSecondary, lineHeight: 1.5 }}>
        {project.description || 'No description'}
      </p>

      {/* Members */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex' }}>
          {project.members?.slice(0, 4).map((m, i) => (
            <div key={m.id} title={m.user?.name} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: P.purple500, border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 11,
              marginLeft: i > 0 ? -8 : 0,
            }}>
              {m.user?.name?.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 12, color: P.textMuted }}>
          {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onOpen}
          style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: P.purple600, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onMouseEnter={(e) => e.currentTarget.style.background = P.purple700}
          onMouseLeave={(e) => e.currentTarget.style.background = P.purple600}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Open Board
        </button>
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid #fca5a5`, background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}