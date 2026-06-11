import React from 'react';

// ── Palette (matches DailyMe exactly) ─────────────────────────────────────
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

// ── Laravel Flame Logo (purple) ────────────────────────────────────────────
function LaravelLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#7c3aed"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#7c3aed" opacity=".35"/>
    </svg>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const Icons = {
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Clock: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  ClipboardCheck: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
};

// ── Constants ──────────────────────────────────────────────────────────────
const PRIORITY = {
  low:    { label: 'Low',    text: '#065f46', bg: '#d1fae5', dot: '#34d399' },
  medium: { label: 'Medium', text: '#92400e', bg: '#fef3c7', dot: '#fbbf24' },
  high:   { label: 'High',   text: '#991b1b', bg: '#fee2e2', dot: '#f87171' },
};

const COLUMN_LABELS = {
  todo:        'To Do',
  in_progress: 'In Progress',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString();
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── History Item ───────────────────────────────────────────────────────────
function HistoryItem({ entry, index, total }) {
  const p = PRIORITY[entry.priority] || PRIORITY.medium;

  return (
    <div
      style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${P.border}`, position: 'relative', transition: 'background .15s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = P.purple50}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Timeline connector line */}
      {index < total - 1 && (
        <div style={{ position: 'absolute', left: 27, top: 46, bottom: -1, width: 2, background: P.purple200, zIndex: 0 }} />
      )}

      {/* Check circle */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: P.purple600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', zIndex: 1,
        boxShadow: '0 2px 8px rgba(124,58,237,.30)',
      }}>
        <Icons.Check />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: P.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {entry.taskTitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
          {/* Priority badge */}
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: p.text, background: p.bg, letterSpacing: '.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.dot }} />
            {p.label}
          </span>

          {/* Moved from */}
          {entry.from && (
            <span style={{ fontSize: 11, color: P.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icons.ArrowRight />
              <span style={{ color: P.purple600, fontWeight: 600 }}>{COLUMN_LABELS[entry.from] || entry.from}</span>
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: 11, color: P.textMuted, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.Clock />
          {formatTime(entry.at)} · {timeAgo(entry.at)}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function TaskHistory({ history = [], onClear }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", background: P.white }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${P.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        background: P.white,
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 1px 4px rgba(124,58,237,.05)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: P.purple100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${P.purple200}`,
          flexShrink: 0,
        }}>
          <LaravelLogo size={17} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: P.textPrimary, letterSpacing: '-.02em' }}>
            Completed Tasks
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: P.textMuted }}>
            {history.length} task{history.length !== 1 ? 's' : ''} done this session
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            title="Clear history"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: P.textMuted, background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fee2e2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = P.textMuted; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = 'none'; }}
          >
            <Icons.Trash /> Clear
          </button>
        )}
      </div>

      {/* ── Priority Breakdown ───────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${P.border}`, background: P.purple50 }}>
          {Object.entries(PRIORITY).map(([key, val], i, arr) => {
            const count = history.filter((h) => h.priority === key).length;
            return (
              <div key={key} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRight: i < arr.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: count > 0 ? P.purple600 : P.textMuted }}>{count}</div>
                <div style={{ fontSize: 10, color: P.textMuted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: val.dot }} />
                  {val.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: P.purple100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              border: `1px solid ${P.purple200}`,
              boxShadow: '0 4px 16px rgba(124,58,237,.08)',
              color: P.purple400,
            }}>
              <Icons.ClipboardCheck />
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: P.textPrimary, letterSpacing: '-.02em' }}>
              No completed tasks yet
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: P.textMuted, lineHeight: 1.5 }}>
              Move a task to <strong style={{ color: P.purple600 }}>Done</strong> and it will appear here.
            </p>
          </div>
        ) : (
          history.map((entry, i) => (
            <HistoryItem key={entry.id} entry={entry} index={i} total={history.length} />
          ))
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{
          padding: '10px 16px',
          borderTop: `1px solid ${P.border}`,
          background: P.purple50,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.purple500 }} />
          <span style={{ fontSize: 12, color: P.textMuted }}>
            <strong style={{ color: P.purple600 }}>{history.length}</strong> completed this session
          </span>
        </div>
      )}
    </div>
  );
}