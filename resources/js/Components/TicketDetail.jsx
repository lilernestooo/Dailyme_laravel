import React, { useState } from 'react';
import {
  CloseOutlined,
  MessageOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CommentOutlined,
} from '@ant-design/icons';

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

const PRIORITY_COLORS = {
  low:    { text: '#059669', bg: '#d1fae5' },
  medium: { text: '#d97706', bg: '#fef3c7' },
  high:   { text: '#dc2626', bg: '#fee2e2' },
};

const STATUS_COLORS = {
  todo:        { text: '#6366f1', bg: '#eef2ff', label: 'To Do' },
  in_progress: { text: '#f59e0b', bg: '#fffbeb', label: 'In Progress' },
  review:      { text: '#8b5cf6', bg: '#f5f3ff', label: 'Review' },
  done:        { text: '#10b981', bg: '#ecfdf5', label: 'Done' },
  archived:    { text: '#6b7280', bg: '#f9fafb', label: 'Archived' },
};

export default function TicketDetail({ ticket, projectId, isOwner, onClose, onRefresh }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const p = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium;
  const s = STATUS_COLORS[ticket.status] || STATUS_COLORS.todo;

  async function handleComment() {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${projectId}/tickets/${ticket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment, type: 'comment' }),
      });
      setComment('');
      onRefresh();
    } catch (e) {
      alert('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function commentBadgeStyle(type) {
    if (type === 'approve') return { bg: '#ecfdf5', border: '#a7f3d0', badge: '#10b981', label: 'Approved', icon: <CheckOutlined style={{ fontSize: 10 }} /> };
    if (type === 'reject')  return { bg: '#fee2e2', border: '#fca5a5', badge: '#ef4444', label: 'Rejected', icon: <CloseCircleOutlined style={{ fontSize: 10 }} /> };
    return { bg: '#f9fafb', border: '#e5e7eb', badge: '#6b7280', label: 'Comment', icon: <CommentOutlined style={{ fontSize: 10 }} /> };
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'Inter', system-ui, sans-serif" }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '90%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{ticket.title}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {/* Priority badge */}
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.05em', color: p.text, background: p.bg }}>
                  {ticket.priority}
                </span>
                {/* Status badge */}
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: s.text, background: s.bg }}>
                  {s.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CloseOutlined style={{ fontSize: 12 }} /> Close
          </button>
          </div>

          {/* Description */}
          {ticket.description && (
            <p style={{ margin: '14px 0 0', fontSize: 14, color: '#374151', lineHeight: 1.6, background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              {ticket.description}
            </p>
          )}

          {/* Meta info */}
          <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
            {ticket.assignee && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>ASSIGNED TO</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>
                    {ticket.assignee.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{ticket.assignee.name}</span>
                </div>
              </div>
            )}
            {ticket.creator && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>CREATED BY</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{ticket.creator.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageOutlined style={{ fontSize: 13 }} /> Comments ({ticket.comments?.length || 0})
        </h3>

          {!ticket.comments?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <CommentOutlined style={{ fontSize: 32, marginBottom: 8, color: '#9ca3af' }} />
              <p style={{ margin: 0, fontSize: 13 }}>No comments yet</p>
            </div>
          ) : (
            ticket.comments.map((c) => {
              const style = commentBadgeStyle(c.type);
              return (
                <div key={c.id} style={{ padding: '14px 16px', borderRadius: 12, background: style.bg, border: `1px solid ${style.border}`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.user?.name}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{formatDate(c.created_at)}</span>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: style.badge, color: '#fff', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{c.comment}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment */}
        <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #e5e7eb' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; }}
            onBlur={(e)  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={handleComment}
              disabled={loading || !comment.trim()}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: comment.trim() ? '#6366f1' : '#c7d2fe', color: '#fff', cursor: comment.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}