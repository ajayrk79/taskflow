// ============================================================
//  TaskFlow Backend — Node.js + Express REST API
//  File: server.js
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ── In-memory store (replace with DB in production) ──────────
let tasks = [
  { id: 1, text: 'Set up CI/CD pipeline with GitHub Actions', priority: 'high',   done: false, createdAt: new Date() },
  { id: 2, text: 'Write unit tests for API endpoints',         priority: 'high',   done: true,  createdAt: new Date() },
  { id: 3, text: 'Deploy to production server',                priority: 'medium', done: false, createdAt: new Date() },
];
let nextId = 4;

// ── Routes ───────────────────────────────────────────────────

// GET /api/tasks  →  list all tasks (optional ?done=true/false)
app.get('/api/tasks', (req, res) => {
  let result = tasks;
  if (req.query.done !== undefined) {
    const done = req.query.done === 'true';
    result = tasks.filter(t => t.done === done);
  }
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/tasks/:id  →  single task
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: task });
});

// POST /api/tasks  →  create task
app.post('/api/tasks', (req, res) => {
  const { text, priority = 'medium' } = req.body;

  // Validation
  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, message: 'text is required' });
  }
  if (!['high', 'medium', 'low'].includes(priority)) {
    return res.status(400).json({ success: false, message: 'priority must be high | medium | low' });
  }

  const task = { id: nextId++, text, priority, done: false, createdAt: new Date() };
  tasks.push(task);
  res.status(201).json({ success: true, data: task });
});

// PATCH /api/tasks/:id  →  update (toggle done, change text/priority)
app.patch('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Task not found' });

  const allowed = ['text', 'priority', 'done'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) tasks[idx][field] = req.body[field];
  });
  res.json({ success: true, data: tasks[idx] });
});

// DELETE /api/tasks/:id  →  remove task
app.delete('/api/tasks/:id', (req, res) => {
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  if (tasks.length === before) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, message: 'Task deleted' });
});

// Health-check endpoint (used by CI/CD pipeline to verify deploy)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TaskFlow API running on port ${PORT}`));

module.exports = app; // exported for testing
