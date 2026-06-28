import React, { useState, useEffect, useRef } from 'react';
import { BellOutlined, DeleteOutlined } from '@ant-design/icons';

const P = {
  purple50:  '#f0f9ff',
  purple100: '#e0f2fe',
  purple200: '#bae6fd',
  purple300: '#7dd3fc',
  purple500: '#0ea5e9',
  purple600: '#3b82f6',
  border:    '#e0f2fe',
  textPrimary: '#1e1b4b',
  textMuted:   '#9ca3af',
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

const TYPE_STYLES = {
  assigned:        { icon: '🎯', color: '#6366f1', bg: '#eef2ff' },
  moved_to_review: { icon: '👀', color: '#8b5cf6', bg: '#f5f3ff' },
  approved:        { icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  rejected:        { icon: '❌', color: '#ef4444', bg: '#fee2e2' },
  commented:       { icon: '💬', color: '#f59e0b', bg: '#fffbeb' },
  qa_review_needed: { icon: '🔍', color: '#8b5cf6', bg: '#f5f3ff' },
  qa_passed:        { icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  qa_rejected:      { icon: '❌', color: '#ef4444', bg: '#fee2e2' },
  qa_feedback:      { icon: '📝', color: '#f59e0b', bg: '#fffbeb' },
};

export default function NotificationBell({ onOpenProject }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef                       = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchUnreadCount() {
    try {
      const data = await apiFetch('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch {}
  }

  async function handleOpen() {
    if (!open) {
      setLoading(true);
      try {
        const data = await apiFetch('/api/notifications');
        setNotifications(data);
      } catch {}
      setLoading(false);
    }
    setOpen((v) => !v);
  }

  async function markAllRead() {
    await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id) {
    await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setUnreadCount((c) => Math.max(0, c - 1));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  async function clearAll() {
    await apiFetch('/api/notifications/clear-all', { method: 'DELETE' });
    setNotifications([]);
    setUnreadCount(0);
  }

  async function deleteOne(e, id) {
    e.stopPropagation();
    const wasUnread = notifications.find((n) => n.id === id && !n.is_read);
    await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => wasUnread ? Math.max(0, c - 1) : c);
  }

  function formatTime(dateStr) {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>

      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          border: open ? `1.5px solid ${P.purple300}` : '1.5px solid transparent',
          background: open ? P.purple100 : 'transparent',
          color: open ? '#3b82f6' : P.textMuted,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all .15s',
        }}
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.background = P.purple50; e.currentTarget.style.color = P.purple500; }}}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.textMuted; }}}
      >
      <BellOutlined style={{ fontSize: 16 }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', borderRadius: '50%',
            border: '2px solid #fff',
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 'auto', left: 0,
          width: 360, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(124,58,237,.12)',
          border: `1px solid ${P.border}`,
          zIndex: 1001, overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: P.textPrimary, flex: 1 }}>
              Notifications{' '}
              {unreadCount > 0 && (
                <span style={{ fontSize: 11, background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>
                  {unreadCount}
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#3b82f6', fontWeight: 600, fontFamily: 'inherit' }}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: P.textMuted, fontSize: 13 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: P.textMuted }}>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: P.textMuted }}>
                <BellOutlined style={{ fontSize: 32, color: P.textMuted }} />
                </div>
                <p style={{ margin: 0, fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.commented;
                return (
                  <div
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.project && onOpenProject) onOpenProject(n.project); setOpen(false); }}
                    style={{
                      padding: '12px 18px', display: 'flex', gap: 12,
                      alignItems: 'flex-start', cursor: 'pointer',
                      background: n.is_read ? '#fff' : '#f0f9ff',
                      borderBottom: `1px solid ${P.border}`,
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = P.purple50}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? '#fff' : '#f0f9ff'}
                  >
                    {/* Icon */}
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 13, color: P.textPrimary, lineHeight: 1.4, fontWeight: n.is_read ? 400 : 600 }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {n.project && (
                          <span style={{ fontSize: 11, color: style.color, fontWeight: 600, background: style.bg, padding: '1px 6px', borderRadius: 6 }}>
                            {n.project.name}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: P.textMuted }}>{formatTime(n.created_at)}</span>
                      </div>
                    </div>

                    {/* Unread dot + delete */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {!n.is_read && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' }} />
                      )}
                      <button
                        onClick={(e) => deleteOne(e, n.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textMuted, padding: 2, borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0, transition: 'opacity .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = P.textMuted; }}
                      >
                    <DeleteOutlined style={{ fontSize: 13 }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}