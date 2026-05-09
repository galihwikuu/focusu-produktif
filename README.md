# FocusU— Aplikasi Produktivitas

Aplikasi manajemen tugas berbasis Node.js dengan sistem login dan database SQLite.

## Fitur
- ✅ Sistem Login & Registrasi (password di-hash dengan bcryptjs)
- ✅ Database SQLite (via sql.js, tanpa instalasi tambahan)
- ✅ Tambah, edit, hapus tugas
- ✅ Filter berdasarkan status dan prioritas
- ✅ Dashboard statistik tugas
- ✅ Tenggat waktu & penanda terlambat
- ✅ Session-based authentication

## Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan server
```bash
npm start
# atau
node server.js
```

### 3. Buka di browser
```
http://localhost:3000
```

## Struktur Project
```
taskapp/
├── server.js          # Entry point Express
├── db.js              # Database module (sql.js)
├── routes/
│   ├── auth.js        # Login, Register, Logout
│   └── tasks.js       # CRUD Tugas
└── public/
    └── index.html     # Frontend SPA
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Daftar akun baru
- `POST /api/auth/login`    — Masuk
- `POST /api/auth/logout`   — Keluar
- `GET  /api/auth/me`       — Cek sesi aktif

### Tasks (memerlukan login)
- `GET    /api/tasks`       — Ambil semua tugas
- `POST   /api/tasks`       — Buat tugas baru
- `PUT    /api/tasks/:id`   — Update tugas
- `DELETE /api/tasks/:id`   — Hapus tugas
- `GET    /api/tasks/stats` — Statistik tugas
