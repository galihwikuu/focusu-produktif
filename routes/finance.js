const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false });
  next();
};

router.get('/', auth, (req, res) => {
  const { month, year } = req.query;
  let sql = 'SELECT * FROM finance WHERE user_id = ?';
  const params = [req.session.userId];
  if (month && year) {
    sql += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
    params.push(String(month).padStart(2,'0'), String(year));
  }
  sql += ' ORDER BY date DESC, created_at DESC';
  const items = query(sql, params);
  res.json({ success: true, transactions: items });
});

router.get('/summary', auth, (req, res) => {
  const { year } = req.query;
  const y = year || new Date().getFullYear();
  // Monthly summary
  const monthly = query(`
    SELECT strftime('%m', date) as month,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM finance WHERE user_id=? AND strftime('%Y', date)=?
    GROUP BY month ORDER BY month
  `, [req.session.userId, String(y)]);
  // Category breakdown
  const cats = query(`
    SELECT category, type, SUM(amount) as total
    FROM finance WHERE user_id=? AND strftime('%Y', date)=?
    GROUP BY category, type ORDER BY total DESC
  `, [req.session.userId, String(y)]);
  // Totals
  const totals = query(`
    SELECT
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
    FROM finance WHERE user_id=? AND strftime('%Y', date)=?
  `, [req.session.userId, String(y)]);
  res.json({ success: true, monthly, categories: cats, totals: totals[0], year: y });
});

router.post('/', auth, (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || !amount || !date) return res.json({ success: false, message: 'Tipe, jumlah, dan tanggal wajib diisi' });
  run(
    'INSERT INTO finance (user_id, type, amount, category, description, date) VALUES (?,?,?,?,?,?)',
    [req.session.userId, type, parseFloat(amount), category||'Lainnya', description||'', date]
  );
  const rows = query('SELECT * FROM finance WHERE user_id=? ORDER BY created_at DESC LIMIT 1', [req.session.userId]);
  res.json({ success: true, transaction: rows[0] });
});

router.delete('/:id', auth, (req, res) => {
  run('DELETE FROM finance WHERE id=? AND user_id=?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;