import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarOutlined,
  PlusOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  LogoutOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Card } from 'antd';
import { ProjectListPageSkeleton } from './Skeleton';
import NotificationBell from './NotificationBell';
import logo from '../assets/logo-dailyme(1).png';

// ── DailyMe Logo ───────────────────────────────────────────────────────────
function DailyMeLogo({ size = 28 }) {
  return (
    <img src={logo} alt="DailyMe" style={{ width: size, height: size, objectFit: 'contain' }} />
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
              <LogoutOutlined style={{ fontSize: 15 }} />
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
  const [form, setForm] = useState({ name: '', description: '', qa_required: false });
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
          <DailyMeLogo size={50} />
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

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.qa_required}
            onChange={e => setForm(f => ({ ...f, qa_required: e.target.checked }))}
            style={{ width: 16, height: 16, accentColor: P.purple600, cursor: 'pointer' }}
          />
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: P.textPrimary }}>Require QA review</span>
            {form.qa_required && (
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: P.textMuted }}>
                Tickets in Review must be passed by a QA member before the owner can mark them Done.
              </p>
            )}
          </div>
        </label>

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

  if (loading) return <ProjectListPageSkeleton count={6} />;

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
          <DailyMeLogo size={50} />
          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary, letterSpacing: '-.03em' }}>DailyMe</span>
        </div>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />

        {/* Icon nav group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavIcon
            label="Daily Tasks"
            onClick={onGoToDaily}
            icon={<CalendarOutlined style={{ fontSize: 16 }} />}
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
          <PlusOutlined /> New Project
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

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: P.purple300 }}>
            <FolderOpenOutlined style={{ fontSize: 52, color: P.purple300 }} />            
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
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      bodyStyle={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 0 }}
      style={{
        borderRadius: 16,
        border: hover ? `1px solid ${P.purple300}` : `1px solid ${P.border}`,
        boxShadow: hover ? '0 4px 24px rgba(124,58,237,.1)' : '0 1px 6px rgba(124,58,237,.05)',
        transition: 'all .15s',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.purple600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
         <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: isOwner ? P.purple100 : '#ecfdf5',
            color: isOwner ? P.purple600 : '#10b981',
            border: `1px solid ${isOwner ? P.purple200 : '#a7f3d0'}`,
          }}>
            {isOwner ? 'Owner' : 'Member'}
          </span>
          {project.qa_required && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
            }}>
              QA
            </span>
          )}
        </div>
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
          <AppstoreOutlined style={{ fontSize: 13 }} />
          Open Board
        </button>
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid #fca5a5`, background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
          >
            <DeleteOutlined style={{ fontSize: 13 }} />
          </button>
        )}
      </div>
      </Card>
  );
}