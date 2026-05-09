const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  next();
};

router.get('/', auth, (req, res) => {
  const todos = query('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
  res.json({ success: true, todos });
});

router.post('/', auth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ success: false, message: 'Teks wajib diisi' });
  run('INSERT INTO todos (user_id, text) VALUES (?, ?)', [req.session.userId, text]);
  const todos = query('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.session.userId]);
  res.json({ success: true, todo: todos[0] });
});

router.put('/:id/toggle', auth, (req, res) => {
  const todo = query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (!todo.length) return res.json({ success: false });
  const newDone = todo[0].done ? 0 : 1;
  run('UPDATE todos SET done = ? WHERE id = ? AND user_id = ?', [newDone, req.params.id, req.session.userId]);
  res.json({ success: true, done: newDone });
});

router.delete('/:id', auth, (req, res) => {
  run('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

router.delete('/done/all', auth, (req, res) => {
  run('DELETE FROM todos WHERE user_id = ? AND done = 1', [req.session.userId]);
  res.json({ success: true });
});

module.exports = router;