const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  next();
};

router.get('/', auth, (req, res) => {
  const notes = query(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
    [req.session.userId]
  );
  res.json({ success: true, notes });
});

router.post('/', auth, (req, res) => {
  const { title, content, color } = req.body;
  if (!title) return res.json({ success: false, message: 'Judul wajib diisi' });
  run(
    'INSERT INTO notes (user_id, title, content, color) VALUES (?,?,?,?)',
    [req.session.userId, title, content || '', color || '#7c5cfc']
  );
  const rows = query(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [req.session.userId]
  );
  res.json({ success: true, note: rows[0] });
});

router.put('/:id', auth, (req, res) => {
  const { title, content, color } = req.body;
  const ex = query('SELECT id FROM notes WHERE id=? AND user_id=?', [req.params.id, req.session.userId]);
  if (!ex.length) return res.json({ success: false });
  run(
    'UPDATE notes SET title=?, content=?, color=?, updated_at=datetime("now") WHERE id=? AND user_id=?',
    [title, content || '', color || '#7c5cfc', req.params.id, req.session.userId]
  );
  const rows = query('SELECT * FROM notes WHERE id=?', [req.params.id]);
  res.json({ success: true, note: rows[0] });
});

router.delete('/:id', auth, (req, res) => {
  run('DELETE FROM notes WHERE id=? AND user_id=?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;