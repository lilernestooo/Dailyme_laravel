import React, { useState, useEffect, useRef } from 'react';

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
  assigned:       { icon: '🎯', color: '#6366f1', bg: '#eef2ff' },
  moved_to_review:{ icon: '👀', color: '#8b5cf6', bg: '#f5f3ff' },
  approved:       { icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  rejected:       { icon: '❌', color: '#ef4444', bg: '#fee2e2' },
  commented:      { icon: '💬', color: '#f59e0b', bg: '#fffbeb' },
};

export default function NotificationBell({ onOpenProject }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef                       = useRef(null);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
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

  function formatTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
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
          position: 'relative', padding: '7px 10px', borderRadius: 8,
          border: open ? '1px solid #fca5a5' : '1px solid #fde8e8',
          background: open ? '#fff5f5' : '#fff',
          color: open ? '#FF2D20' : '#9ca3af',
          cursor: 'pointer', fontWeight: 600, fontSize: 16,
          display: 'flex', alignItems: 'center', transition: 'all .15s',
        }}
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#FF2D20'; }}}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#9ca3af'; }}}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#FF2D20', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, border: '2px solid #fff',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,.12)', border: '1px solid #fde8e8',
          zIndex: 999, overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #fde8e8', display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', flex: 1 }}>
              Notifications {unreadCount > 0 && <span style={{ fontSize: 11, background: '#FF2D20', color: '#fff', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>{unreadCount}</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#FF2D20', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
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
                      background: n.is_read ? '#fff' : '#fff8f8',
                      borderBottom: '1px solid #fdf2f2',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? '#fff' : '#fff8f8'}
                  >
                    {/* Icon */}
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 13, color: '#111827', lineHeight: 1.4, fontWeight: n.is_read ? 400 : 600 }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {n.project && (
                          <span style={{ fontSize: 11, color: style.color, fontWeight: 600, background: style.bg, padding: '1px 6px', borderRadius: 6 }}>
                            {n.project.name}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(n.created_at)}</span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF2D20', flexShrink: 0, marginTop: 4 }} />
                    )}
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