import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import KanbanBoard from './Components/KanbanBoard';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [checking, setChecking] = useState(true);

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
  }

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#6b7280' }}>
      Loading...
    </div>
  );

  if (!user) {
    if (page === 'register') return <Register onRegister={setUser} onGoToLogin={() => setPage('login')} />;
    return <Login onLogin={setUser} onGoToRegister={() => setPage('register')} />;
  }

  return <KanbanBoard user={user} onLogout={handleLogout} />;
}

const el = document.getElementById('app');
if (el) createRoot(el).render(<App />);
