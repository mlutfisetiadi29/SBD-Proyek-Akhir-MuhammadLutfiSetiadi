// 3. FUNGSI ADMIN: APPROVE / REJECT BOOKING (DENGAN SINKRONISASI OTOMATIS)
const updateBookingStatus = async (req, res) => {
    const { booking_id, status } = req.body; // status bisa 'Approved' atau 'Rejected'

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak! Lu bukan admin.' });
    }

    try {
        // A. Update status persetujuan booking
        const updateQuery = 'UPDATE bookings SET status_persetujuan = $1 WHERE booking_id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [status, booking_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Data booking tidak ditemukan!' });
        }

        const updatedBooking = result.rows[0];

        // B. LOGIKA SAKTI: Sinkronisasi Status Lab ke tabel 'facilities'
        if (status === 'Approved') {
            // Jika disetujui, kunci lab tersebut (status_ketersediaan = false)
            await pool.query('UPDATE facilities SET status_ketersediaan = false WHERE facility_id = $1', [updatedBooking.facility_id]);
        } else if (status === 'Rejected') {
            // Jika ditolak, pastikan lab tersebut tetap terbuka (status_ketersediaan = true)
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