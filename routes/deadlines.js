const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  next();
};

router.get('/', auth, (req, res) => {
  const items = query(
    'SELECT * FROM deadlines WHERE user_id = ? ORDER BY due_date ASC',
    [req.session.userId]
  );
  res.json({ success: true, deadlines: items });
});

router.post('/', auth, (req, res) => {
  const { title, description, due_date, category, priority } = req.body;
  if (!title || !due_date) return res.json({ success: false, message: 'Judul dan tanggal wajib diisi' });
  run(
    'INSERT INTO deadlines (user_id, title, description, due_date, category, priority) VALUES (?,?,?,?,?,?)',
    [req.session.userId, title, description||'', due_date, category||'Umum', priority||'medium']
  );
  const rows = query('SELECT * FROM deadlines WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.session.userId]);
  res.json({ success: true, deadline: rows[0] });
});

router.put('/:id', auth, (req, res) => {
  const { title, description, due_date, category, priority, status } = req.body;
  const ex = query('SELECT id FROM deadlines WHERE id=? AND user_id=?', [req.params.id, req.session.userId]);
  if (!ex.length) return res.json({ success: false });
  run(
    'UPDATE deadlines SET title=?,description=?,due_date=?,category=?,priority=?,status=? WHERE id=? AND user_id=?',
    [title, description||'', due_date, category||'Umum', priority||'medium', status||'active', req.params.id, req.session.userId]
  );
  const rows = query('SELECT * FROM deadlines WHERE id=?', [req.params.id]);
  res.json({ success: true, deadline: rows[0] });
});

router.delete('/:id', auth, (req, res) => {
  run('DELETE FROM deadlines WHERE id=? AND user_id=?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;