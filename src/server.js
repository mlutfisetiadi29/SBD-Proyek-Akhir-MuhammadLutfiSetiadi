const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');
const { getFacilities } = require('./facility');
const { requireAuth, requireAdmin, errorHandler } = require('./middleware');
const { 
    createBooking, 
    getMyBookings, 
    updateBookingStatus, 
    cancelBooking, 
    getAllBookingsForAdmin 
} = require('./booking'); // <-- Tambah import fungsi baru

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
app.delete('/api/bookings/:id', requireAuth, cancelBooking); // <-- Rute pembatalan baru!

// Admin Operations Route
app.get('/api/admin/bookings', requireAuth, requireAdmin, getAllBookingsForAdmin); // <-- Rute monitoring baru!
app.patch('/api/admin/bookings/status', requireAuth, requireAdmin, updateBookingStatus);

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(errorHandler);

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', async () => {
    console.log('\nMematikan server FacilRent secara bersih...');
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

app.listen(PORT, () => console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`));