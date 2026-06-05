import React from 'react';
import { createRoot } from 'react-dom/client';
import KanbanBoard from './Components/KanbanBoard';

const el = document.getElementById('app');
if (el) createRoot(el).render(<KanbanBoard />);
