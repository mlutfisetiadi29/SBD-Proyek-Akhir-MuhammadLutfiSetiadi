# Skenario Database dan Aplikasi - FacilRent

## 1. Skenario Aplikasi
Aplikasi **FacilRent** adalah platform berbasis web/smartphone yang digunakan oleh mahasiswa FTUI untuk melakukan peminjaman fasilitas atau ruangan laboratorium secara mandiri. 

* **Proses Registrasi & Login:** Mahasiswa membuat akun dan melakukan login ke dalam sistem. Data session login pengguna akan disimpan di **Redis** sebagai database pendukung agar proses autentikasi lebih cepat (mengoptimalkan performa aplikasi).
* **Melihat Fasilitas:** Setelah masuk, pengguna dapat melihat daftar laboratorium atau fasilitas yang tersedia beserta kapasitas dan status ketersediaannya.
* **Melakukan Peminjaman:** Pengguna memilih fasilitas yang ingin dipinjam, menentukan tanggal, jam mulai, dan jam selesai. Sistem akan memvalidasi jadwal agar tidak terjadi bentrok. Jika aman, data peminjaman disimpan dengan status 'Pending' menunggu persetujuan aslab.

## 2. Alur Data pada Tabel (Minimal 3 Tabel)
Sistem ini mengelola basis data menggunakan **PostgreSQL** yang terdiri dari 3 tabel utama yang saling berelasi:
1. **users**: Menyimpan informasi akun mahasiswa (peminjam).
2. **facilities**: Menyimpan daftar laboratorium atau alat yang bisa dipinjam.
3. **bookings**: Tabel transaksi yang menghubungkan `users` dan `facilities` (Relasi Many-to-Many), mencatat kapan fasilitas dipinjam dan status persetujuannya.