# 📖 Admin Dashboard - User Guide

## Akses Dashboard

### 1. Login sebagai Admin
1. Pastikan akun Anda di Google Sheets memiliki kolom `role` = `admin`
2. Buka `http://localhost:3001/login`
3. Login dengan credentials Anda

### 2. Navigasi ke Dashboard
Setelah login, ada 2 cara:
- **Klik link "ADMIN DASHBOARD"** di header (warna emas)
- **Akses langsung**: `http://localhost:3001/admin`

## Menggunakan Dashboard

### Statistics Overview (Atas)
Dashboard menampilkan 6 kartu statistik:

📊 **Total Users** - Jumlah semua member terdaftar  
📅 **Total Bookings** - Jumlah booking (confirmed + completed)  
💪 **Total Classes** - Jumlah tipe kelas tersedia  
💰 **Total Transactions** - Jumlah transaksi pembayaran  
📆 **Total Schedules** - Jumlah jadwal kelas  
👨‍🏫 **Total Trainers** - Jumlah instruktur  

### Data Tables (Bawah)

#### 📋 Users Tab
Menampilkan semua member dengan informasi:
- ID, Name, Email, Phone
- Membership Type & Status
- Total Credits
- Gender, Registration Date

**Color Codes:**
- 🟢 **Green Badge** = Active member
- 🔴 **Red Badge** = Inactive member

#### 📋 Bookings Tab
Menampilkan semua booking:
- Booking ID, Schedule ID, User ID
- Booking Time
- Status (Confirmed/Completed/Cancelled)
- Attendance status
- Payment status
- Credits used

**Color Codes:**
- 🟢 **Green** = Completed / Paid
- 🔵 **Blue** = Confirmed
- 🔴 **Red** = Cancelled
- 🟡 **Yellow** = Pending payment

#### 📋 Classes Tab
Menampilkan tipe kelas:
- Class ID, Name
- Duration, Capacity
- Price, Credits Required
- Description

#### 📋 Transactions Tab
Menampilkan riwayat transaksi:
- Transaction ID, User ID
- Transaction Time
- Amount (Rupiah)
- Credits Purchased
- Payment Method
- Invoice Number

#### 📋 Schedules Tab
Menampilkan jadwal kelas:
- Schedule ID, Time
- Trainer ID, Class ID
- Members (list)
- Gender Restriction
- Status, Notes

#### 📋 Trainers Tab
Menampilkan data instruktur:
- Trainer ID, Name
- Email, Phone
- Specialization
- Bio, Status
- Joined Date

## Fitur Table

### 🔍 Search
1. Ketik keyword di search box (kanan atas table)
2. Table akan auto-filter sesuai keyword
3. Search bekerja di semua kolom

**Contoh:**
- Cari nama: `Stella`
- Cari email: `@example.com`
- Cari status: `Active`

### 🔢 Sort (Urut)
1. Klik header kolom untuk sort
2. Klik sekali = Ascending (A→Z, 0→9)
3. Klik lagi = Descending (Z→A, 9→0)
4. Klik ketiga kali = Reset

**Tips:** Default sort by ID descending (newest first)

### 📄 Pagination
1. Pilih jumlah entries per page: `10 / 25 / 50 / 100`
2. Gunakan tombol `Previous` / `Next`
3. Atau klik nomor page langsung: `1, 2, 3...`

### 📋 Tab Navigation
Klik tab untuk switch antara data:
- **Users** → Bookings → Classes → Transactions → Schedules → Trainers

## Tips & Tricks

### 💡 Mencari Data Spesifik

**Mencari user dengan nama tertentu:**
1. Buka tab "Users"
2. Ketik nama di search box
3. Result langsung tampil

**Mencari booking user tertentu:**
1. Buka tab "Bookings"
2. Ketik User ID di search box
3. Atau ketik tanggal booking

**Melihat transaksi bulan tertentu:**
1. Buka tab "Transactions"
2. Search dengan format bulan: `2025-12` atau `December`

### 💡 Export Data (Manual)
Untuk export data:
1. Search data yang ingin di-export
2. Copy dari table
3. Paste ke Excel/Google Sheets

**atau**

Akses langsung Google Sheets untuk export:
- File → Download → Excel/CSV

### 💡 Monitoring Real-time
Dashboard membaca data langsung dari Google Sheets:
1. Update data di Google Sheets
2. Refresh dashboard (F5)
3. Data terbaru langsung tampil

### 💡 Filter by Status
Untuk filter berdasarkan status:
1. Ketik status di search: `Active`, `Completed`, `Paid`
2. Table akan show hanya data dengan status tersebut

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Focus search box |
| `F5` | Refresh data |
| `Tab` | Navigate between tabs |
| `↑` `↓` | Navigate table rows |

## Understanding the Data

### User Status
- **Active** - Member aktif, bisa booking
- **Inactive** - Member tidak aktif, tidak bisa booking

### Booking Status
- **Confirmed** - Booking dikonfirmasi, belum selesai
- **Completed** - Kelas sudah selesai
- **Cancelled** - Booking dibatalkan

### Payment Status
- **Paid** - Sudah dibayar
- **Pending** - Belum dibayar / menunggu konfirmasi

### Membership Type
- **Regular** - Member reguler
- **Premium** - Member premium dengan benefit lebih

## Troubleshooting

### Dashboard kosong / tidak ada data
**Penyebab:** API error atau Google Sheets tidak accessible

**Solusi:**
1. Check browser console (F12) untuk error
2. Verify Google Sheets permissions
3. Refresh page (F5)

### Search tidak bekerja
**Solusi:**
1. Clear search box
2. Wait for table to fully load
3. Try again

### Table loading lama
**Penyebab:** Data banyak atau koneksi lambat

**Solusi:**
1. Wait for loading spinner hilang
2. Reduce entries per page (10 instead of 100)
3. Use search untuk filter data

## Security Notes

⚠️ **Important:**
- Jangan share screenshot dashboard ke publik
- Logout setelah selesai menggunakan dashboard
- Jangan simpan password di browser
- Close tab setelah selesai

## Frequently Asked Questions

**Q: Apakah perubahan di dashboard langsung update Google Sheets?**  
A: Tidak. Dashboard ini read-only. Untuk update data, edit langsung di Google Sheets.

**Q: Berapa lama data di-cache?**  
A: Tidak ada cache. Setiap refresh, data diambil fresh dari Google Sheets.

**Q: Bisakah saya export semua data sekaligus?**  
A: Saat ini belum ada tombol export. Gunakan Google Sheets untuk export.

**Q: Apakah ada log aktivitas admin?**  
A: Belum ada fitur log aktivitas di versi ini.

**Q: Bisakah ada beberapa admin?**  
A: Ya! Set kolom `role` = `admin` untuk user yang ingin dijadikan admin.

## Future Features (Roadmap)

Fitur yang akan ditambahkan di masa depan:
- [ ] Export data to Excel/CSV dari dashboard
- [ ] Edit data langsung dari dashboard
- [ ] Real-time auto-refresh
- [ ] Activity log untuk audit
- [ ] Advanced filters dan charts
- [ ] Email notification untuk admin
- [ ] Bulk actions (delete, update multiple rows)

## Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi: `ADMIN_DASHBOARD_SETUP.md`
2. Check troubleshooting section
3. Verify Google Sheets setup
4. Contact system administrator

---

**Last Updated:** December 20, 2025  
**Version:** 1.0  
**Status:** ✅ Active
