# 📊 Cara Import Database ke Excel/Google Sheets

## 🎯 Pilihan Tercepat

### Opsi 1: Import Langsung ke Google Sheets (RECOMMENDED)

1. **Buka Google Sheets:** https://sheets.google.com
2. **Buat Spreadsheet Baru:** Rename ke "PilateStudio Database"
3. **Import File CSV:**
   - Untuk setiap file (Users.csv, Trainers.csv, dll):
     - Buat sheet baru dengan nama yang sesuai
     - Klik `File > Import > Upload`
     - Pilih file CSV
     - Separator: Comma
     - Klik "Import"

4. **Share dengan Service Account:**
   - Klik tombol "Share"
   - Masukkan email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
   - Pilih role: "Editor"
   - Klik "Share"

5. **Copy Spreadsheet ID:**
   - Dari URL: `https://docs.google.com/spreadsheets/d/{ID_INI}/edit`
   - Paste ke file `.env`:
     ```
     GOOGLE_SHEETS_ID=paste_id_disini
     ```

---

### Opsi 2: Buat File Excel dengan Python

1. **Install Python packages:**
   ```bash
   pip install pandas openpyxl
   ```

2. **Jalankan script:**
   ```bash
   cd database_sample
   python create_excel.py
   ```

3. **Hasilnya:** File `PilateStudio_Database.xlsx` akan dibuat otomatis!

4. **Upload ke Google Drive:**
   - Upload file Excel
   - Klik kanan > Open with > Google Sheets
   - File > Save as Google Sheets

---

### Opsi 3: Manual di Excel

1. **Buka Microsoft Excel**
2. **Buat Workbook Baru**
3. **Untuk setiap CSV:**
   - Buat sheet baru
   - Data > From Text/CSV
   - Pilih file CSV
   - Load
4. **Save as .xlsx**

---

## ✅ Struktur Database

Setelah import, Anda akan punya 6 sheets:

| Sheet | Jumlah Data | Deskripsi |
|-------|-------------|-----------|
| **Users** | 10 rows | Data member/pengguna |
| **Trainers** | 6 rows | Data instruktur |
| **Classes** | 3 rows | Tipe kelas (Reguler, Happy Hour, Yoga) |
| **Schedules** | 21 rows | Jadwal kelas (19-20 Dec + history) |
| **Bookings** | 20 rows | History booking member |
| **Transactions** | 12 rows | History pembelian credits |

---

## 📋 Isi Data Sample

### Users (10 member)
- Stellaa, Anne, Cecillia, Rosianaa, dll
- Password: Semua sama (hashed)
- Credits: 5-25 credits

### Trainers (6 instruktur)
- Kim Davis (Reformer, Wall Board, Chair)
- Caitlyn (Reformer - Beginner friendly)
- Monica Theresia, Amelia Venesa, dll

### Schedules
- **19 Desember 2025:** 9 kelas (07:00-18:00)
- **20 Desember 2025:** 5 kelas (07:00-16:00)
- **November 2025:** 7 kelas (untuk history)

---

## 🔍 Verifikasi

Cek apakah:
- ✅ Semua 6 sheets ada
- ✅ Header ada di baris 1
- ✅ Data mulai dari baris 2
- ✅ Field `members` di Schedules dalam format: `["id1","id2"]`
- ✅ Format tanggal: `YYYY-MM-DD HH:MM:SS`
- ✅ Service account punya akses Editor

---

## 🚀 Test Setelah Import

1. **Update .env:**
   ```
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   ```

2. **Jalankan server:**
   ```bash
   node app.js
   ```

3. **Login:**
   - Email: `stella@example.com`
   - Password: (sesuaikan dengan hash di database)

4. **Test booking:**
   - Buka `/account`
   - Pilih tanggal: 19 Desember 2025
   - Klik "Book Now" pada kelas yang available
   - Cek Google Sheets - seharusnya terupdate!

---

## 📁 File yang Tersedia

```
database_sample/
├── README.md              # Panduan lengkap (English)
├── PETUNJUK_IMPORT.md     # Panduan singkat (Bahasa Indonesia) ← ANDA DI SINI
├── EXCEL_CONVERTER.md     # Cara convert CSV ke Excel
├── create_excel.py        # Script Python untuk buat Excel
├── Users.csv              # Data 10 users
├── Trainers.csv           # Data 6 trainers
├── Classes.csv            # Data 3 classes
├── Schedules.csv          # Data 21 schedules
├── Bookings.csv           # Data 20 bookings
└── Transactions.csv       # Data 12 transactions
```

---

## ❓ Troubleshooting

### "Members field tidak update saat booking"
→ Pastikan format JSON string di kolom members: `["75","141"]`

### "Tidak ada kelas yang muncul"
→ Cek tanggal di schedule_time cocok dengan tanggal yang dipilih
→ Cek status = "Active"

### "Cannot read spreadsheet"
→ Pastikan service account sudah di-share
→ Cek GOOGLE_SHEETS_ID di .env
→ Cek nama sheet (case-sensitive!)

---

## 💡 Tips

- **Import langsung ke Google Sheets** lebih cepat dan mudah
- **Gunakan Python script** jika ingin file Excel offline
- **Jangan ubah nama kolom** di header (row 1)
- **Backup Google Sheets** secara berkala

---

## 🎉 Selesai!

Setelah import, Anda siap untuk:
- ✅ Login ke sistem
- ✅ Lihat jadwal kelas
- ✅ Book kelas
- ✅ Lihat history booking
- ✅ Manage credits

**Selamat mencoba! 🚀**
