const pool = require('./db');

// 1. FUNGSI MEMBUAT BOOKING (DENGAN VALIDASI TABRAKAN JADWAL)
const createBooking = async (req, res) => {
    const { user_id } = req.user; 
    const { facility_id, tanggal_pinjam, jam_mulai, jam_selesai } = req.body;

    try {
        const facilityCheck = await pool.query('SELECT * FROM facilities WHERE facility_id = $1', [facility_id]);
        if (facilityCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Fasilitas laboratorium tidak ditemukan!' });
        }
        if (!facilityCheck.rows[0].status_ketersediaan) {
            return res.status(400).json({ error: 'Maaf, laboratorium ini sedang penuh atau ditutup.' });
        }

        const conflictCheckQuery = `
            SELECT * FROM bookings 
            WHERE facility_id = $1 
              AND tanggal_pinjam = $2 
              AND status_persetujuan != 'Rejected'
              AND (
                (jam_mulai <= $3 AND jam_selesai > $3) OR
                (jam_mulai < $4 AND jam_selesai >= $4) OR
                (jam_mulai >= $3 AND jam_selesai <= $4)
              )
        `;
        const conflictResult = await pool.query(conflictCheckQuery, [facility_id, tanggal_pinjam, jam_mulai, jam_selesai]);

        if (conflictResult.rows.length > 0) {
            return res.status(409).json({ 
                error: 'Jadwal tabrakan! Jam tersebut sudah di-booking oleh mahasiswa lain pada tanggal ini.',
                konflik: conflictResult.rows
            });
        }

        const insertQuery = `
            INSERT INTO bookings (user_id, facility_id, tanggal_pinjam, jam_mulai, jam_selesai, status_persetujuan) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const newBooking = await pool.query(insertQuery, [user_id, facility_id, tanggal_pinjam, jam_mulai, jam_selesai, 'Pending']);

        res.status(201).json({
            message: 'Booking fasilitas berhasil diajukan! Jadwal divalidasi dan aman dari bentrokan. 📝',
            bookingData: newBooking.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. FUNGSI LIHAT RIWAYAT USER MAHASISWA
const getMyBookings = async (req, res) => {
    const { user_id } = req.user;
    try {
        const queryText = `
            SELECT b.booking_id, f.nama_fasilitas, b.tanggal_pinjam, b.jam_mulai, b.jam_selesai, b.status_persetujuan, b.created_at
            FROM bookings b
            JOIN facilities f ON b.facility_id = f.facility_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await pool.query(queryText, [user_id]);
        res.status(200).json({ message: 'Riwayat booking lu berhasil diambil!', total_booking: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. FUNGSI ADMIN: APPROVE / REJECT BOOKING (DENGAN SINKRONISASI OTOMATIS)
const updateBookingStatus = async (req, res) => {
    const { booking_id, status } = req.body;

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak! Lu bukan admin.' });
    }

    try {
        const updateQuery = 'UPDATE bookings SET status_persetujuan = $1 WHERE booking_id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [status, booking_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Data booking tidak ditemukan!' });
        }

        const updatedBooking = result.rows[0];

        if (status === 'Approved') {
            await pool.query('UPDATE facilities SET status_ketersediaan = false WHERE facility_id = $1', [updatedBooking.facility_id]);
        } else if (status === 'Rejected') {
            await pool.query('UPDATE facilities SET status_ketersediaan = true WHERE facility_id = $1', [updatedBooking.facility_id]);
        }

        res.status(200).json({
            message: `Status booking ID ${booking_id} berhasil diubah menjadi ${status} & ketersediaan laboratorium diperbarui! 🛠️`,
            updatedData: updatedBooking
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. FUNGSI MAHASISWA: BATALKAN BOOKING SENDIRI
const cancelBooking = async (req, res) => {
    const { user_id } = req.user;
    const { id } = req.params;

    try {
        const checkOwner = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [id]);
        
        if (checkOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Data booking tidak ditemukan!' });
        }
        
        if (checkOwner.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: 'Akses ilegal! Lu gak bisa ngehapus booking-an orang lain.' });
        }

        await pool.query('DELETE FROM bookings WHERE booking_id = $1', [id]);
        res.status(200).json({ message: `Booking ID ${id} berhasil dibatalkan dan dihapus dari sistem! 🗑️` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. FUNGSI ADMIN: LIHAT SEMUA DATA RESERVASI
const getAllBookingsForAdmin = async (req, res) => {
    try {
        const queryText = `
            SELECT b.booking_id, u.username, u.email, f.nama_fasilitas, b.tanggal_pinjam, b.jam_mulai, b.jam_selesai, b.status_persetujuan
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN facilities f ON b.facility_id = f.facility_id
            ORDER BY b.tanggal_pinjam DESC, b.jam_mulai DESC
        `;
        const result = await pool.query(queryText);
        res.status(200).json({ message: 'Seluruh antrean booking berhasil dimuat, Min!', total: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PASTIKAN SEMUA DI-EXPORT DENGAN BENAR DI SINI
module.exports = { 
    createBooking, 
    getMyBookings, 
    updateBookingStatus, 
    cancelBooking, 
    getAllBookingsForAdmin 
};