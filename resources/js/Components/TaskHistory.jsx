import React from 'react';

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
    <div style={{
      display: "flex",
      gap: 12,
      padding: "14px 16px",
      borderBottom: "1px solid #f1f5f9",
      position: "relative",
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#f8fffe"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {/* Timeline line */}
      {index < total - 1 && (
        <div style={{ position: "absolute", left: 27, top: 46, bottom: -1, width: 2, background: "#d1fae5", zIndex: 0 }} />
      )}

      {/* Checkmark circle */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#10b981,#34d399)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: "#fff", fontWeight: 700, zIndex: 1,
        boxShadow: "0 2px 6px rgba(16,185,129,.3)",
      }}>
        ✓
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.taskTitle}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          {/* Priority badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
            color: p.text, background: p.bg, letterSpacing: ".04em", textTransform: "uppercase",
          }}>
            {p.label}
          </span>

          {/* Moved from */}
          {entry.from && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              from <span style={{ color: "#6b7280", fontWeight: 600 }}>{COLUMN_LABELS[entry.from] || entry.from}</span>
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
          {formatTime(entry.at)} · {timeAgo(entry.at)}
        </div>
      </div>
    </div>
  );
}

export default function TaskHistory({ history = [], onClear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg,#10b981,#34d399)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#fff",
        }}>
          ✓
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>Completed Tasks</h3>
          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
            {history.length} task{history.length !== 1 ? "s" : ""} done this session
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            title="Clear history"
            style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "none"; }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Priority breakdown — shown when there are entries */}
      {history.length > 0 && (
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f1f5f9" }}>
          {Object.entries(PRIORITY).map(([key, val]) => {
            const count = history.filter((h) => h.priority === key).length;
            return (
              <div key={key} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRight: key !== "high" ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: val.text }}>{count}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>{val.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏁</div>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>No completed tasks yet</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#d1d5db" }}>
              Move a task to <strong style={{ color: "#10b981" }}>Done</strong> and it will appear here.
            </p>
          </div>
        ) : (
          history.map((entry, i) => (
            <HistoryItem key={entry.id} entry={entry} index={i} total={history.length} />
          ))
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid #f1f5f9",
          background: "#f8fffe",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            <strong style={{ color: "#10b981" }}>{history.length}</strong> completed this session
          </span>
        </div>
      )}
    </div>
  );
}