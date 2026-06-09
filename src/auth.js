const pool = require('./db');
const redisClient = require('./redis');

// 1. FUNGSI REGISTRASI USER
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Cek apakah email sudah terdaftar
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar!' });
        }

        // Simpan ke PostgreSQL (Dalam rilis produksi, password wajib di-hash pakai bcrypt)
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, role',
            [username, email, password, role || 'mahasiswa']
        );

        res.status(201).json({ message: 'Registrasi berhasil!', user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. FUNGSI LOGIN USER
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Cek user di PostgreSQL
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0 || result.rows[0].password_hash !== password) {
            return res.status(401).json({ error: 'Email atau password salah!' });
        }

        const user = result.rows[0];
        const tokenSession = `session_${user.user_id}_${Date.now()}`;

        // Simpan token session ke REDIS (Batas waktu 1 jam / 3600 detik)
        await redisClient.set(tokenSession, JSON.stringify({ user_id: user.user_id, role: user.role }), {
            EX: 3600
        });

        res.status(200).json({
            message: 'Login sukses! Session disimpan di Redis.',
            token: tokenSession,
            user: { username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser };