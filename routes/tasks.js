const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

router.get('/', auth, (req, res) => {
  const tasks = query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
  res.json({ success: true, tasks });
});

router.post('/', auth, (req, res) => {
  const { title, description, priority, due_date } = req.body;
  if (!title) return res.json({ success: false, message: 'Judul wajib diisi' });
  run(
    'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
    [req.session.userId, title, description || '', priority || 'medium', due_date || null]
  );
  const tasks = query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.session.userId]);
  res.json({ success: true, task: tasks[0] });
});

router.put('/:id', auth, (req, res) => {
  const { title, description, priority, status, due_date } = req.body;
  const existing = query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (existing.length === 0) return res.json({ success: false, message: 'Task tidak ditemukan' });

  run(
    'UPDATE tasks SET title=?, description=?, priority=?, status=?, due_date=? WHERE id=? AND user_id=?',
    [title, description, priority, status, due_date, req.params.id, req.session.userId]
  );
  const tasks = query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true, task: tasks[0] });
});

router.delete('/:id', auth, (req, res) => {
  const existing = query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (existing.length === 0) return res.json({ success: false, message: 'Task tidak ditemukan' });
  run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

router.get('/stats', auth, (req, res) => {
  const stats = query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
    FROM tasks WHERE user_id = ?
  `, [req.session.userId]);
  res.json({ success: true, stats: stats[0] });
});

module.exports = router;
