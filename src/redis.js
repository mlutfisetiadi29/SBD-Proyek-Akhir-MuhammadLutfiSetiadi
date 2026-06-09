const redis = require('redis');

// Membuat client Redis lokal
const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Gagal koneksi ke Redis Client:', err));
redisClient.on('connect', () => console.log('Koneksi ke Redis Berhasil dan Aman! ⚡'));

// Menghubungkan ke Redis server
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Pastikan aplikasi Redis Stack / Redis Server sudah menyala di laptop lu!');
    }
})();

module.exports = redisClient;