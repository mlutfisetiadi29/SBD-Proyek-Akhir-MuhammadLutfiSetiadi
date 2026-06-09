const redisClient = require('./redis');

const requireAuth = (req, res, next) => {
    // Ambil token dari header request (biasanya dikirim lewat Authorization header)
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Akses ditolak! Lu harus login terlebih dahulu.' });
    }

    // Format header biasanya: "Bearer session_xxx", kita ambil tokennya saja
    const token = authHeader.split(' ')[1] || authHeader;

    // Cek apakah token tersebut ada di Redis
    redisClient.get(token, (err, reply) => {
        if (err || !reply) {
            return res.status(401).json({ error: 'Session lu gak valid atau udah kedaluwarsa. Silahkan login ulang!' });
        }

        // Jika ada, simpan data user dari session ke dalam request object (req.user)
        req.user = JSON.parse(reply);
        next(); // Lanjut ke fungsi berikutnya
    });
};

module.exports = { requireAuth };