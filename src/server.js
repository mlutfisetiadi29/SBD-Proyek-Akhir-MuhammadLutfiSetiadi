const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');
const { getFacilities } = require('./facility');
const { requireAuth } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Jalankan Seeding Data Dummy setelah koneksi database stabil
setTimeout(seedFacilities, 2000);

// ==================== ENDPOINT API (ROUTES) ====================

// 1. Tes Endpoint Utama
app.get('/', (req, res) => {
    res.json({ message: "Sistem API FacilRent Kelompok SBD Berjalan Sempurna! 🚀" });
});

// 2. Endpoint Autentikasi (Terbuka untuk Umum)
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// 3. Endpoint Fasilitas (Diproteksi - Harus Login & Bawa Token Redis)
app.get('/api/facilities', requireAuth, getFacilities);

// ===============================================================

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`);
});