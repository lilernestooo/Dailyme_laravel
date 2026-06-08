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

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       color: '#6366f1', bg: '#eef2ff' },
  { key: 'in_progress', label: 'In Progress',  color: '#f59e0b', bg: '#fffbeb' },
  { key: 'review',      label: 'Review',       color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'done',        label: 'Done',         color: '#10b981', bg: '#ecfdf5' },
  { key: 'archived',    label: 'Archived',     color: '#6b7280', bg: '#f9fafb' },
];

const PRIORITY_COLORS = {
  low:    { text: '#059669', bg: '#d1fae5' },
  medium: { text: '#d97706', bg: '#fef3c7' },
  high:   { text: '#dc2626', bg: '#fee2e2' },
};

// ─── Ticket Modal (Create/Edit) ───────────────────────────────────────────────
function TicketModal({ ticket, members, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       ticket?.title       || '',
    description: ticket?.description || '',
    priority:    ticket?.priority    || 'medium',
    assigned_to: ticket?.assigned_to || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 };

  async function handleSave() {
    if (!form.title.trim()) return;
    setLoading(true);
    await onSave({ ...form, assigned_to: form.assigned_to || null });
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>{ticket ? 'Edit Ticket' : 'New Ticket'}</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Fill in the ticket details and assign a member</p>

        <label style={labelStyle}>Title *</label>
        <input value={form.title} onChange={set('title')} placeholder="What needs to be done?" style={inputStyle} autoFocus />

        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="Describe the task in detail..." rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={set('priority')} style={inputStyle}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Assign To</label>
            <select value={form.assigned_to} onChange={set('assigned_to')} style={inputStyle}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151', fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} disabled={loading || !form.title.trim()} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: form.title.trim() ? '#6366f1' : '#c7d2fe', color: '#fff', cursor: form.title.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>
            {loading ? 'Saving...' : ticket ? 'Save Changes' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Modal (Approve/Reject with comment) ───────────────────────────────
function ReviewModal({ ticket, projectId, onDone, onClose }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAction(type) {
    if (!comment.trim()) { alert('Please leave a comment.'); return; }
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment, type }),
      });
      onDone();
    } catch (e) {
      alert('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>📋 Review Ticket</h2>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#374151' }}>{ticket.title}</p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>{ticket.description}</p>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your Review Comment *</label>
        <textarea
          value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Leave feedback for the developer..."
          rows={4}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
        />

        {/* Previous comments */}
        {ticket.comments?.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 160, overflowY: 'auto' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 8px' }}>PREVIOUS COMMENTS</p>
            {ticket.comments.map((c) => (
              <div key={c.id} style={{ padding: '8px 12px', borderRadius: 8, background: c.type === 'approve' ? '#ecfdf5' : c.type === 'reject' ? '#fee2e2' : '#f9fafb', marginBottom: 6, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{c.user?.name}</span>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: c.type === 'approve' ? '#10b981' : c.type === 'reject' ? '#ef4444' : '#6b7280', color: '#fff', fontWeight: 600 }}>
                    {c.type}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>{c.comment}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151', fontSize: 14 }}>Cancel</button>
          <button onClick={() => handleAction('reject')} disabled={loading} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            ✗ Reject
          </button>
          <button onClick={() => handleAction('approve')} disabled={loading} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            ✓ Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Comments View Modal (read-only, for members) ─────────────────────────────
// AFTER
function CommentsModal({ ticket, projectId, onClose, onReplied }) {
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    async function handleReply() {
      if (!reply.trim()) return;
      setLoading(true);
      setError(null);
      try {
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ comment: reply, type: 'comment' }),
        });
        setReply('');
        onReplied();
      } catch (e) {
        setError('Failed to send reply.');
      } finally {
        setLoading(false);
      }
    }
  
    const TYPE_STYLES = {
    approve: { bg: '#ecfdf5', border: '#6ee7b7', badge: '#10b981', label: 'Approved' },
    reject:  { bg: '#fff1f2', border: '#fda4af', badge: '#ef4444', label: 'Rejected' },
    comment: { bg: '#f8fafc', border: '#e2e8f0', badge: '#6b7280', label: 'Comment'  },
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: 28, width: 500, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>💬 Comments</h2>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>{ticket.title}</p>
          {ticket.description && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{ticket.description}</p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e5e7eb', marginBottom: 16 }} />

        {/* Comments list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!ticket.comments?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              No comments yet
            </div>
          ) : (
            ticket.comments.map((c) => {
              const s = TYPE_STYLES[c.type] || TYPE_STYLES.comment;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {/* Avatar */}
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.user?.name}</span>
                    {/* Type badge */}
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: s.badge, color: '#fff', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginLeft: 'auto' }}>
                      {s.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{c.comment}</p>
                </div>
              );
            })
          )}
        </div>

{/* Footer — reply box */}
<div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
          {error && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 12, marginBottom: 10 }}>
              ⚠️ {error}
            </div>
          )}
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply to the owner's feedback..."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151', fontSize: 13 }}
            >
              Close
            </button>
            <button
              onClick={handleReply}
              disabled={loading || !reply.trim()}
              style={{ flex: 2, padding: '9px 0', borderRadius: 8, border: 'none', background: reply.trim() ? '#6366f1' : '#c7d2fe', color: '#fff', cursor: reply.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 13 }}
            >
              {loading ? 'Sending...' : '↩ Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ projectId, onDone, onClose }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      onDone();
    } catch (e) {
      const msg = JSON.parse(e.message);
      setError(msg.message || 'Failed to invite member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111827' }}>👥 Invite Member</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Invite a registered user to join this project</p>

        {error && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="member@example.com"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 500, color: '#374151', fontSize: 14 }}>Cancel</button>
          <button onClick={handleInvite} disabled={loading || !email.trim()} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: email.trim() ? '#6366f1' : '#c7d2fe', color: '#fff', cursor: email.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>
            {loading ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ ticket, isOwner, projectId, onEdit, onDelete, onReview, onMove, onViewComments, currentColumn }) {
  const p = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium;

  // What moves are allowed
  const memberMoves = { todo: 'in_progress', in_progress: 'review' };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' }}>

      {/* Priority + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20, color: p.text, background: p.bg }}>
          {ticket.priority}
        </span>
        {isOwner && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => onEdit(ticket)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.6 }}>✏️</button>
            <button onClick={() => onDelete(ticket.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.6 }}>🗑</button>
          </div>
        )}
      </div>

      <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{ticket.title}</p>
      {ticket.description && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{ticket.description}</p>}

      {/* Assignee */}
      {ticket.assignee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>
            {ticket.assignee.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{ticket.assignee.name}</span>
        </div>
      )}

      {/* Comments count — clickable for everyone */}
      {ticket.comments?.length > 0 && (
        <button
          onClick={() => onViewComments(ticket)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#f0f4ff', border: '1px solid #c7d2fe',
            borderRadius: 6, padding: '3px 10px', marginBottom: 10,
            cursor: 'pointer', fontSize: 11, color: '#4f46e5', fontWeight: 600,
          }}
        >
          💬 {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''} — view
        </button>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {/* Member move */}
        {!isOwner && memberMoves[currentColumn] && (
          <button onClick={() => onMove(ticket, memberMoves[currentColumn])} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid #6366f1', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            → {COLUMNS.find(c => c.key === memberMoves[currentColumn])?.label}
          </button>
        )}

        {/* Owner review button */}
        {isOwner && currentColumn === 'review' && (
          <button onClick={() => onReview(ticket)} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            📋 Review
          </button>
        )}

        {/* Owner archive button */}
        {isOwner && currentColumn === 'done' && (
          <button onClick={() => onMove(ticket, 'archived')} style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid #6b7280', background: '#f9fafb', color: '#6b7280', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            📦 Archive
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ProjectBoard ────────────────────────────────────────────────────────
export default function ProjectBoard({ project, user, onBack, onLogout }) {
  const [columns, setColumns]           = useState({ todo: [], in_progress: [], review: [], done: [], archived: [] });
  const [members, setMembers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [ticketModal, setTicketModal]   = useState(null);
  const [reviewModal, setReviewModal]   = useState(null);
  const [commentsModal, setCommentsModal] = useState(null); // ← NEW
  const [inviteModal, setInviteModal]   = useState(false);
  const [error, setError]               = useState(null);
  const [projectData, setProjectData]   = useState(project);
  const [showMembers, setShowMembers]   = useState(false);

  const isOwner = project.is_owner || project.owner_id === user.id;

  async function loadBoard() {
    try {
      const [ticketsData, projectDetail] = await Promise.all([
        apiFetch(`/api/projects/${project.id}/tickets`),
        apiFetch(`/api/projects/${project.id}`),
      ]);
      setColumns(ticketsData);
      setMembers(projectDetail.members || []);
      setProjectData(projectDetail);
    } catch (e) {
      setError('Could not load board.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBoard(); }, []);

  async function handleSaveTicket(form) {
    try {
      if (ticketModal.ticket) {
        await apiFetch(`/api/projects/${project.id}/tickets/${ticketModal.ticket.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch(`/api/projects/${project.id}/tickets`, { method: 'POST', body: JSON.stringify(form) });
      }
      setTicketModal(null);
      loadBoard();
    } catch (e) {
      alert('Failed to save ticket.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this ticket?')) return;
    await apiFetch(`/api/projects/${project.id}/tickets/${id}`, { method: 'DELETE' });
    loadBoard();
  }

  async function handleMove(ticket, newStatus) {
    try {
      await apiFetch(`/api/projects/${project.id}/tickets/${ticket.id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadBoard();
    } catch (e) {
      const msg = JSON.parse(e.message);
      alert(msg.message || 'Cannot make this move.');
    }
  }

  const totalTickets = Object.values(columns).flat().length;
  const doneTickets  = columns.done?.length ?? 0;
  const progress     = totalTickets ? Math.round((doneTickets / totalTickets) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280', fontFamily: 'system-ui' }}>
      Loading board...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#f3f4f6' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', padding: '4px 8px', borderRadius: 8 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>🗂 {projectData.name}</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>{doneTickets}/{totalTickets} tickets done · {progress}%</p>
        </div>
        <div style={{ flex: 1 }} />

        {/* Progress bar */}
        <div style={{ width: 140, height: 6, background: '#e5e7eb', borderRadius: 99 }}>
          <div style={{ height: '100%', borderRadius: 99, background: '#10b981', width: `${progress}%`, transition: 'width .4s ease' }} />
        </div>

            {/* Members avatars + dropdown */}
            <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMembers((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e7eb', borderRadius: 10, padding: '5px 10px', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex' }}>
                {members.slice(0, 4).map((m, i) => (
                    <div key={m.id} title={m.user?.name} style={{ width: 26, height: 26, borderRadius: '50%', background: '#6366f1', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, marginLeft: i > 0 ? -8 : 0 }}>
                    {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                ))}
                {members.length > 4 && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e5e7eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 700, fontSize: 10, marginLeft: -8 }}>
                    +{members.length - 4}
                    </div>
                )}
                </div>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                {members.length} member{members.length !== 1 ? 's' : ''} ▾
                </span>
            </button>

            {showMembers && (
                <>
                {/* Backdrop to close on outside click */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMembers(false)} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.1)', minWidth: 220, zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    Project Developers
                    </div>
                    {members.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #f9fafb' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.user?.id === projectData.owner_id ? '#6366f1' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.user?.id === projectData.owner_id ? '#fff' : '#6366f1', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {m.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user?.email}</div>
                        </div>
                        {m.user?.id === projectData.owner_id && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#eef2ff', color: '#6366f1', flexShrink: 0 }}>Owner</span>
                        )}
                    </div>
                    ))}
                </div>
                </>
            )}
            </div>

        {/* Owner actions */}
        {isOwner && (
          <>
            <button onClick={() => setInviteModal(true)} style={{ padding: '9px 16px', background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
              👥 Invite
            </button>
            <button onClick={() => setTicketModal({ ticket: null })} style={{ padding: '9px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + New Ticket
            </button>
          </>
        )}

        {/* User avatar */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <button onClick={onLogout}
          style={{ padding: '9px 16px', background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          Signout
        </button>
      </div>

      {error && <div style={{ margin: 24, padding: 16, background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 14 }}>⚠️ {error}</div>}

      {/* Board columns */}
      <div style={{ display: 'flex', gap: 16, padding: '24px 32px', alignItems: 'flex-start', overflowX: 'auto' }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ minWidth: 280, flex: '0 0 280px', background: '#f9fafb', borderRadius: 16, padding: 16, border: '1px solid #e5e7eb' }}>

            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', flex: 1 }}>{col.label}</h3>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: col.bg, color: col.color }}>
                {columns[col.key]?.length || 0}
              </span>
            </div>

            {/* Tickets */}
            <div style={{ minHeight: 80 }}>
              {(columns[col.key] || []).length === 0 && (
                <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  No tickets
                </div>
              )}
              {(columns[col.key] || []).map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isOwner={isOwner}
                  projectId={project.id}
                  currentColumn={col.key}
                  onEdit={(t) => setTicketModal({ ticket: t })}
                  onDelete={handleDelete}
                  onReview={(t) => setReviewModal(t)}
                  onMove={handleMove}
                  onViewComments={(t) => setCommentsModal(t)}  // ← NEW
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {ticketModal && (
        <TicketModal
          ticket={ticketModal.ticket}
          members={members}
          onSave={handleSaveTicket}
          onClose={() => setTicketModal(null)}
        />
      )}

      {reviewModal && (
        <ReviewModal
          ticket={reviewModal}
          projectId={project.id}
          onDone={() => { setReviewModal(null); loadBoard(); }}
          onClose={() => setReviewModal(null)}
        />
      )}

        {commentsModal && (
        <CommentsModal
          ticket={commentsModal}
          projectId={project.id}
          onClose={() => setCommentsModal(null)}
          onReplied={() => { setCommentsModal(null); loadBoard(); }}    
        />
      )}

      {inviteModal && (
        <InviteModal
          projectId={project.id}
          onDone={() => { setInviteModal(false); loadBoard(); }}
          onClose={() => setInviteModal(false)}
        />
      )}
    </div>
  );
}