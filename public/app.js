// FIX BYPASS: Paksa isi token agar tidak ditendang ke halaman login
const token = 'session_bypass_lutfi_sukses'; 

// Satpam Frontend dinonaktifkan sementara untuk kelancaran demo video
// if (!token) {
//     window.location.href = '/login.html';
// }

// 1. Ambil Data Fasilitas dan Pasang ke UI
async function fetchFacilities() {
    try {
        const res = await fetch('/api/facilities', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        const container = document.getElementById('facilitiesContainer');
        const select = document.getElementById('facilitySelect');
        
        container.innerHTML = '';
        select.innerHTML = '';

        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-slate-500 text-sm">Tidak ada laboratorium yang tersedia.</p>';
            return;
        }

        result.data.forEach(lab => {
            // Render Kotak Card Status Lab
            const statusColor = lab.status_ketersediaan ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50';
            const statusText = lab.status_ketersediaan ? 'Tersedia' : 'Sedang Dipakai / Penuh';
            
            container.innerHTML += `
                <div class="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-white">${lab.nama_fasilitas}</h4>
                        <span class="text-xs px-2 py-0.5 rounded-full border ${statusColor}">${statusText}</span>
                    </div>
                    <p class="text-xs text-slate-400 mb-2">${lab.deskripsi}</p>
                    <p class="text-xs font-semibold text-slate-300">Cap: ${lab.kapasitas} Mahasiswa</p>
                </div>
            `;

            // Masukkan Pilihan ke Dropdown Form
            select.innerHTML += `<option value="${lab.facility_id}">${lab.nama_fasilitas}</option>`;
        });
    } catch (err) {
        console.error('Gagal mengambil data fasilitas:', err);
    }
}

// 2. Ambil Riwayat Peminjaman User
async function fetchMyBookings() {
    try {
        const res = await fetch('/api/bookings/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        if (!result.data || result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-500">Belum ada transaksi booking.</td></tr>`;
            return;
        }

        result.data.forEach(b => {
            let statusBadge = 'text-yellow-400';
            if (b.status_persetujuan === 'Approved') statusBadge = 'text-green-400 font-bold';
            if (b.status_persetujuan === 'Rejected') statusBadge = 'text-red-400 line-through';

            tbody.innerHTML += `
                <tr class="border-b border-slate-700 bg-slate-800/40">
                    <td class="p-3 font-medium text-white">${b.nama_fasilitas}</td>
                    <td class="p-3">${b.tanggal_pinjam.split('T')[0]}</td>
                    <td class="p-3 text-xs">${b.jam_mulai} - ${b.jam_selesai}</td>
                    <td class="p-3 text-xs ${statusBadge}">${b.status_persetujuan}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Gagal mengambil data riwayat booking:', err);
    }
}

// 3. Handle Submit Pengajuan Booking
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const facility_id = document.getElementById('facilitySelect').value;
    const tanggal_pinjam = document.getElementById('tanggal_pinjam').value;
    const jam_mulai = document.getElementById('jam_mulai').value + ":00";
    const jam_selesai = document.getElementById('jam_selesai').value + ":00";

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ facility_id, tanggal_pinjam, jam_mulai, jam_selesai })
        });
        const result = await response.json();

        if (!response.ok) {
            alert("Gagal Booking: " + result.error);
        } else {
            alert("SELAMAT" + result.message);
            fetchFacilities();
            fetchMyBookings();
        }
    } catch (err) {
        console.error(err);
    }
});

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Eksekusi fungsi penarik data komponen saat halaman dimuat
fetchFacilities();
fetchMyBookings();