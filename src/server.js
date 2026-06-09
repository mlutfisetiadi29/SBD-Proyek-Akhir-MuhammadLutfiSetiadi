const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');
const { getFacilities } = require('./facility');
const { requireAuth, requireAdmin, errorHandler } = require('./middleware');

// FIX: Pastikan kelima fungsi ini di-import secara lengkap agar tidak undefined!
const { 
    createBooking, 
    getMyBookings, 
    updateBookingStatus, 
    cancelBooking, 
    getAllBookingsForAdmin 
} = require('./booking');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== GLOBAL MIDDLEWARE ====================
app.use(express.json());
app.use(express.static('public')); // Melayani file frontend (HTML, CSS, JS) di folder public

// Jalankan Seeding Data Dummy setelah koneksi database stabil
setTimeout(seedFacilities, 2000);

// ==================== ENDPOINT API (ROUTES) ====================

app.get('/', (req, res) => res.json({ message: "Sistem API FacilRent Kelompok SBD Berjalan Sempurna! 🚀" }));

// Auth Route
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// Facilities Route
app.get('/api/facilities', requireAuth, getFacilities);

// Bookings Route (Mahasiswa)
app.post('/api/bookings', requireAuth, createBooking);
app.get('/api/bookings/my', requireAuth, getMyBookings);
app.delete('/api/bookings/:id', requireAuth, cancelBooking);

// Admin Operations Route
app.get('/api/admin/bookings', requireAuth, requireAdmin, getAllBookingsForAdmin);
app.patch('/api/admin/bookings/status', requireAuth, requireAdmin, updateBookingStatus);

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(errorHandler);

// ==================== GRACEFUL SHUTDOWN ====================
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