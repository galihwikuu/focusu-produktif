const express = require('express');
const { query, run } = require('../db');
const router = express.Router();

const adminAuth = (req, res, next) => {
  if (!req.session.userId || req.session.userRole !== 'admin')
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  next();
};

// Statistik global
router.get('/stats', adminAuth, (req, res) => {
  const users = query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
  const tasks = query("SELECT COUNT(*) as total FROM tasks");
  const tasksDone = query("SELECT COUNT(*) as total FROM tasks WHERE status = 'done'");
  const tasksProgress = query("SELECT COUNT(*) as total FROM tasks WHERE status = 'in_progress'");
  const tasksTodo = query("SELECT COUNT(*) as total FROM tasks WHERE status = 'todo'");
  const newUsers = query("SELECT COUNT(*) as total FROM users WHERE created_at >= datetime('now', '-7 days')");
  const notes = query("SELECT COUNT(*) as total FROM notes");

  res.json({
    success: true,
    stats: {
      totalUsers: users[0].total,
      totalTasks: tasks[0].total,
      tasksDone: tasksDone[0].total,
      tasksProgress: tasksProgress[0].total,
      tasksTodo: tasksTodo[0].total,
      newUsersWeek: newUsers[0].total,
      totalNotes: notes[0].total,
    }
  });
});

// Semua user
router.get('/users', adminAuth, (req, res) => {
  const users = query(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
      COUNT(t.id) as task_count
    FROM users u
    LEFT JOIN tasks t ON t.user_id = u.id
    WHERE u.role != 'admin'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  res.json({ success: true, users });
});

// Hapus user
router.delete('/users/:id', adminAuth, (req, res) => {
  const user = query('SELECT id FROM users WHERE id = ? AND role != ?', [req.params.id, 'admin']);
  if (user.length === 0) return res.json({ success: false, message: 'User tidak ditemukan' });
  run('DELETE FROM tasks WHERE user_id = ?', [req.params.id]);
  run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Semua tugas (semua user)
router.get('/tasks', adminAuth, (req, res) => {
  const tasks = query(`
    SELECT t.*, u.name as user_name, u.email as user_email
    FROM tasks t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at DESC
  `);
  res.json({ success: true, tasks });
});

// Hapus tugas
router.delete('/tasks/:id', adminAuth, (req, res) => {
  run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;