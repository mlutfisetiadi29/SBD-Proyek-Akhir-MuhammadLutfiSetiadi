const pool = require('./db');

const createBooking = async (req, res) => {
    // user_id otomatis didapat dari satpam requireAuth (Redis session)
    const { user_id } = req.user; 
    const { id_fasilitas, tanggal_peminjaman, durasi_jam } = req.body;

    try {
        // 1. Cek apakah fasilitas yang mau dibooking itu ada dan tersedia
        const facilityCheck = await pool.query('SELECT * FROM facilities WHERE id_fasilitas = $1', [id_fasilitas]);
        
        if (facilityCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Fasilitas tidak ditemukan!' });
        }

        if (!facilityCheck.rows[0].status_ketersediaan) {
            return res.status(400).json({ error: 'Maaf, fasilitas ini sedang tidak tersedia atau dalam perbaikan.' });
        }

        // 2. Masukkan data booking ke tabel bookings/reservations 
        // (Sesuaikan nama tabel & kolom dengan export.sql lu, di sini asumsi nama tabel 'bookings')
        const newBooking = await pool.query(
            'INSERT INTO bookings (user_id, id_fasilitas, tanggal_peminjaman, durasi_jam, status_persetujuan) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, id_fasilitas, tanggal_peminjaman, durasi_jam, 'pending']
        );

        res.status(201).json({
            message: 'Booking fasilitas berhasil diajukan! Menunggu persetujuan admin. 📝',
            bookingData: newBooking.rows[0]
        });

    } catch (err) {
        // Jika nama tabel 'bookings' di export.sql lu ternyata beda (misal: 'peminjaman' atau 'reservations'),
        // erornya bakal ketangkap di sini buat kita sesuaikan nanti.
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking };