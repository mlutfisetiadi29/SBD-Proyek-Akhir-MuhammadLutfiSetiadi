const pool = require('./db');
const redisClient = require('./redis');
const bcrypt = require('bcrypt'); // <-- Import library enkripsi
const SALT_ROUNDS = 10;

// 1. FUNGSI REGISTRASI USER (DENGAN VALIDASI & ENKRIPSI)
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // [VALIDASI INPUT] Mencegah field kosong
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, dan password wajib diisi!' });
        }

        // [VALIDASI FORMAT EMAIL] Memastikan menggunakan email UI resmi
        if (!email.endsWith('@ui.ac.id')) {
            return res.status(400).json({ error: 'Registrasi gagal! Wajib menggunakan email resmi UI (@ui.ac.id).' });
        }

        // Cek apakah email sudah terdaftar
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar!' });
        }

        // [ENKRIPSI PASSWORD] Mengacak plain-text password menjadi hash secure
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Simpan ke PostgreSQL (Gunakan kolom password_hash)
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role',
            [username, email, hashedPassword, role || 'mahasiswa']
        );

        res.status(201).json({ message: 'Registrasi berhasil dan aman!', user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. FUNGSI LOGIN USER (COMPARE CRYPTO PASSWORD)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi!' });
        }

        // Cek user di PostgreSQL
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const user = result.rows[0];

        // [VERIFIKASI PASSWORD] Membandingkan password input dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const tokenSession = `session_${user.user_id}_${Date.now()}`;

        // Simpan token session ke REDIS (Masa berlaku 1 jam)
        redisClient.setex(tokenSession, 3600, JSON.stringify({ user_id: user.user_id, role: user.role }));

        res.status(200).json({
            message: 'Login sukses! Session aman di Redis Cache.',
            token: tokenSession,
            user: { username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser };