import React, { useState, useEffect, useRef } from 'react';

const API = "/api/tasks";

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: "#6366f1", bg: "#eef2ff" },
  { key: "in_progress", label: "In Progress",  color: "#f59e0b", bg: "#fffbeb" },
  { key: "done",        label: "Done",         color: "#10b981", bg: "#ecfdf5" },
];

const PRIORITY_COLORS = {
  low:    { text: "#059669", bg: "#d1fae5" },
  medium: { text: "#d97706", bg: "#fef3c7" },
  high:   { text: "#dc2626", bg: "#fee2e2" },
};

async function apiFetch(url, options = {}) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
      Accept: "application/json",
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function TaskCard({ task, onDelete, onEdit, onDragStart }) {
  const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      style={{
        background: "#fff", borderRadius: 12, padding: "14px 16px",
        marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        border: "1px solid #e5e7eb", cursor: "grab",
        transition: "box-shadow .15s, transform .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.12)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".05em",
          textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
          color: p.text, background: p.bg,
        }}>{task.priority}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "2px 4px", opacity: 0.6 }}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "2px 4px", opacity: 0.6 }}>🗑</button>
        </div>
      </div>
      <p style={{ margin: "10px 0 4px", fontWeight: 600, fontSize: 14, color: "#111827", lineHeight: 1.4 }}>{task.title}</p>
      {task.description && (
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{task.description}</p>
      )}
    </div>
  );
}

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    status: task?.status || "todo",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 14 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{task ? "Edit Task" : "New Task"}</h2>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{task ? "Update your task details" : "Add a new task to your board"}</p>
        <label style={labelStyle}>Title *</label>
        <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" style={inputStyle} autoFocus />
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Add more details..." rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={set("priority")} style={inputStyle}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Column</label>
            <select value={form.status} onChange={set("status")} style={inputStyle}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 500, color: "#374151", fontSize: 14 }}>Cancel</button>
          <button onClick={() => form.title.trim() && onSave(form)} style={{ flex: 2, padding: "10px 0", borderRadius: 8, border: "none", background: form.title.trim() ? "#6366f1" : "#c7d2fe", color: "#fff", cursor: form.title.trim() ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14 }}>{task ? "Save Changes" : "Create Task"}</button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onDrop, onDragOver, onDragStart, onDelete, onEdit, onAddClick }) {
  const [isDragOver, setIsDragOver] = useState(false);
  return (
    <div
      onDrop={(e) => { setIsDragOver(false); onDrop(e, column.key); }}
      onDragOver={(e) => { onDragOver(e); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      style={{ flex: 1, minWidth: 280, background: isDragOver ? column.bg : "#f9fafb", borderRadius: 16, padding: 16, border: isDragOver ? `2px solid ${column.color}` : "1px solid #e5e7eb", transition: "background .15s, border .15s" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: column.color }} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827", flex: 1 }}>{column.label}</h3>
        <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: column.bg, color: column.color }}>{tasks.length}</span>
        <button onClick={() => onAddClick(column.key)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: column.color, lineHeight: 1, padding: "0 2px" }}>+</button>
      </div>
      <div style={{ minHeight: 80 }}>
        {tasks.length === 0 && (
          <div style={{ border: "2px dashed #e5e7eb", borderRadius: 10, padding: "24px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Drop tasks here</div>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState({ todo: [], in_progress: [], done: [] });
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dragTask = useRef(null);

  async function loadTasks() {
    try {
      const data = await apiFetch(API);
      setColumns({ todo: data.todo || [], in_progress: data.in_progress || [], done: data.done || [] });
    } catch (e) {
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
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(form) });
      }
      setModal(null);
      loadTasks();
    } catch (e) {
      alert("Failed to save task. Please try again.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    await apiFetch(`${API}/${id}`, { method: "DELETE" });
    loadTasks();
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
    loadTasks();
  }

  const allTasks = Object.values(columns).flat();
  const totalDone = columns.done?.length ?? 0;
  const total = allTasks.length;
  const progress = total ? Math.round((totalDone / total) * 100) : 0;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6b7280", fontFamily: "system-ui, sans-serif" }}>
      Loading your tasks...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "18px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>📋 DailyMe</h1>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>{totalDone}/{total} tasks completed · {progress}% done</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 140, height: 6, background: "#e5e7eb", borderRadius: 99 }}>
          <div style={{ height: "100%", borderRadius: 99, background: "#10b981", width: `${progress}%`, transition: "width .4s ease" }} />
        </div>
        <button onClick={() => setModal({ task: null, defaultStatus: "todo" })} style={{ padding: "9px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ New Task</button>
      </div>
      {error && (
        <div style={{ margin: 24, padding: 16, background: "#fee2e2", borderRadius: 10, color: "#991b1b", fontSize: 14 }}>⚠️ {error}</div>
      )}
      <div style={{ display: "flex", gap: 16, padding: "24px 32px", alignItems: "flex-start" }}>
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.key} column={col} tasks={columns[col.key] || []} onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onDelete={handleDelete} onEdit={(task) => setModal({ task })} onAddClick={(status) => setModal({ task: null, defaultStatus: status })} />
        ))}
      </div>
      {modal && <TaskModal task={modal.task} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
