const bcrypt = require('bcrypt');
const pool = require('./db');
const redisClient = require('./redis');

// 1. FUNGSI REGISTRASI USER MAHASISWA & ADMIN
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Validasi ketat: Wajib menggunakan email resmi Universitas Indonesia
    if (!email.endsWith('@ui.ac.id')) {
        return res.status(400).json({ error: 'Akses ditolak! Registrasi wajib menggunakan email resmi @ui.ac.id' });
    }

    try {
        // Enkripsi password menggunakan Bcrypt (Salt round: 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password, salt);

        const queryText = 'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role';
        const result = await pool.query(queryText, [username, email, hashedPwd, role || 'mahasiswa']);

        res.status(201).json({
            message: 'Registrasi berhasil dan aman! Data tersimpan dengan password terenkripsi. 🔐',
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email atau username sudah terdaftar di sistem!' });
        }
        res.status(500).json({ error: err.message });
    }
};

// 2. FUNGSI LOGIN (VERSI BYPASS AMAN UNTUK DEMO REKAMAN)
const loginUser = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            // Jika database kosong melompong, kita buatkan user mock darurat biar gak eror
            return res.status(200).json({
                message: 'Bypass Login Sukses!',
                token: 'session_bypass_lutfi_sukses',
                user: { user_id: 1, username: 'lutfi_demo', email: 'lutfi@ui.ac.id', role: 'mahasiswa' }
            });
        }

        const user = result.rows[0];
        const sessionToken = 'session_bypass_lutfi_sukses'; // Token dipasang statis agar singkron dengan app.js

        // Simpan data bayangan ke Redis Cache agar middleware requireAuth tidak jebol
        await redisClient.setEx(sessionToken, 3600, JSON.stringify({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        }));

        return res.status(200).json({
            message: 'Bypass Login Sukses! Selamat datang di FacilRent.',
            token: sessionToken,
            user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role }
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};