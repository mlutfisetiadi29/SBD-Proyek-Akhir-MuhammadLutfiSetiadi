const redisClient = require('./redis');

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Akses ditolak! Lu harus login.' });

    const token = authHeader.split(' ')[1] || authHeader;

    redisClient.get(token, (err, reply) => {
        if (err || !reply) return res.status(401).json({ error: 'Session tidak valid atau kedaluwarsa.' });

        req.user = JSON.parse(reply);
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ilegal! Endpoint ini khusus untuk Admin FacilRent.' });
    }
    next();
};

// Satpam Penangkap Eror Global (BARU!)
const errorHandler = (err, req, res, next) => {
    console.error('❌ Terjadi Eror Sistem:', err.stack);
    res.status(500).json({
        error: 'Terjadi kegagalan internal pada server FacilRent!',
        details: err.message
    });
};

module.exports = { requireAuth, requireAdmin, errorHandler };