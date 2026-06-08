import React, { useState, useEffect } from 'react';

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

function ProjectModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e5e7eb', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 };

  async function handleSave() {
    if (!form.name.trim()) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>New Project</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Create a new project board</p>
        <label style={labelStyle}>Project Name *</label>
        <input value={form.name} onChange={set('name')} placeholder="e.g. Website Redesign" style={inputStyle} autoFocus />
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="What is this project about?" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} disabled={loading || !form.name.trim()} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: form.name.trim() ? '#6366f1' : '#c7d2fe', color: '#fff', cursor: form.name.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectList({ user, onOpenProject, onGoToDaily, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]       = useState(null);

  async function loadProjects() {
    try {
      const data = await apiFetch('/api/projects');
      setProjects(data);
    } catch (e) {
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
    } catch (e) {
      alert('Failed to create project.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project and all its tickets?')) return;
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadProjects();
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f3f4f6' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>🗂 Projects</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ flex: 1 }} />

        {/* User avatar */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{user.name}</span>
          </div>
        )}

        <button onClick={onGoToDaily} style={{ padding: '9px 16px', background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
          📋 Daily Tasks
        </button>

        <button onClick={() => setShowModal(true)} style={{ padding: '9px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          + New Project
        </button>

        <button onClick={onLogout}
          style={{ padding: '9px 16px', background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {error && <div style={{ padding: 16, background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 14, marginBottom: 20 }}>⚠️ {error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗂</div>
            <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: 18, fontWeight: 700 }}>No projects yet</h3>
            <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14 }}>Create your first project to get started</p>
            <button onClick={() => setShowModal(true)} style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + Create Project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {projects.map((project) => (
              <div key={project.id} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Project card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    🗂
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: project.is_owner ? '#eef2ff' : '#ecfdf5', color: project.is_owner ? '#6366f1' : '#10b981' }}>
                    {project.is_owner ? 'Owner' : 'Member'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>{project.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{project.description || 'No description'}</p>

                {/* Members */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 4).map((m, i) => (
                      <div key={m.id} title={m.user?.name} style={{ width: 26, height: 26, borderRadius: '50%', background: '#6366f1', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, marginLeft: i > 0 ? -8 : 0 }}>
                        {m.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onOpenProject(project)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    Open Board
                  </button>
                  {project.is_owner && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProjectModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
    </div>
  );
}