const pool = require('./db');

const seedFacilities = async () => {
    try {
        // Cek apakah tabel facilities sudah ada datanya
        const res = await pool.query('SELECT COUNT(*) FROM facilities');
        if (parseInt(res.rows[0].count) === 0) {
            const insertQuery = `
                INSERT INTO facilities (nama_fasilitas, deskripsi, kapasitas, status_ketersediaan) VALUES
                ('Laboratorium Jaringan & Keamanan', 'Lab untuk praktikum jaringan, Cisco, dan cyber security.', 30, true),
                ('Laboratorium Pemrograman', 'Lab dengan spesifikasi PC tinggi untuk kuliah Alpro, SDA, dan SBD.', 40, true),
                ('Laboratorium Riset & AI', 'Lab khusus pengerjaan tugas akhir, riset machine learning, dan IoT.', 15, true);
            `;
            await pool.query(insertQuery);
            console.log('Data dummy fasilitas kampus berhasil dimasukkan! 🏛️');
        }
    } catch (err) {
        console.error('Gagal memasukkan data dummy:', err.message);
    }
};

module.exports = { seedFacilities };