const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  next();
};

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

router.get('/', auth, (req, res) => {
  const schedules = query(
    'SELECT * FROM schedules WHERE user_id = ? ORDER BY CASE day WHEN "Senin" THEN 1 WHEN "Selasa" THEN 2 WHEN "Rabu" THEN 3 WHEN "Kamis" THEN 4 WHEN "Jumat" THEN 5 WHEN "Sabtu" THEN 6 WHEN "Minggu" THEN 7 END, start_time',
    [req.session.userId]
  );
  res.json({ success: true, schedules });
});

router.post('/', auth, (req, res) => {
  const { day, start_time, end_time, subject, lecturer, room, color } = req.body;
  if (!day || !start_time || !end_time || !subject)
    return res.json({ success: false, message: 'Hari, jam, dan mata kuliah wajib diisi' });
  run(
    'INSERT INTO schedules (user_id, day, start_time, end_time, subject, lecturer, room, color) VALUES (?,?,?,?,?,?,?,?)',
    [req.session.userId, day, start_time, end_time, subject, lecturer||'', room||'', color||'#7c5cfc']
  );
  const rows = query('SELECT * FROM schedules WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.session.userId]);
  res.json({ success: true, schedule: rows[0] });
});

router.put('/:id', auth, (req, res) => {
  const { day, start_time, end_time, subject, lecturer, room, color } = req.body;
  const existing = query('SELECT id FROM schedules WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (!existing.length) return res.json({ success: false, message: 'Jadwal tidak ditemukan' });
  run(
    'UPDATE schedules SET day=?, start_time=?, end_time=?, subject=?, lecturer=?, room=?, color=? WHERE id=? AND user_id=?',
    [day, start_time, end_time, subject, lecturer||'', room||'', color||'#7c5cfc', req.params.id, req.session.userId]
  );
  const rows = query('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
  res.json({ success: true, schedule: rows[0] });
});

router.delete('/:id', auth, (req, res) => {
  run('DELETE FROM schedules WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;