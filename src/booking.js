const pool = require('./db');

// 1. FUNGSI MEMBUAT BOOKING (DENGAN VALIDASI TABRAKAN JADWAL)
const createBooking = async (req, res) => {
    const { user_id } = req.user; 
    const { facility_id, tanggal_pinjam, jam_mulai, jam_selesai } = req.body;

    try {
        // A. Cek keberadaan dan ketersediaan fasilitas
        const facilityCheck = await pool.query('SELECT * FROM facilities WHERE facility_id = $1', [facility_id]);
        if (facilityCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Fasilitas laboratorium tidak ditemukan!' });
        }
        if (!facilityCheck.rows[0].status_ketersediaan) {
            return res.status(400).json({ error: 'Maaf, laboratorium ini sedang penuh atau ditutup.' });
        }

        // B. LOGIKA SAKTI: Cek tabrakan jadwal (Overlap Schedule)
        // Memeriksa jika tanggal sama, lab sama, dan jamnya saling tumpang tindih
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

        // C. Jika aman, lakukan Insert
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

// 2. FUNGSI LIHAT RIWAYAT USER
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

// 3. FUNGSI ADMIN: APPROVE / REJECT BOOKING (BARU!)
const updateBookingStatus = async (req, res) => {
    const { booking_id, status } = req.body; // status bisa 'Approved' atau 'Rejected'

    // Proteksi tambahan di level fungsi
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak! Lu bukan admin.' });
    }

    try {
        const updateQuery = `
            UPDATE bookings 
            SET status_persetujuan = $1 
            WHERE booking_id = $2 
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [status, booking_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Data booking tidak ditemukan!' });
        }

        res.status(200).json({
            message: `Status booking berhasil diubah menjadi ${status}! 🛠️`,
            updatedData: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };