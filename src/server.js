const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');
const { getFacilities } = require('./facility');
const { requireAuth, requireAdmin, errorHandler } = require('./middleware'); // <-- Tambah errorHandler
const { createBooking, getMyBookings, updateBookingStatus } = require('./booking');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

setTimeout(seedFacilities, 2000);

// ==================== ENDPOINT API (ROUTES) ====================

app.get('/', (req, res) => res.json({ message: "Sistem API FacilRent Kelompok SBD Berjalan Sempurna! 🚀" }));

// Auth
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// Facilities
app.get('/api/facilities', requireAuth, getFacilities);

// Bookings
app.post('/api/bookings', requireAuth, createBooking);
app.get('/api/bookings/my', requireAuth, getMyBookings);

// Admin Operations
app.patch('/api/admin/bookings/status', requireAuth, requireAdmin, updateBookingStatus);

// ==================== ERROR HANDLING MIDDLEWARE ====================
// Wajib ditaruh di paling bawah setelah semua route didefinisikan
app.use(errorHandler);

// ==================== GRACEFUL SHUTDOWN ====================
// Otomatis memutuskan koneksi DB dengan rapi pas lu pencet Ctrl + C
process.on('SIGINT', async () => {
    console.log('\n Mematikan server FacilRent secara bersih...');
    try {
        await pool.end();
        console.log('Koneksi PostgreSQL berhasil diputus.');
        redisClient.quit();
        console.log('Koneksi Redis berhasil diputus.');
        console.log('Sampai jumpa! Server resmi offline.');
        process.exit(0);
    } catch (err) {
        console.error('Eror pas matiin database:', err);
        process.exit(1);
    }
});

// Jalankan Server
app.listen(PORT, () => console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`));