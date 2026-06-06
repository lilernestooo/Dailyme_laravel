import React, { useState, useEffect, useRef } from 'react';
import TaskHistory from './TaskHistory';

const API = "/api/tasks";

// ── Laravel Flame Logo (same as Register.jsx) ─────────────────────────────
function LaravelLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.250c0 .348-.188.670-.491.844l-8.610 4.968v9.836c0 .348-.188.670-.491.844l-17.953 10.356a.817.817 0 0 1-.114.050c-.013.005-.028.009-.042.012a.786.786 0 0 1-.213.028.786.786 0 0 1-.213-.028c-.016-.003-.030-.007-.045-.013a.818.818 0 0 1-.114-.049L.491 38.515A.981.981 0 0 1 0 37.671V6.885c0-.070.008-.140.028-.208.006-.020.015-.039.024-.059a.807.807 0 0 1 .068-.124c.012-.018.026-.035.040-.051a.809.809 0 0 1 .098-.091c.016-.013.031-.025.048-.035L9.310.192a.981.981 0 0 1 .981 0l9.025 5.208a.817.817 0 0 1 .049.031.808.808 0 0 1 .098.091.748.748 0 0 1 .040.051.826.826 0 0 1 .067.124c.010.020.018.039.025.059.019.068.028.138.028.208v19.420l7.491-4.324V11.773c0-.070.009-.140.028-.208.006-.020.015-.039.025-.059a.826.826 0 0 1 .067-.124.748.748 0 0 1 .040-.051.808.808 0 0 1 .098-.091.817.817 0 0 1 .049-.031l9.025-5.208a.981.981 0 0 1 .981 0l9.025 5.208c.017.010.033.022.049.035a.809.809 0 0 1 .098.091c.014.016.028.033.040.051a.826.826 0 0 1 .068.124c.009.020.018.039.023.059z" fill="#b94040"/>
      <path d="M48.062 21.816l-7.491 4.324V16.308l7.491-4.324v9.832zM39.589 37.093L22.618 26.947v-9.836l16.971 9.836v10.146zM9.800 1.554L1.327 6.470 9.800 11.386l8.473-4.916L9.800 1.554zM1.327 7.832v29.430l16.971 9.800V17.230L1.327 7.832zM9.800 12.748v19.420l7.491-4.324V8.424L9.800 12.748z" fill="#b94040" opacity=".4"/>
    </svg>
  );
}

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: "#FF2D20", light: "#fff5f5", dot: "#f87171", border: "#fde8e8" },
  { key: "in_progress", label: "In Progress",  color: "#f59e0b", light: "#fffbeb", dot: "#fbbf24", border: "#fde68a" },
  { key: "done",        label: "Done",         color: "#10b981", light: "#ecfdf5", dot: "#34d399", border: "#a7f3d0" },
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
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", color: "#111827",
    background: "#fafafa", transition: "border-color .15s, box-shadow .15s",
  };

  const focusIn  = (e) => { e.target.style.borderColor = "#FF2D20"; e.target.style.boxShadow = "0 0 0 3px rgba(255,45,32,.1)"; };
  const focusOut = (e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; };

  const lbl = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#374151", marginBottom: 6, marginTop: 16,
    textTransform: "uppercase", letterSpacing: ".05em",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 24, padding: 36, width: 460, maxWidth: "94vw", boxShadow: "0 8px 40px rgba(0,0,0,.12)", border: "1px solid rgba(255,45,32,.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#fff5f5,#ffe4e4)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,45,32,.15)" }}>
            <LaravelLogo size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-.02em" }}>{task ? "Edit Task" : "New Task"}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{task ? "Update task details" : "Add a task to your board"}</p>
          </div>
        </div>

        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" style={field} onFocus={focusIn} onBlur={focusOut} autoFocus />

        <label style={lbl}>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Add details..." rows={3}
          style={{ ...field, resize: "vertical" }} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Priority</label>
            <select value={form.priority} onChange={set("priority")} style={field} onFocus={focusIn} onBlur={focusOut}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={set("status")} style={field} onFocus={focusIn} onBlur={focusOut}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(form)}
            style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: valid ? "linear-gradient(135deg,#FF2D20,#ff5c52)" : "#fca5a5", color: "#fff", cursor: valid ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14, boxShadow: valid ? "0 4px 16px rgba(255,45,32,.3)" : "none", transition: "all .2s" }}>
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Row ───────────────────────────────────────────────────────────── */
function TaskRow({ task, onEdit, onDelete, onDragStart }) {
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  const [hover, setHover] = useState(false);
  const isDone = task.status === "done";

  return (
    <tr
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? "#fff8f8" : "#fff", cursor: "grab", transition: "background .12s", borderBottom: "1px solid #fdf2f2" }}
    >
      <td style={{ paddingLeft: 16, paddingTop: 12, paddingBottom: 12, width: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.dot }} />
      </td>
      <td style={{ padding: "12px 12px 12px 10px", minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: isDone ? "#9ca3af" : "#111827", textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: 12, color: "#d1b0b0", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
            {task.description}
          </div>
        )}
      </td>
      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, color: p.text, background: p.bg }}>
          {p.label}
        </span>
      </td>
      <td style={{ padding: "12px 16px 12px 8px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 2, opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
          <button onClick={() => onEdit(task)} title="Edit"
            style={{ background: "#fff5f5", border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", fontSize: 12, color: "#FF2D20" }}>✏️</button>
          <button onClick={() => onDelete(task.id)} title="Delete"
            style={{ background: "#fee2e2", border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", fontSize: 12, color: "#dc2626" }}>🗑</button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Kanban Column ──────────────────────────────────────────────────────── */
function KanbanColumn({ column, tasks, onDrop, onDragOver, onDragStart, onDelete, onEdit, onAddClick }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDrop={(e) => { setIsDragOver(false); onDrop(e, column.key); }}
      onDragOver={(e) => { onDragOver(e); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      style={{
        flex: 1, minWidth: 300, background: "#fff", borderRadius: 16,
        border: isDragOver ? `2px solid ${column.color}` : `1px solid ${column.border}`,
        boxShadow: isDragOver ? `0 0 0 4px ${column.light}` : "0 1px 4px rgba(255,45,32,.04)",
        overflow: "hidden", transition: "border .15s, box-shadow .15s",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px", background: column.light, borderBottom: `2px solid ${column.color}22`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#111827", flex: 1, letterSpacing: ".04em", textTransform: "uppercase" }}>
          {column.label}
        </h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: column.color, color: "#fff", minWidth: 20, textAlign: "center" }}>
          {tasks.length}
        </span>
        <button
          onClick={() => onAddClick(column.key)}
          style={{ background: column.color, border: "none", cursor: "pointer", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1 }}
        >+</button>
      </div>

      {/* Tasks */}
      <div style={{ overflowY: "auto", flex: 1, minHeight: 120, maxHeight: 480 }}>
        {tasks.length === 0 ? (
          <div style={{ margin: 16, border: "2px dashed #fde8e8", borderRadius: 10, padding: "28px 0", textAlign: "center", color: "#fca5a5", fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
            Drop tasks here
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #fdf2f2", padding: "10px 16px" }}>
        <button
          onClick={() => onAddClick(column.key)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", padding: 0, transition: "color .15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = column.color}
          onMouseLeave={(e) => e.currentTarget.style.color = "#fca5a5"}
        >
          <span style={{ fontSize: 16, fontWeight: 700 }}>+</span> Add task
        </button>
      </div>
    </div>
  );
}

/* ─── Main Board ─────────────────────────────────────────────────────────── */
export default function KanbanBoard({ user, onLogout }) {
  const [columns, setColumns]         = useState({ todo: [], in_progress: [], done: [] });
  const [modal, setModal]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState([]);
  const dragTask = useRef(null);

  function addHistory(task) {
    setHistory((prev) => [
      { id: Date.now(), taskTitle: task.title, priority: task.priority || "medium", from: task.from || null, at: new Date().toISOString() },
      ...prev,
    ]);
  }

// AFTER
async function loadTasks() {
  try {
    const data = await apiFetch(API);
    setColumns({ todo: data.todo || [], in_progress: data.in_progress || [], done: data.done || [] });

    // Seed history from DB on first load only (don't overwrite session additions)
    setHistory((prev) => {
      if (prev.length > 0) return prev; // already has session entries, skip
      return (data.history || []).map((t) => ({
        id:        t.id,
        taskTitle: t.title,
        priority:  t.priority,
        from:      null,
        at:        t.completed_at,
      }));
    });
  } catch {
    setError("Could not load tasks. Is the Laravel server running?");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { loadTasks(); }, []);

// AFTER
async function handleSave(form) {
  try {
    if (modal.task) {
      await apiFetch(`${API}/${modal.task.id}`, { method: "PUT", body: JSON.stringify(form) });
      if (form.status === "done" && modal.task.status !== "done") {
        // Task just became done via modal — add to history
        addHistory({ title: form.title, priority: form.priority, from: modal.task.status });
      } else if (form.status !== "done" && modal.task.status === "done") {
        // Task moved away from done — remove from history
        setHistory((prev) => prev.filter((h) => h.taskTitle !== modal.task.title));
      }
    } else {
      await apiFetch(API, { method: "POST", body: JSON.stringify(form) });
      if (form.status === "done")
        addHistory({ title: form.title, priority: form.priority, from: null });
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

  function handleDragStart(e, task) { dragTask.current = task; e.dataTransfer.effectAllowed = "move"; }
  function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }

// AFTER
async function handleDrop(e, newStatus) {
  e.preventDefault();
  const task = dragTask.current;
  if (!task || task.status === newStatus) return;
  const targetLength = columns[newStatus]?.length ?? 0;
  await apiFetch(`${API}/${task.id}/move`, { method: "PATCH", body: JSON.stringify({ status: newStatus, order: targetLength }) });

  if (newStatus === "done") {
    // Dragged into Done — add to history
    addHistory({ title: task.title, priority: task.priority, from: task.status });
  } else if (task.status === "done") {
    // Dragged out of Done — remove from history
    setHistory((prev) => prev.filter((h) => h.taskTitle !== task.title));
  }

  loadTasks();
}

  const allTasks  = Object.values(columns).flat();
  const totalDone = columns.done?.length ?? 0;
  const total     = allTasks.length;
  const progress  = total ? Math.round((totalDone / total) * 100) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#fca5a5", fontFamily: "system-ui, sans-serif", gap: 10 }}>
      <div style={{ width: 20, height: 20, border: "2px solid #fde8e8", borderTopColor: "#FF2D20", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      Loading tasks…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: "linear-gradient(135deg,#fff5f5 0%,#fff 50%,#fef2f2 100%)" }}>

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #fde8e8",
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(255,45,32,.07)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#fff5f5,#ffe4e4)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,45,32,.15)" }}>
            <LaravelLogo size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#111827", letterSpacing: "-.02em" }}>DailyMe</span>
        </div>

        {/* Stat chips */}
        <div style={{ display: "flex", gap: 7 }}>
          {COLUMNS.map((col) => (
            <div key={col.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: col.color, background: col.light, padding: "4px 10px", borderRadius: 20, border: `1px solid ${col.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.dot }} />
              {columns[col.key]?.length ?? 0} {col.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>{progress}% done</span>
          <div style={{ width: 90, height: 5, background: "#fde8e8", borderRadius: 99 }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#FF2D20,#f87171)", width: `${progress}%`, transition: "width .4s ease" }} />
          </div>
        </div>

        {/* History */}
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{ padding: "7px 13px", borderRadius: 8, border: showHistory ? "none" : "1px solid #fde8e8", background: showHistory ? "#fff5f5" : "#fff", color: showHistory ? "#FF2D20" : "#9ca3af", cursor: "pointer", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
        >
          🕓 History {history.length > 0 && <span style={{ background: "#FF2D20", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10 }}>{history.length}</span>}
        </button>

        {/* New task */}
        <button
          onClick={() => setModal({ task: null, defaultStatus: "todo" })}
          style={{ padding: "8px 18px", background: "linear-gradient(135deg,#FF2D20,#ff5c52)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 8px rgba(255,45,32,.3)", transition: "all .2s" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          + New Task
        </button>

        {/* User avatar */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: "1px solid #fde8e8" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#FF2D20,#f87171)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>
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

      {/* ── Board ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ flex: 1, display: "flex", gap: 16, padding: "24px 32px", alignItems: "flex-start", overflowX: "auto" }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key} column={col} tasks={columns[col.key] || []}
              onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart}
              onDelete={handleDelete} onEdit={(task) => setModal({ task })}
              onAddClick={(status) => setModal({ task: null, defaultStatus: status })}
            />
          ))}
        </div>

        {showHistory && (
          <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid #fde8e8", background: "#fff", minHeight: "calc(100vh - 60px)" }}>
            <TaskHistory history={history} onClear={() => setHistory([])} />
          </div>
        )}
      </div>

      {modal && (
        <TaskModal task={modal.task} defaultStatus={modal.defaultStatus} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}