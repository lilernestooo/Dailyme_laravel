import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserAddOutlined,
  PlusOutlined,
  MessageOutlined,
  AuditOutlined,
  InboxOutlined,
  ArrowRightOutlined,
  LogoutOutlined,
  MailOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  CrownOutlined,
  TagOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Card } from 'antd';
import { KanbanBoardSkeleton } from './Skeleton';
import NotificationBell from './NotificationBell';
import TicketDetail from './TicketDetail';

const STYLE_ID = 'btn-spin-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = '@keyframes btnSpin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

// ── Palette (matches KanbanBoard exactly) ─────────────────────────────────
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
  borderMid:     '#c4b5fd',
  white:         '#ffffff',
  bg:            '#faf9ff',
};

// ── Laravel Flame Logo (matches KanbanBoard) ───────────────────────────────
function LaravelLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#7c3aed"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#7c3aed" opacity=".35"/>
    </svg>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft:      () => <ArrowLeftOutlined style={{ fontSize: 16 }} />,
  Edit:           () => <EditOutlined style={{ fontSize: 13 }} />,
  Trash:          () => <DeleteOutlined style={{ fontSize: 13 }} />,
  Users:          () => <TeamOutlined style={{ fontSize: 16 }} />,
  UserPlus:       () => <UserAddOutlined style={{ fontSize: 15 }} />,
  Plus:           () => <PlusOutlined style={{ fontSize: 15 }} />,
  MessageSquare:  () => <MessageOutlined style={{ fontSize: 13 }} />,
  ClipboardCheck: () => <AuditOutlined style={{ fontSize: 14 }} />,
  Archive:        () => <InboxOutlined style={{ fontSize: 14 }} />,
  ArrowRight:     () => <ArrowRightOutlined style={{ fontSize: 13 }} />,
  LogOut:         () => <LogoutOutlined style={{ fontSize: 15 }} />,
  Mail:           () => <MailOutlined style={{ fontSize: 16 }} />,
  Check:          () => <CheckOutlined style={{ fontSize: 14 }} />,
  X:              () => <CloseOutlined style={{ fontSize: 14 }} />,
  Reply:          () => <RollbackOutlined style={{ fontSize: 14 }} />,
  Crown:          () => <CrownOutlined style={{ fontSize: 12 }} />,
  Ticket:         () => <TagOutlined style={{ fontSize: 16 }} />,
  Inbox:          () => <InboxOutlined style={{ fontSize: 22 }} />,
};

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       color: P.purple600,  light: P.purple50,  dot: P.purple400,  border: P.purple200 },
  { key: 'in_progress', label: 'In Progress',  color: '#0ea5e9',    light: '#f0f9ff',   dot: '#38bdf8',    border: '#bae6fd'   },
  { key: 'review',      label: 'Review',       color: '#8b5cf6',    light: '#f5f3ff',   dot: '#a78bfa',    border: '#ddd6fe'   },
  { key: 'done',        label: 'Done',         color: '#10b981',    light: '#ecfdf5',   dot: '#34d399',    border: '#a7f3d0'   },
  { key: 'qa_approved', label: 'QA Approved',  color: '#f59e0b',    light: '#fffbeb',   dot: '#fbbf24',    border: '#fde68a'   },
  { key: 'archived',    label: 'Archived',     color: '#6b7280',    light: '#f9fafb',   dot: '#9ca3af',    border: '#e5e7eb'   },
];

const PRIORITY = {
  low:    { label: 'Low',    text: '#065f46', bg: '#d1fae5', dot: '#34d399' },
  medium: { label: 'Medium', text: '#92400e', bg: '#fef3c7', dot: '#fbbf24' },
  high:   { label: 'High',   text: '#991b1b', bg: '#fee2e2', dot: '#f87171' },
};

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('auth_token') || '';
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      Accept: 'application/json',
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
    <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: P.textPrimary, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '.03em', zIndex: 9999 }}>
          {label}
          <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: 4, borderStyle: 'solid', borderColor: `transparent transparent ${P.textPrimary} transparent` }} />
        </div>
      )}
    </div>
  );
}

// ── Ticket Modal ───────────────────────────────────────────────────────────
function TicketModal({ ticket, members, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       ticket?.title       || '',
    description: ticket?.description || '',
    priority:    ticket?.priority    || 'medium',
    assigned_to: ticket?.assigned_to || '',
    progress:    ticket?.progress    ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim().length > 0;

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
    await onSave({ ...form, assigned_to: form.assigned_to || null });
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 480, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
            <Icons.Ticket />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>{ticket ? 'Edit Ticket' : 'New Ticket'}</h2>
            <p style={{ margin: 0, fontSize: 12, color: P.textMuted }}>{ticket ? 'Update ticket details' : 'Add a ticket to the board'}</p>
          </div>
        </div>

        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={set('title')} placeholder="What needs to be done?" style={field} onFocus={focusIn} onBlur={focusOut} autoFocus />

        <label style={lbl}>Description</label>
        <textarea value={form.description} onChange={set('description')} placeholder="Add details…" rows={3} style={{ ...field, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Priority</label>
            <select value={form.priority} onChange={set('priority')} style={field} onFocus={focusIn} onBlur={focusOut}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Assign To</label>
            <select value={form.assigned_to} onChange={set('assigned_to')} style={field} onFocus={focusIn} onBlur={focusOut}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={lbl}>Progress — {form.progress}%</label>
        <div style={{ padding: '4px 0 8px' }}>
          <input
            type="range" min={0} max={100} step={5}
            value={form.progress}
            onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: P.purple600, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: P.textMuted, marginTop: 2 }}>
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14, transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !valid}
            style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: valid ? P.purple600 : P.purple300, color: '#fff', cursor: valid ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, boxShadow: valid ? '0 4px 16px rgba(124,58,237,.3)' : 'none', transition: 'all .2s' }}
            onMouseEnter={(e) => { if (valid) e.currentTarget.style.background = P.purple700; }}
            onMouseLeave={(e) => { if (valid) e.currentTarget.style.background = P.purple600; }}>
            {loading ? 'Saving…' : ticket ? 'Save Changes' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Modal ───────────────────────────────────────────────────────────
function ReviewModal({ ticket, projectId, onDone, onClose, userRole, fromColumn }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const field = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${P.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: P.textPrimary, background: P.purple50 };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: P.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' };

  async function handleAction(decision) {
    if (!comment.trim()) { alert('Please leave a comment.'); return; }
    setLoading(true);
    try {
      if (userRole === 'qa') {
        // QA reject: post qa_feedback comment first, then move ticket back
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ comment, type: 'qa_feedback' }),
        });
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/move`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' }),
        });
      } else if (userRole === 'owner' && fromColumn === 'qa_approved') {
        // Owner reject after QA passed: post regular comment, move back to in_progress
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ comment, type: 'reject' }),
        });
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/move`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'in_progress' }),
        });
      } else {
        // Owner review on non-QA project: original approve/reject comment flow
        await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ comment, type: decision }),
        });
      }
      onDone();
    } catch {
      alert('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  }

  const TYPE_STYLES = {
    approve: { bg: '#ecfdf5', border: '#a7f3d0', badge: '#10b981', label: 'Approved' },
    reject:  { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'Rejected' },
    comment: { bg: P.purple50, border: P.purple200, badge: P.purple500, label: 'Comment' },
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 500, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}`, color: P.purple600 }}>
            <Icons.ClipboardCheck />
          </div>
          <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>
              {userRole === 'qa' ? 'QA Rejection Feedback' : fromColumn === 'qa_approved' ? 'Reject After QA' : 'Review Ticket'}
            </h2>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: P.textSecondary }}>{ticket.title}</p>
          </div>
        </div>

        {ticket.description && <p style={{ margin: '0 0 20px', fontSize: 13, color: P.textMuted, lineHeight: 1.6, padding: '10px 14px', background: P.purple50, borderRadius: 10, border: `1px solid ${P.border}` }}>{ticket.description}</p>}

        {ticket.comments?.length > 0 && (
          <div style={{ marginBottom: 20, maxHeight: 180, overflowY: 'auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: P.textMuted, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Previous Comments</p>
            {ticket.comments.map((c) => {
              const s = TYPE_STYLES[c.type] || TYPE_STYLES.comment;
              return (
                <div key={c.id} style={{ padding: '10px 14px', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: P.purple500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>{c.user?.name?.charAt(0).toUpperCase()}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: P.textPrimary }}>{c.user?.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: s.badge, color: '#fff', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginLeft: 'auto' }}>{s.label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: P.textSecondary, lineHeight: 1.5 }}>{c.comment}</p>
                </div>
              );
            })}
          </div>
        )}

        <label style={lbl}>Your Review Comment *</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder={userRole === 'qa' ? 'Required: describe what needs to be fixed…' : 'Leave a comment…'}
          rows={4} style={{ ...field, resize: 'vertical' }} />

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; }}>
            Cancel
          </button>
          <button onClick={() => handleAction('reject')} disabled={loading}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
            <Icons.X /> Reject
          </button>
          {userRole !== 'qa' && fromColumn !== 'qa_approved' && (
            <button onClick={() => handleAction('approve')} disabled={loading}
              style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: '#d1fae5', color: '#065f46', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#a7f3d0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#d1fae5'}>
              <Icons.Check /> Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Comments Modal ─────────────────────────────────────────────────────────
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
    } catch {
      setError('Failed to send reply.');
    } finally {
      setLoading(false);
    }
  }

  const TYPE_STYLES = {
    approve: { bg: '#ecfdf5', border: '#a7f3d0', badge: '#10b981', label: 'Approved' },
    reject:  { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'Rejected' },
    comment: { bg: P.purple50, border: P.purple200, badge: P.purple500, label: 'Comment' },
  };

  const field = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${P.border}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: P.purple50, color: P.textPrimary, resize: 'vertical' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}`, color: P.purple600 }}>
            <Icons.MessageSquare />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>Comments</h2>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: P.textSecondary }}>{ticket.title}</p>
          </div>
        </div>

        {ticket.description && <p style={{ margin: '0 0 16px', fontSize: 13, color: P.textMuted, lineHeight: 1.6, padding: '10px 14px', background: P.purple50, borderRadius: 10, border: `1px solid ${P.border}` }}>{ticket.description}</p>}

        <div style={{ height: 1, background: P.border, marginBottom: 16 }} />

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!ticket.comments?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: P.textMuted, fontSize: 13 }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: P.purple300 }}><Icons.MessageSquare /></div>
              No comments yet
            </div>
          ) : (
            ticket.comments.map((c) => {
              const s = TYPE_STYLES[c.type] || TYPE_STYLES.comment;
              return (
                <div key={c.id} style={{ padding: '12px 14px', borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: P.purple500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: P.textPrimary }}>{c.user?.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: s.badge, color: '#fff', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginLeft: 'auto' }}>{s.label}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: P.textSecondary, lineHeight: 1.6 }}>{c.comment}</p>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 16, borderTop: `1px solid ${P.border}`, paddingTop: 16 }}>
          {error && <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 12, marginBottom: 10 }}>⚠ {error}</div>}
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" rows={3} style={field} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; }}>
              Close
            </button>
            <button onClick={handleReply} disabled={loading || !reply.trim()}
              style={{ flex: 2, padding: '10px 0', borderRadius: 12, border: 'none', background: reply.trim() ? P.purple600 : P.purple300, color: '#fff', cursor: reply.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: reply.trim() ? '0 4px 16px rgba(124,58,237,.3)' : 'none', transition: 'all .2s' }}
              onMouseEnter={(e) => { if (reply.trim()) e.currentTarget.style.background = P.purple700; }}
              onMouseLeave={(e) => { if (reply.trim()) e.currentTarget.style.background = P.purple600; }}>
              <Icons.Reply /> {loading ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Invite Modal ───────────────────────────────────────────────────────────
function InviteModal({ projectId, onDone, onClose }) {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const field = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${P.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: P.textPrimary, background: P.purple50, transition: 'border-color .15s, box-shadow .15s' };
  const focusIn  = (e) => { e.target.style.borderColor = P.purple500; e.target.style.boxShadow = `0 0 0 3px ${P.purple100}`; };
  const focusOut = (e) => { e.target.style.borderColor = P.border; e.target.style.boxShadow = 'none'; };

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 440, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}`, color: P.purple600 }}>
            <Icons.UserPlus />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>Invite Member</h2>
            <p style={{ margin: 0, fontSize: 12, color: P.textMuted }}>Invite a registered user to this project</p>
          </div>
        </div>

        {error && <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 10, color: '#991b1b', fontSize: 13, marginBottom: 16, border: '1px solid #fecaca' }}>⚠ {error}</div>}

        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Email Address</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: P.textMuted, display: 'flex', alignItems: 'center' }}><Icons.Mail /></div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com"
            style={{ ...field, paddingLeft: 42 }} onFocus={focusIn} onBlur={focusOut}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()} autoFocus />
            </div>
    
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.textSecondary, marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${P.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: P.textPrimary, background: P.purple50 }}>
              <option value="member">Developer / Member</option>
              <option value="qa">QA (Quality Assurance)</option>
            </select>
    
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14, transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
            Cancel
          </button>
          <button onClick={handleInvite} disabled={loading || !email.trim()}
            style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: email.trim() ? P.purple600 : P.purple300, color: '#fff', cursor: email.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, boxShadow: email.trim() ? '0 4px 16px rgba(124,58,237,.3)' : 'none', transition: 'all .2s' }}
            onMouseEnter={(e) => { if (email.trim()) e.currentTarget.style.background = P.purple700; }}
            onMouseLeave={(e) => { if (email.trim()) e.currentTarget.style.background = P.purple600; }}>
            {loading ? 'Inviting…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Members Dropdown ───────────────────────────────────────────────────────
function MembersDropdown({ members, projectData }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClick() { setOpen(false); }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: open ? P.purple50 : 'transparent', border: `1.5px solid ${open ? P.purple300 : P.border}`, borderRadius: 10, padding: '5px 10px', cursor: 'pointer', transition: 'all .15s', color: P.textSecondary }}
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; }}}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = P.border; }}}>
        <div style={{ display: 'flex' }}>
          {members.slice(0, 4).map((m, i) => (
            <div key={m.id} title={m.user?.name} style={{ width: 24, height: 24, borderRadius: '50%', background: P.purple500, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, marginLeft: i > 0 ? -8 : 0 }}>
              {m.user?.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {members.length > 4 && (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: P.purple200, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.purple600, fontWeight: 700, fontSize: 9, marginLeft: -8 }}>
              +{members.length - 4}
            </div>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{members.length} member{members.length !== 1 ? 's' : ''}</span>
        <DownOutlined style={{ fontSize: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: P.white, border: `1px solid ${P.purple200}`, borderRadius: 14, boxShadow: '0 8px 30px rgba(124,58,237,.12)', minWidth: 230, zIndex: 100, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${P.border}`, fontSize: 11, fontWeight: 700, color: P.textMuted, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Project Members
            </div>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${P.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.user?.id === projectData.owner_id ? P.purple600 : P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.user?.id === projectData.owner_id ? '#fff' : P.purple600, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {m.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user?.name}</div>
                  <div style={{ fontSize: 11, color: P.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user?.email}</div>
                </div>
                {m.user?.id === projectData.owner_id ? (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: P.purple100, color: P.purple600, display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <Icons.Crown /> Owner
                  </span>
                ) : m.role === 'qa' ? (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', flexShrink: 0 }}>
                    QA
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Progress Modal ─────────────────────────────────────────────────────────
function ProgressModal({ ticket, projectId, onDone, onClose }) {
  const [progress, setProgress] = useState(ticket.progress ?? 0);
  const [loading, setLoading]   = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify({ progress }),
      });
      onDone();
    } catch {
      alert('Failed to update progress.');
    } finally {
      setLoading(false);
    }
  }

  const pColor = progress === 100 ? '#10b981' : progress >= 50 ? P.purple600 : '#f59e0b';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(107,114,128,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: P.white, borderRadius: 20, padding: 32, width: 420, maxWidth: '94vw', boxShadow: '0 8px 40px rgba(124,58,237,.12)', border: `1px solid ${P.purple200}` }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}`, color: P.purple600 }}>
          <CheckCircleOutlined style={{ fontSize: 16 }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: '-.02em' }}>Update Progress</h2>
            <p style={{ margin: 0, fontSize: 12, color: P.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{ticket.title}</p>
          </div>
        </div>

        {/* Big percentage display */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: pColor, letterSpacing: '-.04em', lineHeight: 1, transition: 'color .2s' }}>
            {progress}%
          </div>
          <div style={{ fontSize: 12, color: P.textMuted, marginTop: 4 }}>
            {progress === 0 ? 'Not started' : progress === 100 ? 'Complete!' : progress >= 75 ? 'Almost there' : progress >= 50 ? 'Halfway through' : progress >= 25 ? 'Just getting started' : 'Early stages'}
          </div>
        </div>

        {/* Progress bar preview */}
        <div style={{ height: 8, background: P.purple100, borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: pColor, width: `${progress}%`, transition: 'width .2s ease, background .2s' }} />
        </div>

        {/* Slider */}
        <input
          type="range" min={0} max={100} step={5}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          style={{ width: '100%', accentColor: P.purple600, cursor: 'pointer', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: P.textMuted, marginBottom: 24 }}>
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>

        {/* Quick select */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[0, 25, 50, 75, 100].map((v) => (
            <button key={v} onClick={() => setProgress(v)}
              style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1.5px solid ${progress === v ? P.purple400 : P.border}`, background: progress === v ? P.purple50 : P.white, color: progress === v ? P.purple600 : P.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
              {v}%
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontWeight: 600, color: P.textSecondary, fontSize: 14 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: P.purple600, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(124,58,237,.3)', transition: 'all .2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = P.purple700}
            onMouseLeave={(e) => e.currentTarget.style.background = P.purple600}>
            {loading ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ticket Card ────────────────────────────────────────────────────────────
function TicketCard({ ticket, isOwner, userRole, qaRequired, projectId, onEdit, onDelete, onReview, onMove, onViewComments, onViewDetail, onUpdateProgress, currentColumn }) {
  const p = PRIORITY[ticket.priority] || PRIORITY.medium;
  const [hover, setHover] = useState(false);

  const memberMoves = { todo: 'in_progress', in_progress: 'review' };
  const qaMoves     = { review: 'qa_approved' };

  // What the current user can move to from this column
  let targetCol = null;
  if (userRole === 'member' && memberMoves[currentColumn]) {
    targetCol = COLUMNS.find(c => c.key === memberMoves[currentColumn]);
  } else if (userRole === 'qa' && qaRequired && qaMoves[currentColumn]) {
    targetCol = COLUMNS.find(c => c.key === qaMoves[currentColumn]);
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? P.purple50 : P.white, borderRadius: 12, padding: '14px 16px', marginBottom: 10, boxShadow: hover ? '0 4px 16px rgba(124,58,237,.1)' : '0 1px 4px rgba(0,0,0,.06)', border: hover ? `1px solid ${P.purple200}` : `1px solid ${P.border}`, transition: 'all .15s', cursor: 'default' }}
    >
      {/* Priority + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.dot }} />
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: p.text, background: p.bg, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            {p.label}
          </span>
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: 2, opacity: hover ? 1 : 0, transition: 'opacity .15s' }}>
            <button onClick={() => onEdit(ticket)}
              style={{ background: P.purple100, border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 7px', color: P.purple600, display: 'flex', alignItems: 'center' }}>
              <Icons.Edit />
            </button>
            <button onClick={() => onDelete(ticket.id)}
              style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 7px', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
              <Icons.Trash />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <p onClick={() => onViewDetail(ticket)}
        style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 13, color: P.textPrimary, lineHeight: 1.4, cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.color = P.purple600}
        onMouseLeave={(e) => e.currentTarget.style.color = P.textPrimary}>
        {ticket.title}
      </p>
      {ticket.description && (
        <p style={{ margin: '0 0 10px', fontSize: 11.5, color: P.textMuted, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.description}</p>
      )}

      {/* Assignee */}
      {ticket.assignee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: P.purple500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>
            {ticket.assignee.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 11.5, color: P.textMuted }}>{ticket.assignee.name}</span>
        </div>
      )}

      {/* Progress bar */}
      {(() => {
        const prog = ticket.progress ?? 0;
        const progColor = prog === 100 ? '#10b981' : prog >= 50 ? P.purple600 : '#f59e0b';
        return (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: P.textMuted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Progress</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: progColor }}>{prog}%</span>
            </div>
            <div style={{ height: 5, background: P.purple100, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: progColor, width: `${prog}%`, transition: 'width .4s ease' }} />
            </div>
          </div>
        );
      })()}

      {/* Comments badge */}
      {ticket.comments?.length > 0 && (
        <button onClick={() => onViewComments(ticket)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: P.purple100, border: `1px solid ${P.purple200}`, borderRadius: 7, padding: '3px 10px', marginBottom: 10, cursor: 'pointer', fontSize: 11, color: P.purple600, fontWeight: 600, transition: 'all .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = P.purple200; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = P.purple100; }}>
          <Icons.MessageSquare /> {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
        </button>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>

        {/* Progress update button — members and QA */}
        {(userRole === 'member' || userRole === 'qa') && (
          <button onClick={() => onUpdateProgress(ticket)}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${P.purple200}`, background: P.purple50, color: P.purple600, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = P.purple100}
            onMouseLeave={(e) => e.currentTarget.style.background = P.purple50}>
            <CheckCircleOutlined style={{ fontSize: 11 }} />
            Update Progress
          </button>
        )}

        {/* Member move button: To Do → In Progress → Review */}
        {userRole === 'member' && targetCol && (
          <button onClick={() => onMove(ticket, targetCol.key)}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${targetCol.border}`, background: targetCol.light, color: targetCol.color, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = targetCol.border}
            onMouseLeave={(e) => e.currentTarget.style.background = targetCol.light}>
            <Icons.ArrowRight /> Move to {targetCol.label}
          </button>
        )}

        {/* QA pass button: Review → QA Approved */}
        {userRole === 'qa' && qaRequired && currentColumn === 'review' && (
          <button onClick={() => onMove(ticket, 'qa_approved')}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#065f46', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#a7f3d0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#d1fae5'}>
            <Icons.Check /> Pass
          </button>
        )}

        {/* QA reject button: Review → In Progress */}
        {userRole === 'qa' && qaRequired && currentColumn === 'review' && (
          <button onClick={() => onReview(ticket, currentColumn)}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
            <Icons.X /> Reject
          </button>
        )}

        {/* Owner review button: only shown if no QA required */}
        {isOwner && !qaRequired && currentColumn === 'review' && (
          <button onClick={() => onReview(ticket, currentColumn)}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: P.purple600, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 2px 8px rgba(124,58,237,.3)', transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = P.purple700}
            onMouseLeave={(e) => e.currentTarget.style.background = P.purple600}>
            <Icons.ClipboardCheck /> Review
          </button>
        )}

        {/* Owner approve button: QA Approved → Done */}
        {isOwner && currentColumn === 'qa_approved' && (
          <button onClick={() => onMove(ticket, 'done')}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#065f46', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#a7f3d0'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#d1fae5'}>
            <Icons.Check /> Approve → Done
          </button>
        )}

        {/* Owner reject from QA Approved → back to In Progress */}
        {isOwner && currentColumn === 'qa_approved' && (
          <button onClick={() => onReview(ticket, currentColumn)}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
            <Icons.X /> Reject
          </button>
        )}

        {/* Owner archive button: Done → Archived */}
        {isOwner && currentColumn === 'done' && (
          <button onClick={() => onMove(ticket, 'archived')}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, color: P.textSecondary, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.bg; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
            <Icons.Archive /> Archive
          </button>
        )}
      </div>
    </div>
  );
}

// ── Column ─────────────────────────────────────────────────────────────────
function BoardColumn({ column, tickets, isOwner, userRole, qaRequired, projectId, onEdit, onDelete, onReview, onMove, onViewComments, onViewDetail, onUpdateProgress, onAddClick }) {
  return (
    <Card
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
      style={{ minWidth: 290, flex: '0 0 290px', borderRadius: 16, border: `1px solid ${column.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 6px rgba(124,58,237,.05)' }}
    >
      {/* Header */}
      <div style={{ padding: '13px 16px', background: column.light, borderBottom: `1px solid ${column.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: column.color, flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: P.textPrimary, flex: 1, letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {column.label}
          {column.key === 'review' && qaRequired && (
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', textTransform: 'uppercase', letterSpacing: '.04em' }}>QA</span>
          )}
        </h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: column.color, color: '#fff', minWidth: 20, textAlign: 'center' }}>
          {tickets.length}
        </span>
        {/*{isOwner && (
          <button onClick={() => onAddClick(column.key)}
            style={{ background: column.color, border: 'none', cursor: 'pointer', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>
            +
          </button>
        )}*/}
      </div>

      {/* Tickets */}
      <div style={{ padding: '12px 12px 0', overflowY: 'auto', flex: 1, minHeight: 80, maxHeight: 520 }}>
        {tickets.length === 0 ? (
          <div style={{ border: `2px dashed ${column.border}`, borderRadius: 10, padding: '26px 0', textAlign: 'center', color: P.textMuted, fontSize: 12.5, marginBottom: 12 }}>
            <div style={{ marginBottom: 5, display: 'flex', justifyContent: 'center', color: P.textMuted }}><Icons.Inbox /></div>
            No tickets
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isOwner={isOwner}
              userRole={userRole}
              qaRequired={qaRequired}
              projectId={projectId}
              currentColumn={column.key}
              onEdit={onEdit}
              onDelete={onDelete}
              onReview={onReview}
              onMove={onMove}
              onViewComments={onViewComments}
              onViewDetail={onViewDetail}
              onUpdateProgress={onUpdateProgress}
            />
          ))
        )}
      </div>

      {/*   {isOwner && (
        <div style={{ borderTop: `1px solid ${P.border}`, padding: '9px 16px' }}>
          <button onClick={() => onAddClick(column.key)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: P.textMuted, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', padding: 0, transition: 'color .15s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = column.color}
            onMouseLeave={(e) => e.currentTarget.style.color = P.textMuted}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>+</span> Add ticket
          </button>
        </div>
      )}*/}
    </Card>
  );
}

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

// ── Main ProjectBoard ──────────────────────────────────────────────────────
export default function ProjectBoard({ project, user, onBack, onLogout }) {
  const [columns, setColumns] = useState({ todo: [], in_progress: [], review: [], qa_approved: [], done: [], archived: [] });
  const [members, setMembers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [ticketModal, setTicketModal]     = useState(null);
  const [reviewModal, setReviewModal]     = useState(null);
  const [commentsModal, setCommentsModal] = useState(null);
  const [detailModal, setDetailModal]     = useState(null);
  const [inviteModal, setInviteModal]     = useState(false);
  const [progressModal, setProgressModal] = useState(null);
  const [error, setError]                 = useState(null);
  const [projectData, setProjectData]     = useState(project);
  const [spin, setSpin]                   = useState(false); // ← add this

  const isOwner = project.is_owner || project.owner_id === user.id;
  const isQA    = !isOwner && members.some(m => m.user?.id === user.id && m.role === 'qa');
  const userRole = isOwner ? 'owner' : isQA ? 'qa' : 'member';

  const totalTickets = Object.values(columns).flat().length;
  const doneTickets  = columns.done?.length ?? 0;
  const progress     = totalTickets ? Math.round((doneTickets / totalTickets) * 100) : 0;

  async function loadBoard() {
    try {
      const [ticketsData, projectDetail] = await Promise.all([
        apiFetch(`/api/projects/${project.id}/tickets`),
        apiFetch(`/api/projects/${project.id}`),
      ]);
      setColumns(ticketsData);
      setMembers(projectDetail.members || []);
      setProjectData(projectDetail);
    } catch {
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
    } catch {
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

  if (loading) return <KanbanBoardSkeleton />;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: '100vh', background: P.bg }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header style={{
        background: P.white, borderBottom: `1px solid ${P.border}`,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 1px 8px rgba(124,58,237,.06)',
      }}>
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: P.purple100, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.purple200}` }}>
            <LaravelLogo size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary, letterSpacing: '-.03em' }}>DailyMe</span>
        </div>

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />

        {/* Back button */}
        <Tooltip label="Back to Projects">
          <button onClick={onBack}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid transparent`, background: 'transparent', color: P.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', fontSize: 18 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple200; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = P.textSecondary; }}>
            <ArrowLeftOutlined style={{ fontSize: 16 }} /> 
          </button>
        </Tooltip>

       {/*<div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />*/}

        {/* Notifications — moved next to back button */}
        <Tooltip label="Notifications">
          <NotificationBell onOpenProject={() => onBack()} />
        </Tooltip>

        {/*<div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />*/}

        <div style={{ flex: 1 }} />

        {/* Members dropdown */}
       <MembersDropdown members={members} projectData={projectData} />

        {isOwner && (
          <>
            <button onClick={() => setInviteModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', color: P.textSecondary, border: `1.5px solid ${P.border}`, borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
              <Icons.UserPlus /> Invite
            </button>
            <button
              onClick={() => { setTicketModal({ ticket: null }); setSpin(true); setTimeout(() => setSpin(false), 600); }}
              onMouseEnter={(e) => { setSpin(true); e.currentTarget.style.background = P.purple700; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { setSpin(false); e.currentTarget.style.background = P.purple600; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: P.purple600, color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(124,58,237,.3)', transition: 'all .2s' }}
            >
              <TagOutlined style={{ fontSize: 14, display: 'inline-flex', animation: spin ? 'btnSpin 0.6s linear' : 'none' }} />
              New Ticket
            </button>
          </>
        )}

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 2px' }} />

     
        <ProfileDropdown user={user} onLogout={onLogout} />
      </header>

      {/* ── Floating project anchor ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 999, display: 'flex', alignItems: 'center', gap: 12,
        background: P.white, border: `1px solid ${P.purple200}`,
        borderRadius: 999, padding: '8px 18px 8px 12px',
        boxShadow: '0 4px 24px rgba(124,58,237,.15), 0 1px 4px rgba(0,0,0,.06)',
        backdropFilter: 'blur(8px)',
        minWidth: 260, maxWidth: 400,
      }}>
        {/* Icon */}
        {/*<div style={{ width: 30, height: 30, borderRadius: '50%', background: P.purple100, border: `1px solid ${P.purple200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LaravelLogo size={16} />
         </div>*/}
        {/* Name + bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: P.textPrimary, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
            {projectData.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ flex: 1, height: 4, background: P.purple100, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: P.purple600, width: `${progress}%`, transition: 'width .5s ease' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: P.purple600, whiteSpace: 'nowrap' }}>
              {doneTickets}/{totalTickets} · {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Board ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, padding: '24px 28px 60px', alignItems: 'flex-start', overflowX: 'auto' }}>

      {COLUMNS.filter(col => col.key !== 'qa_approved' || projectData.qa_required).map((col) => (
          <BoardColumn
            key={col.key}
            column={col}
            tickets={columns[col.key] || []}
            isOwner={isOwner}
            userRole={userRole}
            qaRequired={projectData.qa_required}
            projectId={project.id}
            onEdit={(t) => setTicketModal({ ticket: t })}
            onDelete={handleDelete}
            onReview={(t, fromColumn) => setReviewModal({ ticket: t, fromColumn })}
            onUpdateProgress={(t) => setProgressModal(t)}
            onMove={handleMove}
            onViewComments={(t) => setCommentsModal(t)}
            onViewDetail={(t) => setDetailModal(t)}
            onAddClick={(status) => setTicketModal({ ticket: null, defaultStatus: status })}
          />
        ))}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {ticketModal && (
        <TicketModal ticket={ticketModal.ticket} members={members} onSave={handleSaveTicket} onClose={() => setTicketModal(null)} />
      )}
      {reviewModal && (
        <ReviewModal
          ticket={reviewModal.ticket}
          projectId={project.id}
          userRole={userRole}
          fromColumn={reviewModal.fromColumn}
          onDone={() => { setReviewModal(null); loadBoard(); }}
          onClose={() => setReviewModal(null)}
        />
      )}
      {commentsModal && (
        <CommentsModal ticket={commentsModal} projectId={project.id} onClose={() => setCommentsModal(null)} onReplied={() => { setCommentsModal(null); loadBoard(); }} />
      )}
      {detailModal && (
        <TicketDetail ticket={detailModal} projectId={project.id} isOwner={isOwner} onClose={() => setDetailModal(null)} onRefresh={() => { loadBoard().then(() => setDetailModal(null)); }} />
      )}
      {inviteModal && (
        <InviteModal projectId={project.id} onDone={() => { setInviteModal(false); loadBoard(); }} onClose={() => setInviteModal(false)} />
      )}
      {progressModal && (
        <ProgressModal ticket={progressModal} projectId={project.id} onDone={() => { setProgressModal(null); loadBoard(); }} onClose={() => setProgressModal(null)} />
      )}
    </div>
  );
}