const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware agar Express bisa membaca data JSON dari POST request
app.use(express.json());

// Jalankan Seeding Data Dummy saat database PostgreSQL siap
pool.on('connect', () => {
    // Berikan jeda 1 detik agar tabel otomatis terbuat dulu di db.js
    setTimeout(seedFacilities, 1000);
});

// ==================== ENDPOINT API (ROUTES) ====================

// 1. Endpoint Test Utama
app.get('/', (req, res) => {
    res.json({ message: "Sistem API FacilRent Berjalan Sempurna!" });
});

// 2. Endpoint Registrasi Mahasiswa
app.post('/api/auth/register', registerUser);

// 3. Endpoint Login Mahasiswa
app.post('/api/auth/login', loginUser);

// ===============================================================

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`);
});