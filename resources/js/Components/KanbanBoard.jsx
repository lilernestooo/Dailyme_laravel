import React, { useState, useEffect, useRef } from 'react';
import TaskHistory from './TaskHistory';

const API = "/api/tasks";

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: "#6366f1", light: "#eef2ff", dot: "#818cf8" },
  { key: "in_progress", label: "In Progress",  color: "#f59e0b", light: "#fffbeb", dot: "#fbbf24" },
  { key: "done",        label: "Done",         color: "#10b981", light: "#ecfdf5", dot: "#34d399" },
];

const PRIORITY = {
  low:    { label: "Low",    text: "#059669", bg: "#d1fae5", dot: "#34d399" },
  medium: { label: "Medium", text: "#b45309", bg: "#fef3c7", dot: "#fbbf24" },
  high:   { label: "High",   text: "#dc2626", bg: "#fee2e2", dot: "#f87171" },
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

/* ─── Task Modal ─────────────────────────────────────────────────────────── */
function TaskModal({ task, defaultStatus, onSave, onClose }) {
  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    priority:    task?.priority    || "medium",
    status:      task?.status      || defaultStatus || "todo",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.title.trim().length > 0;

  const field = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", color: "#111827",
    background: "#fafafa",
  };
  const lbl = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 5, marginTop: 14, textTransform: "uppercase", letterSpacing: ".05em",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, padding: 32, width: 460, maxWidth: "94vw", boxShadow: "0 24px 64px rgba(0,0,0,.18)", border: "1px solid #f1f5f9" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {task ? "✏️" : "＋"}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>{task ? "Edit Task" : "New Task"}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{task ? "Update task details" : "Add a task to your board"}</p>
          </div>
        </div>

        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" style={field} autoFocus />

        <label style={lbl}>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Add details..." rows={3}
          style={{ ...field, resize: "vertical" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Priority</label>
            <select value={form.priority} onChange={set("priority")} style={field}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={set("status")} style={field}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 500, color: "#374151", fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(form)}
            style={{ flex: 2, padding: "10px 0", borderRadius: 8, border: "none", background: valid ? "#6366f1" : "#c7d2fe", color: "#fff", cursor: valid ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14, transition: "background .15s" }}
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Row (inside a column table) ──────────────────────────────────── */
function TaskRow({ task, onEdit, onDelete, onDragStart }) {
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  const [hover, setHover] = useState(false);

  return (
    <tr
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#f8fafc" : "#fff",
        cursor: "grab",
        transition: "background .12s",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      {/* Priority dot */}
      <td style={{ paddingLeft: 16, paddingTop: 12, paddingBottom: 12, width: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot }} />
      </td>

      {/* Title + description */}
      <td style={{ padding: "12px 12px 12px 10px", minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>
            {task.description}
          </div>
        )}
      </td>

      {/* Priority badge */}
      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, color: p.text, background: p.bg, letterSpacing: ".03em" }}>
          {p.label}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: "12px 16px 12px 8px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 2, opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            style={{ background: "#eef2ff", border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", fontSize: 12, color: "#6366f1" }}
          >✏️</button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete"
            style={{ background: "#fee2e2", border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", fontSize: 12, color: "#dc2626" }}
          >🗑</button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Kanban Column as a table card ─────────────────────────────────────── */
function KanbanColumn({ column, tasks, onDrop, onDragOver, onDragStart, onDelete, onEdit, onAddClick }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDrop={(e) => { setIsDragOver(false); onDrop(e, column.key); }}
      onDragOver={(e) => { onDragOver(e); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      style={{
        flex: 1,
        minWidth: 300,
        background: "#fff",
        borderRadius: 16,
        border: isDragOver ? `2px solid ${column.color}` : "1px solid #e5e7eb",
        boxShadow: isDragOver ? `0 0 0 4px ${column.light}` : "0 1px 4px rgba(0,0,0,.05)",
        overflow: "hidden",
        transition: "border .15s, box-shadow .15s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column header */}
      <div style={{
        padding: "14px 16px",
        background: column.light,
        borderBottom: `2px solid ${column.color}22`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", flex: 1, letterSpacing: ".02em", textTransform: "uppercase" }}>
          {column.label}
        </h3>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px",
          borderRadius: 20, background: column.color, color: "#fff",
          minWidth: 20, textAlign: "center",
        }}>{tasks.length}</span>
        <button
          onClick={() => onAddClick(column.key)}
          title={`Add task to ${column.label}`}
          style={{ background: column.color, border: "none", cursor: "pointer", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1 }}
        >+</button>
      </div>

      {/* Table */}
      <div style={{ overflowY: "auto", flex: 1, minHeight: 120, maxHeight: 480 }}>
        {tasks.length === 0 ? (
          <div style={{
            margin: 16, border: "2px dashed #e5e7eb", borderRadius: 10,
            padding: "28px 0", textAlign: "center", color: "#d1d5db", fontSize: 13,
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
            Drop tasks here
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={onDragStart}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer: add link */}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 16px" }}>
        <button
          onClick={() => onAddClick(column.key)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "inherit", padding: 0,
            transition: "color .15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = column.color}
          onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
        >
          <span style={{ fontSize: 16, fontWeight: 700 }}>+</span> Add task
        </button>
      </div>
    </div>
  );
}

/* ─── Main Board ─────────────────────────────────────────────────────────── */
export default function KanbanBoard({ user, onLogout }) {
  const [columns, setColumns]       = useState({ todo: [], in_progress: [], done: [] });
  const [modal, setModal]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]       = useState([]);   // task history log
  const dragTask = useRef(null);

  /* helpers */
  function addHistory(task) {
    setHistory((prev) => [
      {
        id:        Date.now(),
        taskTitle: task.title,
        priority:  task.priority || "medium",
        from:      task.from || null,
        at:        new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  async function loadTasks() {
    try {
      const data = await apiFetch(API);
      setColumns({ todo: data.todo || [], in_progress: data.in_progress || [], done: data.done || [] });
    } catch {
      setError("Could not load tasks. Is the Laravel server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function handleSave(form) {
    try {
      if (modal.task) {
        await apiFetch(`${API}/${modal.task.id}`, { method: "PUT", body: JSON.stringify(form) });
        // if task was just marked done via the modal, record it
        if (form.status === "done" && modal.task.status !== "done") {
          addHistory({ title: form.title, priority: form.priority, from: modal.task.status });
        }
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(form) });
        // if created directly as done, record it too
        if (form.status === "done") {
          addHistory({ title: form.title, priority: form.priority, from: null });
        }
      }
      setModal(null);
      loadTasks();
    } catch {
      alert("Failed to save task.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    await apiFetch(`${API}/${id}`, { method: "DELETE" });
    loadTasks();
  }

  async function handleLogout() {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch {}
    onLogout();
  }

  function handleDragStart(e, task) {
    dragTask.current = task;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;
    const targetLength = columns[newStatus]?.length ?? 0;
    await apiFetch(`${API}/${task.id}/move`, { method: "PATCH", body: JSON.stringify({ status: newStatus, order: targetLength }) });
    if (newStatus === "done") {
      addHistory({ title: task.title, priority: task.priority, from: task.status });
    }
    loadTasks();
  }

  const allTasks  = Object.values(columns).flat();
  const totalDone = columns.done?.length ?? 0;
  const total     = allTasks.length;
  const progress  = total ? Math.round((totalDone / total) * 100) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6b7280", fontFamily: "system-ui, sans-serif", gap: 10 }}>
      <div style={{ width: 20, height: 20, border: "2px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      Loading tasks…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#f3f4f6" }}>

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 0 #f1f5f9",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#111827", letterSpacing: "-.02em" }}>DailyMe</span>
        </div>

        {/* Stats chips */}
        <div style={{ display: "flex", gap: 8 }}>
          {COLUMNS.map((col) => (
            <div key={col.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: col.color, background: col.light, padding: "4px 10px", borderRadius: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot }} />
              {columns[col.key]?.length ?? 0} {col.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{progress}% done</span>
          <div style={{ width: 100, height: 5, background: "#e5e7eb", borderRadius: 99 }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#10b981)", width: `${progress}%`, transition: "width .4s ease" }} />
          </div>
        </div>

        {/* History button */}
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{
            padding: "7px 14px", borderRadius: 8,
            border: showHistory ? "none" : "1px solid #e5e7eb",
            background: showHistory ? "#eef2ff" : "#fff",
            color: showHistory ? "#6366f1" : "#6b7280",
            cursor: "pointer", fontWeight: 600, fontSize: 12,
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          🕓 History {history.length > 0 && <span style={{ background: "#6366f1", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10 }}>{history.length}</span>}
        </button>

        {/* New task */}
        <button
          onClick={() => setModal({ task: null, defaultStatus: "todo" })}
          style={{ padding: "8px 18px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13, boxShadow: "0 2px 8px rgba(99,102,241,.3)" }}
        >
          + New Task
        </button>

        {/* User */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4, borderLeft: "1px solid #f1f5f9" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{user.name}</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ padding: "7px 13px", background: "none", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 12, transition: "all .15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
        >
          Sign out
        </button>
      </header>

      {error && (
        <div style={{ margin: "20px 32px 0", padding: "12px 16px", background: "#fee2e2", borderRadius: 10, color: "#991b1b", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Board + optional history panel ──────────────────── */}
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "calc(100vh - 60px)" }}>

        {/* Columns */}
        <div style={{ flex: 1, display: "flex", gap: 16, padding: "24px 32px", alignItems: "flex-start", overflowX: "auto" }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              column={col}
              tasks={columns[col.key] || []}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDelete={handleDelete}
              onEdit={(task) => setModal({ task })}
              onAddClick={(status) => setModal({ task: null, defaultStatus: status })}
            />
          ))}
        </div>

        {/* History sidebar */}
        {showHistory && (
          <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid #e5e7eb", background: "#fff", minHeight: "calc(100vh - 60px)", padding: 0 }}>
            <TaskHistory history={history} onClear={() => setHistory([])} />
          </div>
        )}
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.defaultStatus}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}