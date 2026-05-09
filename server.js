const cors = require('cors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { getDb } = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'taskapp-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/deadlines', require('./routes/deadlines'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/admin', require('./routes/admin'));


app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`\n🚀 TaskFlow berjalan di http://localhost:${PORT}`);
    console.log('🔑 Admin: admin / admin123\n');
  });
}

start();