import React from 'react';

// ── Design tokens (mirrors KanbanBoard palette) ────────────────────────────
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

// ── Keyframe injection (runs once) ─────────────────────────────────────────
const STYLE_ID = 'skeleton-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes skeletonShimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── Base shimmer style ─────────────────────────────────────────────────────
const shimmer = {
  background: `linear-gradient(
    90deg,
    ${P.purple100} 25%,
    ${P.purple50}  50%,
    ${P.purple100} 75%
  )`,
  backgroundSize: '600px 100%',
  animation: 'skeletonShimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
};

// ══════════════════════════════════════════════════════════════════════════
// Primitive — all skeleton shapes build on this
// ══════════════════════════════════════════════════════════════════════════
export function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      style={{
        ...shimmer,
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ── Convenience aliases ────────────────────────────────────────────────────

/** Single line of text */
export function SkeletonText({ width = '100%', height = 13, style = {} }) {
  return <SkeletonBox width={width} height={height} radius={6} style={style} />;
}

/** Circle — avatars, status dots, icons */
export function SkeletonCircle({ size = 36, style = {} }) {
  return <SkeletonBox width={size} height={size} radius="50%" style={style} />;
}

/** Rounded pill — badges, tags, chips */
export function SkeletonPill({ width = 60, height = 20, style = {} }) {
  return <SkeletonBox width={width} height={height} radius={99} style={style} />;
}

/** Card / panel block */
export function SkeletonCard({ width = '100%', height = 90, radius = 12, style = {} }) {
  return <SkeletonBox width={width} height={height} radius={radius} style={style} />;
}

// ══════════════════════════════════════════════════════════════════════════
// Composed skeletons — one per component that loads async data
// ══════════════════════════════════════════════════════════════════════════

// ── KanbanBoard ────────────────────────────────────────────────────────────
export function KanbanBoardSkeleton() {
  const columnColors = [P.purple50, '#f0f9ff', '#ecfdf5'];
  const columnBorders = [P.purple200, '#bae6fd', '#a7f3d0'];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: '100vh', background: P.bg }}>

      {/* Navbar skeleton */}
      <header style={{
        background: P.white, borderBottom: `1px solid ${P.border}`,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: '0 1px 8px rgba(124,58,237,.06)',
      }}>
        {/* Logo */}
        <SkeletonBox width={32} height={32} radius={10} />
        <SkeletonBox width={80} height={16} radius={6} />

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 6px' }} />

        {/* Nav icons */}
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} width={36} height={36} radius={10} />
        ))}

        <div style={{ flex: 1 }} />

        {/* New Task button */}
        <SkeletonBox width={100} height={34} radius={9} />

        <div style={{ width: 1, height: 22, background: P.border, margin: '0 4px' }} />

        {/* Avatar */}
        <SkeletonCircle size={34} />
      </header>

      {/* Board columns */}
      <div style={{ display: 'flex', gap: 16, padding: '24px 28px 100px', overflowX: 'auto' }}>
        {[0, 1, 2].map((ci) => (
          <div
            key={ci}
            style={{
              flex: 1, minWidth: 300,
              background: P.white, borderRadius: 16,
              border: `1px solid ${columnBorders[ci]}`,
              boxShadow: '0 1px 6px rgba(124,58,237,.05)',
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <div style={{
              padding: '13px 16px',
              background: columnColors[ci],
              borderBottom: `1px solid ${columnBorders[ci]}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <SkeletonCircle size={9} />
              <SkeletonText width={80} height={11} style={{ flex: 1 }} />
              <SkeletonPill width={26} height={20} />
            </div>

            {/* Task rows */}
            <div style={{ padding: '8px 0' }}>
              {[1, 2, 3].map((ri) => (
                <div
                  key={ri}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px',
                    borderBottom: `1px solid ${P.border}`,
                  }}
                >
                  <SkeletonCircle size={7} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <SkeletonText width={`${55 + ri * 10}%`} height={13} />
                    <SkeletonText width={`${30 + ri * 8}%`} height={11} />
                  </div>
                  <SkeletonPill width={48} height={18} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating anchors */}
      <div style={{
        position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
        background: P.white, borderRadius: 50, border: `1px solid ${P.purple200}`,
        boxShadow: '0 4px 24px rgba(124,58,237,.14)',
        padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 200,
      }}>
        {[100, 90, 80].map((w, i) => (
          <React.Fragment key={i}>
            <SkeletonPill width={w} height={22} />
            {i < 2 && <div style={{ width: 1, height: 18, background: P.border }} />}
          </React.Fragment>
        ))}
        <div style={{ width: 1, height: 18, background: P.border }} />
        <SkeletonBox width={80} height={8} radius={99} />
      </div>
    </div>
  );
}

// ── ProjectList ────────────────────────────────────────────────────────────
export function ProjectListSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <SkeletonText width={160} height={22} />
        <SkeletonBox width={110} height={34} radius={9} />
      </div>

      {/* List rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', marginBottom: 10,
            background: P.white, borderRadius: 12,
            border: `1px solid ${P.border}`,
          }}
        >
          <SkeletonBox width={40} height={40} radius={10} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <SkeletonText width={`${40 + (i % 3) * 15}%`} height={14} />
            <SkeletonText width={`${25 + (i % 4) * 10}%`} height={11} />
          </div>
          <SkeletonPill width={64} height={22} />
          <SkeletonBox width={28} height={28} radius={7} />
        </div>
      ))}
    </div>
  );
}

// ── AdminDashboard ─────────────────────────────────────────────────────────
export function AdminDashboardSkeleton() {
  return (
    <div style={{ padding: '24px 28px', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

      {/* Page title */}
      <SkeletonText width={200} height={24} style={{ marginBottom: 24 }} />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: P.white, borderRadius: 14, padding: '18px 20px',
              border: `1px solid ${P.border}`,
              boxShadow: '0 1px 6px rgba(124,58,237,.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SkeletonText width={80} height={11} />
              <SkeletonBox width={28} height={28} radius={8} />
            </div>
            <SkeletonText width={60} height={26} style={{ marginBottom: 8 }} />
            <SkeletonText width={90} height={11} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: P.white, borderRadius: 14, border: `1px solid ${P.border}`,
        overflow: 'hidden', boxShadow: '0 1px 6px rgba(124,58,237,.05)',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 16, padding: '12px 20px',
          background: P.purple50, borderBottom: `1px solid ${P.border}`,
        }}>
          {['Name', 'Status', 'Priority', 'Actions'].map((_, i) => (
            <SkeletonText key={i} width={i === 0 ? 80 : 50} height={11} />
          ))}
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 16, padding: '14px 20px',
              borderBottom: `1px solid ${P.border}`,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SkeletonCircle size={30} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <SkeletonText width={110} height={13} />
                <SkeletonText width={75} height={10} />
              </div>
            </div>
            <SkeletonPill width={72} height={22} />
            <SkeletonPill width={56} height={22} />
            <div style={{ display: 'flex', gap: 6 }}>
              <SkeletonBox width={28} height={28} radius={7} />
              <SkeletonBox width={28} height={28} radius={7} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TicketDetail ───────────────────────────────────────────────────────────
export function TicketDetailSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 720, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <SkeletonText width={60} height={11} />
        <SkeletonText width={6} height={11} />
        <SkeletonText width={90} height={11} />
      </div>

      {/* Title */}
      <SkeletonText width="65%" height={26} style={{ marginBottom: 12 }} />

      {/* Meta row — badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <SkeletonPill width={80} height={24} />
        <SkeletonPill width={66} height={24} />
        <SkeletonPill width={90} height={24} />
      </div>

      {/* Description block */}
      <div style={{
        background: P.white, borderRadius: 12, border: `1px solid ${P.border}`,
        padding: '18px 20px', marginBottom: 20,
      }}>
        <SkeletonText width="90%" height={13} style={{ marginBottom: 8 }} />
        <SkeletonText width="80%" height={13} style={{ marginBottom: 8 }} />
        <SkeletonText width="70%" height={13} style={{ marginBottom: 8 }} />
        <SkeletonText width="50%" height={13} />
      </div>

      {/* Activity / comment area */}
      <SkeletonText width={100} height={14} style={{ marginBottom: 14 }} />
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: 12, marginBottom: 14,
            background: P.white, borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${P.border}`,
          }}
        >
          <SkeletonCircle size={32} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <SkeletonText width={120} height={12} />
            <SkeletonText width="75%" height={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TaskHistory panel ──────────────────────────────────────────────────────
export function TaskHistorySkeleton({ rows = 6 }) {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <SkeletonText width={90} height={14} />
        <SkeletonPill width={44} height={22} />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            borderBottom: `1px solid ${P.border}`,
          }}
        >
          <SkeletonCircle size={7} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SkeletonText width={`${50 + (i % 4) * 12}%`} height={12} />
            <SkeletonText width={55} height={10} />
          </div>
          <SkeletonPill width={48} height={18} />
        </div>
      ))}
    </div>
  );
}

// ── ProjectList page ───────────────────────────────────────────────────────
export function ProjectListPageSkeleton({ count = 6 }) {
    return (
      <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: '100vh', background: P.bg }}>
  
        {/* Navbar skeleton */}
        <header style={{
          background: P.white, borderBottom: `1px solid ${P.border}`,
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'sticky', top: 0, zIndex: 1000,
          boxShadow: '0 1px 8px rgba(124,58,237,.06)',
        }}>
          <SkeletonBox width={32} height={32} radius={10} />
          <SkeletonBox width={80} height={16} radius={6} />
  
          <div style={{ width: 1, height: 22, background: P.border, margin: '0 6px' }} />
  
          {/* Nav icons */}
          <SkeletonBox width={36} height={36} radius={10} />
          <SkeletonBox width={36} height={36} radius={10} />
  
          <div style={{ flex: 1 }} />
  
          {/* Project count chip + button + avatar */}
          <SkeletonPill width={80} height={28} />
          <SkeletonBox width={120} height={34} radius={9} />
          <div style={{ width: 1, height: 22, background: P.border, margin: '0 4px' }} />
          <SkeletonCircle size={34} />
        </header>
  
        {/* Cards grid */}
        <div style={{
          padding: '32px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
              background: P.white, borderRadius: 16, padding: 22,
              border: `1px solid ${P.border}`,
              boxShadow: '0 1px 6px rgba(124,58,237,.05)',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {/* Card header — icon + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <SkeletonBox width={40} height={40} radius={11} />
                <SkeletonPill width={58} height={24} />
              </div>
  
              {/* Title */}
              <SkeletonText width={`${50 + (i % 3) * 15}%`} height={15} style={{ marginBottom: 8 }} />
  
              {/* Description lines */}
              <SkeletonText width="90%" height={12} style={{ marginBottom: 5 }} />
              <SkeletonText width="70%" height={12} style={{ marginBottom: 16 }} />
  
              {/* Member avatars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                {[0, 1, 2].map((j) => (
                  <SkeletonCircle key={j} size={26} style={{ marginLeft: j > 0 ? -8 : 0, border: '2px solid #fff' }} />
                ))}
                <SkeletonText width={60} height={11} style={{ marginLeft: 4 }} />
              </div>
  
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <SkeletonBox width="100%" height={34} radius={9} />
                <SkeletonBox width={38} height={34} radius={9} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

// ══════════════════════════════════════════════════════════════════════════
// Usage helper — drop-in guard for any component
// ══════════════════════════════════════════════════════════════════════════
/**
 * <SkeletonGuard loading={isLoading} fallback={<KanbanBoardSkeleton />}>
 *   <KanbanBoard ... />
 * </SkeletonGuard>
 */
export function SkeletonGuard({ loading, fallback, children }) {
  return loading ? fallback : children;
}

// ── Default export — all named exports collected ───────────────────────────
export default {
  Box:            SkeletonBox,
  Text:           SkeletonText,
  Circle:         SkeletonCircle,
  Pill:           SkeletonPill,
  Card:           SkeletonCard,
  KanbanBoard:    KanbanBoardSkeleton,
  ProjectList:    ProjectListSkeleton,
  ProjectListPage: ProjectListPageSkeleton,   // ← new
  AdminDashboard: AdminDashboardSkeleton,
  TicketDetail:   TicketDetailSkeleton,
  TaskHistory:    TaskHistorySkeleton,
  Guard:          SkeletonGuard,
};