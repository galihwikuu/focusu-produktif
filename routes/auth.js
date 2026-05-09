const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run } = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: 'Semua field wajib diisi' });

  const existing = query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0)
    return res.json({ success: false, message: 'Email sudah terdaftar' });

  const hashed = await bcrypt.hash(password, 10);
  run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, 'user']);

  const user = query('SELECT id, name, email, role FROM users WHERE email = ?', [email])[0];
  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userRole = user.role;
  res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0)
    return res.json({ success: false, message: 'Email atau password salah' });

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.json({ success: false, message: 'Email atau password salah' });

  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userRole = user.role;
  res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.json({ success: false });
  res.json({ success: true, user: { id: req.session.userId, name: req.session.userName, role: req.session.userRole } });
});

router.post('/change-password', async (req, res) => {
  if (!req.session.userId) return res.json({ success: false });
  const { oldPassword, newPassword } = req.body;
  const users = query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
  if (!users.length) return res.json({ success: false });
  const match = await bcrypt.compare(oldPassword, users[0].password);
  if (!match) return res.json({ success: false, message: 'Password lama salah!' });
  const hashed = await bcrypt.hash(newPassword, 10);
  run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;