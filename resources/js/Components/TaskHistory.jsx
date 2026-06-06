import React from 'react';

// ── Laravel Flame Logo ────────────────────────────────────────────────────
function LaravelLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#b94040"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#b94040" opacity=".4"/>
    </svg>
  );
}

const PRIORITY = {
  low:    { label: "Low",    text: "#059669", bg: "#d1fae5", dot: "#34d399" },
  medium: { label: "Medium", text: "#b45309", bg: "#fef3c7", dot: "#fbbf24" },
  high:   { label: "High",   text: "#dc2626", bg: "#fee2e2", dot: "#f87171" },
};

const COLUMN_LABELS = {
  todo:        "To Do",
  in_progress: "In Progress",
};

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

function HistoryItem({ entry, index, total }) {
  const p = PRIORITY[entry.priority] || PRIORITY.medium;

  return (
    <div
      style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: "1px solid #fdf2f2", position: "relative" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#fff8f8"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {/* Timeline connector line */}
      {index < total - 1 && (
        <div style={{ position: "absolute", left: 27, top: 46, bottom: -1, width: 2, background: "#fde8e8", zIndex: 0 }} />
      )}

      {/* Check circle — red gradient to match theme */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#FF2D20,#ff5c52)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: "#fff", fontWeight: 700, zIndex: 1,
        boxShadow: "0 2px 6px rgba(255,45,32,.25)",
      }}>
        ✓
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.taskTitle}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: p.text, background: p.bg, letterSpacing: ".04em", textTransform: "uppercase" }}>
            {p.label}
          </span>
          {entry.from && (
            <span style={{ fontSize: 11, color: "#fca5a5" }}>
              from <span style={{ color: "#FF2D20", fontWeight: 600 }}>{COLUMN_LABELS[entry.from] || entry.from}</span>
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 4 }}>
          {formatTime(entry.at)} · {timeAgo(entry.at)}
        </div>
      </div>
    </div>
  );
}

export default function TaskHistory({ history = [], onClear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #fde8e8",
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        {/* Logo icon box — same style as Register card header */}
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "linear-gradient(135deg,#fff5f5,#ffe4e4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,45,32,.15)",
          flexShrink: 0,
        }}>
          <LaravelLogo size={17} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: "-.02em" }}>Completed Tasks</h3>
          <p style={{ margin: 0, fontSize: 11, color: "#fca5a5" }}>
            {history.length} task{history.length !== 1 ? "s" : ""} done this session
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            title="Clear history"
            style={{ fontSize: 11, fontWeight: 600, color: "#fca5a5", background: "none", border: "1px solid #fde8e8", borderRadius: 8, padding: "4px 10px", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.borderColor = "#fde8e8"; e.currentTarget.style.background = "none"; }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Priority breakdown ─────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{ display: "flex", borderBottom: "1px solid #fdf2f2", background: "#fff5f5" }}>
          {Object.entries(PRIORITY).map(([key, val]) => {
            const count = history.filter((h) => h.priority === key).length;
            return (
              <div key={key} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRight: key !== "high" ? "1px solid #fde8e8" : "none" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: val.text }}>{count}</div>
                <div style={{ fontSize: 10, color: "#fca5a5", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>{val.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            {/* Empty state logo */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg,#fff5f5,#ffe4e4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
              border: "1px solid rgba(255,45,32,.12)",
              boxShadow: "0 4px 16px rgba(255,45,32,.08)",
            }}>
              <LaravelLogo size={28} />
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: "-.02em" }}>No completed tasks yet</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#fca5a5" }}>
              Move a task to <strong style={{ color: "#FF2D20" }}>Done</strong> and it will appear here.
            </p>
          </div>
        ) : (
          history.map((entry, i) => (
            <HistoryItem key={entry.id} entry={entry} index={i} total={history.length} />
          ))
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #fde8e8",
          background: "#fff5f5",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2D20" }} />
          <span style={{ fontSize: 12, color: "#fca5a5" }}>
            <strong style={{ color: "#FF2D20" }}>{history.length}</strong> completed this session
          </span>
        </div>
      )}
    </div>
  );
}