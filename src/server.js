const express = require('express');
const pool = require('./db');
const redisClient = require('./redis');
const { seedFacilities } = require('./seed');
const { registerUser, loginUser } = require('./auth');
const { getFacilities } = require('./facility');
const { requireAuth, requireAdmin } = require('./middleware'); // <-- Import requireAdmin
const { createBooking, getMyBookings, updateBookingStatus } = require('./booking'); // <-- Import updateBookingStatus

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

setTimeout(seedFacilities, 2000);

// ==================== ENDPOINT API (ROUTES) ====================

app.get('/', (req, res) => res.json({ message: "Sistem API FacilRent Kelompok SBD Berjalan Sempurna! 🚀" }));

// Auth
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// Facilities (Mahasiswa & Admin)
app.get('/api/facilities', requireAuth, getFacilities);

// Bookings (Mahasiswa & Admin)
app.post('/api/bookings', requireAuth, createBooking);
app.get('/api/bookings/my', requireAuth, getMyBookings);

// Admin Operations (Diproteksi Ganda: Harus Login & Harus Admin!)
app.patch('/api/admin/bookings/status', requireAuth, requireAdmin, updateBookingStatus);

// ===============================================================

app.listen(PORT, () => console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`));