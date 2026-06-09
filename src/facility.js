const pool = require('./db');

const getFacilities = async (req, res) => {
    try {
        // Ambil data fasilitas diurutkan berdasarkan facility_id asli dari SQL lu
        const result = await pool.query('SELECT * FROM facilities ORDER BY facility_id ASC');
        
        res.status(200).json({
            message: 'Daftar fasilitas kampus berhasil diambil!',
            accessedBy: req.user,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFacilities };