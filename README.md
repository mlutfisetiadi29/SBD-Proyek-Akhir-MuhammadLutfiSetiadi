# 🏛️ FacilRent - Sistem Peminjaman Fasilitas Lab Kampus

Muhammad Lutfi Setiadi - 2206059805

---

## 🚀 Fitur Utama & Arsitektur Backend (Technical Specifications)
* **Relational DBMS (PostgreSQL):** Penyimpanan persisten data user, log peminjaman, dan spesifikasi laboratorium sesuai dengan `export.sql`.
* **In-Memory Cache (Redis):** Manajemen session token terdistribusi berkecepatan tinggi dengan masa kadaluwarsa otomatis (TTL) untuk mengamankan route.
* **Automated Data Seeding:** Otomatisasi pengisian data laboratorium saat server diinisialisasi agar database tidak kosong.
* **Secure Authentication:** Mekanisme hashing password searah menggunakan algoritma `Bcrypt` standar industri.
* **Overlap Schedule Validation:** Algoritma pencegah bentrokan reservasi jam peminjaman di laboratorium yang sama pada waktu yang sama.
* **Graceful Shutdown:** Mekanisme pemutusan koneksi *pool* database secara bersih saat server menerima sinyal terminasi (`SIGINT` / Ctrl+C).

## 🌐 Dokumentasi Endpoint API
Seluruh pengujian request telah diotomatisasi pada berkas root `test.http` menggunakan ekstensi VS Code REST Client. Lu tinggal pencet **Send Request** di file tersebut.

| Metode | Endpoint | Proteksi | Deskripsi |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Umum | Registrasi mahasiswa baru menggunakan email `@ui.ac.id` + Hashing Bcrypt |
| **POST** | `/api/auth/login` | Umum | Autentikasi user & pembuatan session token di Redis Cache |
| **GET** | `/api/facilities` | Mahasiswa/Admin | Menampilkan seluruh inventaris lab beserta status ketersediaan |
| **POST** | `/api/bookings` | Mahasiswa | Mengajukan reservasi waktu pinjam lab komputer (Anti-Bentrok) |
| **GET** | `/api/bookings/my` | Mahasiswa | Melihat riwayat reservasi personal mahasiswa yang aktif |
| **DELETE** | `/api/bookings/:id` | Mahasiswa | Membatalkan pengajuan reservasi milik sendiri |
| **GET** | `/api/admin/bookings` | Khusus Admin | Dashboard pemantauan seluruh antrean reservasi mahasiswa |
| **PATCH** | `/api/admin/bookings/status` | Khusus Admin | Mengubah status menjadi `Approved` / `Rejected` & auto-update status lab |