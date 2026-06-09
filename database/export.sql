-- Berkas: export.sql
-- Implementasi Sistem Basis Data PostgreSQL

-- 1. Tabel Pengguna (Users)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'mahasiswa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Fasilitas (Facilities)
CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    nama_fasilitas VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    kapasitas INT NOT NULL,
    status_ketersediaan BOOLEAN DEFAULT TRUE
);

-- 3. Tabel Peminjaman (Bookings)
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    facility_id INT REFERENCES facilities(facility_id) ON DELETE CASCADE,
    tanggal_pinjam DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    status_persetujuan VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);