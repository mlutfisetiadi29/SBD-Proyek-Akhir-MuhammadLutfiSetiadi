const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'facilrent_db',
    password: 'admin123',
    port: 5432,
});

// Fungsi untuk membuat tabel otomatis dari berkas export.sql
const initializeDatabase = async () => {
    try {
        const sqlPath = path.join(__dirname, '../database/export.sql');
        const sqlQuery = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sqlQuery);
        console.log('Struktur tabel PostgreSQL berhasil diinisialisasi! 🗄️');
    } catch (err) {
        console.error('Gagal menginisialisasi tabel:', err.message);
    }
};

// Tes koneksi database dan jalankan inisialisasi tabel
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Gagal koneksi ke PostgreSQL:', err.stack);
    }
    console.log('Koneksi ke PostgreSQL Berhasil dan Aman! 🚀');
    release();
    initializeDatabase(); // Jalankan pembuatan tabel otomatis
});

module.exports = pool;