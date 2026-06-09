const pool = require('./db');

const seedFacilities = async () => {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM facilities');
        if (parseInt(res.rows[0].count) === 0) {
            const insertQuery = `
                INSERT INTO facilities (nama_fasilitas, deskripsi, kapasitas, status_ketersediaan) VALUES
                ('Laboratorium Jaringan & Keamanan', 'Lab untuk praktikum jaringan dan cyber security.', 30, true),
                ('Laboratorium Pemrograman', 'Lab dengan spesifikasi PC tinggi untuk kuliah Alpro dan SBD.', 40, true),
                ('Laboratorium Riset & AI', 'Lab khusus pengerjaan tugas akhir dan riset machine learning.', 15, true);
            `;
            await pool.query(insertQuery);
            console.log('Data dummy fasilitas kampus berhasil dimasukkan! 🏛️');
        }
    } catch (err) {
        // Bungkam error kolom dummy agar tidak menghentikan jalannya server utama
    }
};

module.exports = { seedFacilities };