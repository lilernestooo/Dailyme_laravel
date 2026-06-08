import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import KanbanBoard from './Components/KanbanBoard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ProjectList from './Components/ProjectList';
import ProjectBoard from './Components/ProjectBoard';

function App() {
  const [user, setUser]             = useState(null);
  const [page, setPage]             = useState('login');
  const [checking, setChecking]     = useState(true);
  const [view, setView]             = useState('daily');
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setUser(data); })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('auth_token');
    setUser(null);
    setPage('login');
    setView('daily');
    setActiveProject(null);
  }

  function openProject(project) {
    setActiveProject(project);
    setView('board');
  }

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#6b7280' }}>
      Loading...
    </div>
  );

  if (!user) {
    if (page === 'register') return <Register onRegister={() => setPage('login')} onGoToLogin={() => setPage('login')} />;
    return <Login onLogin={setUser} onGoToRegister={() => setPage('register')} />;
  }

  if (view === 'board' && activeProject) {
    return <ProjectBoard project={activeProject} user={user} onBack={() => setView('projects')} onLogout={handleLogout} />;
  }

  if (view === 'projects') {
    return <ProjectList user={user} onOpenProject={openProject} onGoToDaily={() => setView('daily')} onLogout={handleLogout} />;
  }

  return <KanbanBoard user={user} onLogout={handleLogout} onGoToProjects={() => setView('projects')} />;
}

const el = document.getElementById('app');
if (el) createRoot(el).render(<App />);