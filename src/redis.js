const redis = require('redis');

// Membuat client Redis (Sintaks simpel khusus versi kompatibel)
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

redisClient.on('connect', () => {
    console.log('Koneksi ke Redis Berhasil dan Aman');
});

// Di versi ini, kita pakai perintah .connect() lama jika library mendeteksi v4+, 
// tapi kalau v3 dia otomatis langsung tersambung via createClient.
if (typeof redisClient.connect === 'function') {
    redisClient.connect().catch(() => {});
}

module.exports = redisClient;