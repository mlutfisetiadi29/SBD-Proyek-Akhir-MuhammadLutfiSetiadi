const pool = require('./db');

const getFacilities = async (req, res) => {
    try {
        // Ambil data fasilitas langsung tanpa sorting kolom id yang spesifik
        const result = await pool.query('SELECT * FROM facilities');
        
        res.status(200).json({
            message: 'Daftar fasilitas kampus berhasil diambil!',
            accessedBy: req.user, // Info user dari session Redis
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFacilities };