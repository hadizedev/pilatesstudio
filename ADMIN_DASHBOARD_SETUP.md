# Admin Dashboard Setup Guide

## Fitur Dashboard Admin

Dashboard admin telah ditambahkan dengan fitur-fitur berikut:

### 📊 Data yang Ditampilkan
1. **Users** - Semua data pengguna dengan informasi lengkap
2. **Bookings** - Semua booking kelas
3. **Classes** - Daftar kelas yang tersedia
4. **Transactions** - Riwayat transaksi pembayaran
5. **Schedules** - Jadwal kelas yang tersedia
6. **Trainers** - Data instruktur

### 🔐 Keamanan
- Hanya user dengan role `admin` yang dapat mengakses dashboard
- Middleware `requireAdmin` memproteksi route `/admin`
- User non-admin akan mendapat error 403 jika mencoba akses

## Cara Setup Admin User

### 1. Tambahkan Kolom `role` di Google Sheets

Buka Google Sheet "Users" dan tambahkan kolom `role` (setelah kolom `date_of_birth`):

```
id | email | password | name | phone | membership_type | membership_status | registered_date | profile_picture | total_credits | gender | date_of_birth | role
```

### 2. Set User Sebagai Admin

Untuk membuat user menjadi admin, isi kolom `role` dengan nilai `admin`:

**Contoh:**
```csv
1143,stella@example.com,$2a$10$XZmL...,Stellaa,+62812345001,Regular,Active,2025-01-15,u-1143.webp,10,F,1990-05-15,admin
```

### 3. User Biasa (Non-Admin)

User biasa dapat dikosongkan atau diisi dengan `user`:

**Contoh:**
```csv
75,anne@example.com,$2a$10$XZmL...,Anne,+62812345002,Premium,Active,2024-11-20,u-75.webp,20,F,1988-03-22,user
```

## Cara Mengakses Dashboard Admin

1. Login sebagai user dengan role `admin`
2. Setelah login, link "ADMIN DASHBOARD" akan muncul di header
3. Klik link tersebut atau akses langsung ke `/admin`
4. Dashboard akan menampilkan:
   - **Statistics Cards** - Ringkasan jumlah data
   - **Tabbed Tables** - Data lengkap dalam tabel yang dapat di-sort dan search

## Fitur Dashboard

### 📈 Statistics Cards
Menampilkan ringkasan:
- Total Users
- Total Bookings
- Total Classes
- Total Transactions
- Total Schedules
- Total Trainers

### 📋 Data Tables
Setiap tabel dilengkapi dengan:
- **Search** - Cari data dengan mudah
- **Sort** - Urutkan berdasarkan kolom
- **Pagination** - Navigasi halaman
- **Color-coded Status** - Status berwarna untuk kemudahan membaca
  - 🟢 Green: Active, Completed, Paid
  - 🔵 Blue: Confirmed
  - 🟡 Yellow: Pending
  - 🔴 Red: Inactive, Cancelled

## File yang Ditambahkan/Dimodifikasi

### File Baru:
1. `routes/api/admin.js` - API endpoint untuk mengambil data
2. `views/admin.hbs` - Halaman dashboard admin
3. `views/error.hbs` - Halaman error untuk akses ditolak

### File Dimodifikasi:
1. `middleware/auth.js` - Tambah `requireAdmin` dan update `checkAuth`
2. `routes/index.js` - Tambah route `/admin`
3. `routes/api/login.js` - Tambah field `role` di session
4. `app.js` - Register route admin API
5. `views/partials/header.hbs` - Tambah link admin dashboard

## Struktur Google Sheets yang Diperlukan

Pastikan Google Sheets memiliki sheet berikut dengan nama yang sesuai:
- **Users** - dengan kolom `role` 
- **Bookings**
- **Classes**
- **Transactions**
- **Schedules**
- **Trainers**

## Testing

### Test 1: Login sebagai Admin
1. Set user dengan role `admin` di Google Sheets
2. Login dengan user tersebut
3. Verifikasi link "ADMIN DASHBOARD" muncul di header
4. Klik dan pastikan dashboard muncul dengan semua data

### Test 2: Login sebagai User Biasa
1. Login dengan user tanpa role admin
2. Verifikasi link "ADMIN DASHBOARD" TIDAK muncul
3. Jika mencoba akses `/admin` langsung, harus mendapat error 403

### Test 3: Access Without Login
1. Akses `/admin` tanpa login
2. Harus redirect ke `/login`

## Troubleshooting

### Dashboard tidak muncul setelah login sebagai admin
- Cek Google Sheets, pastikan kolom `role` ada dan bernilai `admin`
- Clear browser cache dan cookies
- Logout dan login kembali

### Error "Akses Ditolak"
- User tidak memiliki role `admin` di Google Sheets
- Update role di Google Sheets dan login ulang

### Data tidak muncul di dashboard
- Cek koneksi ke Google Sheets API
- Verifikasi service account sudah di-share ke spreadsheet
- Cek console browser untuk error JavaScript

## Security Notes

⚠️ **Penting:**
- Jangan share credentials Google Sheets ke repository publik
- Gunakan environment variables untuk sensitive data
- Hanya berikan role admin ke user yang terpercaya
- Audit log akses admin secara berkala

## Next Steps (Optional Enhancements)

1. **Export Data** - Tambah tombol untuk export data ke Excel/CSV
2. **Edit Data** - Tambah fungsi edit data langsung dari dashboard
3. **Analytics** - Tambah grafik dan analytics
4. **Real-time Updates** - Auto-refresh data secara periodik
5. **Activity Log** - Log aktivitas admin
6. **Role-based Features** - Tambah role lain seperti manager, trainer, etc.

---

**Created:** December 20, 2025  
**Version:** 1.0
