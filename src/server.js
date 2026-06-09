const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware agar server bisa membaca input JSON dari user
app.use(express.json());

// Route Testing Utama
app.get('/', (req, res) => {
    res.json({
        message: "Selamat datang di API FacilRent - Sistem Peminjaman Fasilitas Kampus!"
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server FacilRent berjalan lancar di http://localhost:${PORT}`);
});