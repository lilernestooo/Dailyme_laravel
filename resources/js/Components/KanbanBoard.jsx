import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Card } from 'antd';
import { KanbanBoardSkeleton } from './Skeleton';
import NotificationBell from './NotificationBell';
import TaskHistory from './TaskHistory';
import logo from '../assets/logo-dailyme(1).png';

const STYLE_ID = 'btn-spin-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `@keyframes btnSpin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

const API = "/api/tasks";

// ── DailyMe Logo ───────────────────────────────────────────────────────────
function DailyMeLogo({ size = 28 }) {
  return (
    <img src={logo} alt="DailyMe" style={{ width: size, height: size, objectFit: 'contain' }} />
  );
}

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  purple50:  '#f0f9ff',
  purple100: '#e0f2fe',
  purple200: '#bae6fd',
  purple300: '#7dd3fc',
  purple400: '#38bdf8',
  purple500: '#0ea5e9',
  purple600: '#3b82f6',
  purple700: '#2563eb',
  textPrimary:   '#1e1b4b',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  border:        '#e0f2fe',
  borderMid:     '#7dd3fc',
  white:         '#ffffff',
  bg:            '#f8faff',
};

const COLUMNS = [
  { key: "todo",        label: "To Do",       color: P.purple600, light: P.purple50,  dot: P.purple400, border: P.purple200 },
  { key: "in_progress", label: "In Progress",  color: "#0ea5e9",   light: "#f0f9ff",   dot: "#38bdf8",   border: "#bae6fd" },
  { key: "done",        label: "Done",         color: "#0ea5e9",   light: "#f0f9ff",   dot: "#38bdf8",   border: "#bae6fd" },
];

const PRIORITY = {
  low:    { label: "Low",    text: "#065f46", bg: "#d1fae5", dot: "#34d399" },
  medium: { label: "Medium", text: "#92400e", bg: "#fef3c7", dot: "#fbbf24" },
  high:   { label: "High",   text: "#991b1b", bg: "#fee2e2", dot: "#f87171" },
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

// ── Tooltip wrapper ────────────────────────────────────────────────────────
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: P.textPrimary, color: "#fff", fontSize: 11, fontWeight: 600,
          padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none",
          letterSpacing: ".03em", zIndex: 9999,
        }}>
          {label}
          <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", borderWidth: 4, borderStyle: "solid", borderColor: `transparent transparent ${P.textPrimary} transparent` }} />
        </div>
      )}
    </div>
  );
}

// ── Icon button ─────────────────────────────────────────────────────────────
function NavIcon({ icon, label, onClick, active, badge }) {
  const [hover, setHover] = useState(false);
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "relative", width: 36, height: 36, borderRadius: 10,
          border: active ? `1.5px solid ${P.purple300}` : "1.5px solid transparent",
          background: active ? P.purple100 : hover ? P.purple50 : "transparent",
          color: active ? P.purple600 : hover ? P.purple500 : P.textSecondary,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s", fontSize: 18,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        {badge > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4, width: 8, height: 8,
            borderRadius: "50%", background: P.purple600, border: "2px solid #fff",
          }} />
        )}
      </button>
    </Tooltip>
  );
}

// ── Task Modal ─────────────────────────────────────────────────────────────
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
    border: `1.5px solid ${P.border}`, fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", color: P.textPrimary,
    background: P.purple50, transition: "border-color .15s, box-shadow .15s",
  };
  const focusIn  = (e) => { e.target.style.borderColor = P.purple500; e.target.style.boxShadow = `0 0 0 3px ${P.purple100}`; };
  const focusOut = (e) => { e.target.style.borderColor = P.border; e.target.style.boxShadow = "none"; };

  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: P.textSecondary, marginBottom: 6, marginTop: 16,
    textTransform: "uppercase", letterSpacing: ".06em",
  };

  return (
    <div
    style={{ position: "fixed", inset: 0, background: "rgba(107,114,128,.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        style={{ background: P.white, borderRadius: 20, padding: 32, width: 460, maxWidth: "94vw", boxShadow: "0 8px 40px rgba(124,58,237,.12)", border: `1px solid ${P.purple200}` }}
        onClick={(e) => e.stopPropagation()}
      >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <DailyMeLogo size={50} />
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.textPrimary, letterSpacing: "-.02em" }}>{task ? "Edit Task" : "New Task"}</h2>
            <p style={{ margin: 0, fontSize: 12, color: P.textMuted }}>{task ? "Update task details" : "Add a task to your board"}</p>
          </div>
        </div>

        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" style={field} onFocus={focusIn} onBlur={focusOut} autoFocus />

        <label style={lbl}>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Add details…" rows={3}
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
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: `1px solid ${P.border}`, background: P.white, cursor: "pointer", fontWeight: 600, color: P.textSecondary, fontSize: 14, transition: "all .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = P.purple50; e.currentTarget.style.borderColor = P.purple300; e.currentTarget.style.color = P.purple600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = P.white; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textSecondary; }}>
            Cancel
          </button>
          <button
          onClick={() => valid && onSave(form)}
          style={{ flex: 2, padding: "11px 0", borderRadius: 12, border: "none", background: valid ? 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' : '#93c5fd', color: "#fff", cursor: valid ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14, boxShadow: valid ? '0 4px 16px rgba(16,185,129,.3)' : "none", transition: "all .2s" }}
          onMouseEnter={(e) => { if (valid) e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #059669 100%)'; }}
          onMouseLeave={(e) => { if (valid) e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'; }}>
          {task ? "Save Changes" : "Create Task"}
        </button>
        </div>
      </div>
    </div>
  );
}

// ── Task Row ────────────────────────────────────────────────────────────────
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
      style={{ background: hover ? P.purple50 : P.white, cursor: "grab", transition: "background .12s", borderBottom: `1px solid ${P.border}` }}
    >
      <td style={{ paddingLeft: 14, paddingTop: 11, paddingBottom: 11, width: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.dot }} />
      </td>
      <td style={{ padding: "11px 10px 11px 10px", minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: isDone ? P.textMuted : P.textPrimary, textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
            {task.description}
          </div>
        )}
      </td>
      <td style={{ padding: "11px 8px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 7px", borderRadius: 20, color: p.text, background: p.bg }}>
          {p.label}
        </span>
      </td>
      <td style={{ padding: "11px 14px 11px 8px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 2, opacity: hover ? 1 : 0, transition: "opacity .15s" }}>
        <button onClick={() => onEdit(task)} title="Edit"
            style={{ background: P.purple100, border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", color: P.purple600, display: "flex", alignItems: "center" }}>
            <EditOutlined style={{ fontSize: 13 }} />
          </button>
          <button onClick={() => onDelete(task.id)} title="Delete"
            style={{ background: "#fee2e2", border: "none", cursor: "pointer", borderRadius: 6, padding: "4px 7px", color: "#dc2626", display: "flex", alignItems: "center" }}>
            <DeleteOutlined style={{ fontSize: 13 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Kanban Column ───────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks, onDrop, onDragOver, onDragStart, onDelete, onEdit, onAddClick }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <Card
    onDrop={(e) => { setIsDragOver(false); onDrop(e, column.key); }}
    onDragOver={(e) => { onDragOver(e); setIsDragOver(true); }}
    onDragLeave={() => setIsDragOver(false)}
    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
    style={{
      flex: 1, minWidth: 300, borderRadius: 16,
      border: isDragOver ? `2px solid ${column.color}` : `1px solid ${column.border}`,
      boxShadow: isDragOver ? `0 0 0 4px ${column.light}` : "0 1px 6px rgba(124,58,237,.05)",
      overflow: "hidden", transition: "border .15s, box-shadow .15s",
      display: "flex", flexDirection: "column",
    }}
  >
      {/* Header */}
      <div style={{ padding: "13px 16px", background: column.light, borderBottom: `1px solid ${column.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: column.color, flexShrink: 0 }} />
        <h3 style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: P.textPrimary, flex: 1, letterSpacing: ".05em", textTransform: "uppercase" }}>
          {column.label}
        </h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: column.color, color: "#fff", minWidth: 20, textAlign: "center" }}>
          {tasks.length}
        </span>
       {/*<button
          onClick={() => onAddClick(column.key)}
          style={{ background: column.color, border: "none", cursor: "pointer", borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1 }}
          >+</button>*/}
      </div>

      {/* Tasks */}
      <div style={{ overflowY: "auto", flex: 1, minHeight: 120, maxHeight: 480 }}>
        {tasks.length === 0 ? (
          <div style={{ margin: 14, border: `2px dashed ${column.border}`, borderRadius: 10, padding: "26px 0", textAlign: "center", color: P.textMuted, fontSize: 12.5 }}>
            <div style={{ marginBottom: 5, display: "flex", justifyContent: "center", color: P.textMuted }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            </div>
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

      {/* <div style={{ borderTop: `1px solid ${P.border}`, padding: "9px 16px" }}>
        <button
          onClick={() => onAddClick(column.key)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: P.textMuted, display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", padding: 0, transition: "color .15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = column.color}
          onMouseLeave={(e) => e.currentTarget.style.color = P.textMuted}
        >
          <span style={{ fontSize: 15, fontWeight: 700 }}>+</span> Add task
        </button>
      </div>*/}
     </Card>
  );
}

// ── Floating Status Anchors ────────────────────────────────────────────────
function FloatingAnchors({ counts, total, onColumnClick }) {
  const anchors = [
    { key: "todo",        label: "To Do",      color: P.purple600, bg: P.purple100 },
    { key: "in_progress", label: "In Progress", color: "#0ea5e9",   bg: "#e0f2fe"   },
    { key: "done",        label: "Done",        color: "#10b981",   bg: "#d1fae5"   },
  ];
  const progress = total ? Math.round(((counts.done || 0) / total) * 100) : 0;

  return (
    <div style={{
      position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)",
      background: P.white, borderRadius: 50, border: `1px solid ${P.purple200}`,
      boxShadow: "0 4px 24px rgba(124,58,237,.14)", padding: "8px 18px",
      display: "flex", alignItems: "center", gap: 4, zIndex: 200,
    }}>
      {anchors.map((a, i) => (
        <React.Fragment key={a.key}>
          <button
            onClick={() => onColumnClick(a.key)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 30,
              transition: "background .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = a.bg}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: a.bg, color: a.color, borderRadius: 20, padding: "1px 7px" }}>
              {counts[a.key] || 0}
            </span>
          </button>
          {i < anchors.length - 1 && (
            <div style={{ width: 1, height: 18, background: P.border }} />
          )}
        </React.Fragment>
      ))}

      <div style={{ width: 1, height: 18, background: P.border, margin: "0 4px" }} />

      {/* Mini progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 60, height: 4, background: P.purple100, borderRadius: 99 }}>
          <div style={{ height: "100%", borderRadius: 99, background: P.purple500, width: `${progress}%`, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: P.purple600 }}>{progress}%</span>
      </div>
    </div>
  );
}

// ── Profile Dropdown ────────────────────────────────────────────────────────
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: open ? 'linear-gradient(135deg, #2563eb 0%, #059669 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
          border: open ? '2px solid #86efac' : "2px solid transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 13,
          cursor: "pointer", transition: "all .15s",
          boxShadow: open ? '0 0 0 3px #dcfce7' : "none",
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: P.white, border: `1px solid ${P.purple200}`,
          borderRadius: 14, boxShadow: "0 8px 30px rgba(124,58,237,.12)",
          minWidth: 200, overflow: "hidden", zIndex: 500,
        }}>
          {/* Profile header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {initial}
          </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: P.textPrimary }}>{user?.name || "User"}</div>
              <div style={{ fontSize: 11.5, color: P.textMuted }}>{user?.email || ""}</div>
            </div>
          </div>

          {/* Sign out */}
          <div style={{ padding: "6px 0" }}>
            <button
              onClick={onLogout}
              style={{ width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#dc2626", textAlign: "left", transition: "background .12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <LogoutOutlined style={{ fontSize: 15 }} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Board ─────────────────────────────────────────────────────────────
export default function KanbanBoard({ user, onLogout, onGoToProjects, onGoToAdmin }) {
  const [columns, setColumns]         = useState({ todo: [], in_progress: [], done: [] });
  const [modal, setModal]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState([]);
  const [spin, setSpin]               = useState(false);
  const dragTask = useRef(null);
  const columnRefs = useRef({});

  function addHistory(task) {
    setHistory((prev) => [
      { id: Date.now(), taskTitle: task.title, priority: task.priority || "medium", from: task.from || null, at: new Date().toISOString() },
      ...prev,
    ]);
  }

  async function loadTasks() {
    try {
      const data = await apiFetch(API);
      setColumns({ todo: data.todo || [], in_progress: data.in_progress || [], done: data.done || [] });
      setHistory((data.done || []).map((t) => ({
        id: t.id, taskTitle: t.title, priority: t.priority, from: null, at: t.completed_at,
      })));
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
        if (form.status === "done" && modal.task.status !== "done") {
          addHistory({ title: form.title, priority: form.priority, from: modal.task.status });
        } else if (form.status !== "done" && modal.task.status === "done") {
          setHistory((prev) => prev.filter((h) => h.taskTitle !== modal.task.title));
        }
      } else {
        await apiFetch(API, { method: "POST", body: JSON.stringify(form) });
        if (form.status === "done") addHistory({ title: form.title, priority: form.priority, from: null });
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

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;
    const targetLength = columns[newStatus]?.length ?? 0;
    await apiFetch(`${API}/${task.id}/move`, { method: "PATCH", body: JSON.stringify({ status: newStatus, order: targetLength }) });
    if (newStatus === "done") {
      addHistory({ title: task.title, priority: task.priority, from: task.status });
    } else if (task.status === "done") {
      setHistory((prev) => prev.filter((h) => h.taskTitle !== task.title));
    }
    loadTasks();
  }

  function scrollToColumn(key) {
    columnRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  const allTasks = Object.values(columns).flat();
  const counts   = { todo: columns.todo?.length ?? 0, in_progress: columns.in_progress?.length ?? 0, done: columns.done?.length ?? 0 };

  if (loading) return <KanbanBoardSkeleton />;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", minHeight: "100vh", background: P.bg }}>

      {/* ── Navbar ────────────────────────────────────────── */}
      <header style={{
        background: P.white,
        borderBottom: `1px solid ${P.border}`,
        padding: "0 24px",
        height: 56,
        display: "flex", alignItems: "center", gap: 10,
        position: "sticky", top: 0, zIndex: 1000,
        boxShadow: "0 1px 8px rgba(124,58,237,.06)",
      }}>
        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 12 }}>
          <DailyMeLogo size={50} />
          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary, letterSpacing: "-.03em" }}>DailyMe</span>
        </div>

        <div style={{ width: 1, height: 22, background: P.border, margin: "0 2px" }} />

        {/* Icon nav group */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <NavIcon icon={<FolderOutlined style={{ fontSize: 16 }} />} label="Projects" onClick={() => onGoToProjects && onGoToProjects()} />
        <NavIcon icon={<ClockCircleOutlined style={{ fontSize: 16 }} />} label="History" onClick={() => setShowHistory((v) => !v)} active={showHistory} badge={history.length} />
          {onGoToAdmin && (
            <NavIcon
            icon={<SafetyOutlined style={{ fontSize: 16 }} />}
            label="Admin Dashboard"
            onClick={onGoToAdmin}
          />
          )}
          <Tooltip label="Notifications">
            <NotificationBell onOpenProject={onGoToProjects} />
          </Tooltip>
        </div>

        <div style={{ flex: 1 }} />

        {/* New task button */}
        <button
        onClick={() => { setModal({ task: null, defaultStatus: "todo" }); setSpin(true); setTimeout(() => setSpin(false), 600); }}
        onMouseEnter={(e) => { setSpin(true); e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #059669 100%)'; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { setSpin(false); e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'; e.currentTarget.style.transform = "translateY(0)"; }}
        style={{
          padding: "7px 16px", background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', color: "#fff",
          border: "none", borderRadius: 9, cursor: "pointer",
          fontWeight: 700, fontSize: 13,
          boxShadow: '0 2px 8px rgba(16,185,129,.3)',
          transition: "all .2s", display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <TagOutlined style={{ fontSize: 14, display: 'inline-flex', animation: spin ? 'btnSpin 0.6s linear' : 'none' }} />
        New Task
      </button>

        <div style={{ width: 1, height: 22, background: P.border, margin: "0 4px" }} />

        {/* Profile dropdown */}
        <ProfileDropdown user={user} onLogout={handleLogout} />
      </header>

      {error && (
        <div style={{ margin: "16px 28px 0", padding: "11px 16px", background: "#fef3c7", borderRadius: 10, color: "#92400e", fontSize: 13, display: "flex", alignItems: "center", gap: 8, border: "1px solid #fde68a" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Board ─────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "calc(100vh - 56px)" }}>
        <div style={{ flex: 1, display: "flex", gap: 16, padding: "24px 28px 100px", alignItems: "flex-start", overflowX: "auto" }}>
          {COLUMNS.map((col) => (
            <div key={col.key} ref={(el) => (columnRefs.current[col.key] = el)} style={{ flex: 1, minWidth: 300 }}>
              <KanbanColumn
                column={col} tasks={columns[col.key] || []}
                onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart}
                onDelete={handleDelete} onEdit={(task) => setModal({ task })}
                onAddClick={(status) => setModal({ task: null, defaultStatus: status })}
              />
            </div>
          ))}
        </div>

        {showHistory && (
          <div style={{ width: 290, flexShrink: 0, borderLeft: `1px solid ${P.border}`, background: P.white, minHeight: "calc(100vh - 56px)" }}>
            <TaskHistory history={history} onClear={() => setHistory([])} />
          </div>
        )}
      </div>

      {/* ── Floating anchors ──────────────────────────────── */}
      <FloatingAnchors counts={counts} total={allTasks.length} onColumnClick={scrollToColumn} />

      {modal && (
        <TaskModal task={modal.task} defaultStatus={modal.defaultStatus} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}