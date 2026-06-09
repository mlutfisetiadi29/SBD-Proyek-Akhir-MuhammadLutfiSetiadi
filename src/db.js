const { Pool } = require('pg');


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'facilrent_db',
    password: 'admin123',
    port: 5432,
});


pool.connect((err, client, release) => {
    if (err) {
        return console.error('Gagal koneksi ke PostgreSQL:', err.stack);
    }
    console.log('Koneksi ke PostgreSQL Berhasil dan Aman! 🚀');
    release();
});

module.exports = pool;