# ✅ Database Sample Files - Ready to Use!

## 📦 Yang Sudah Dibuat

Saya telah membuat **lengkap** database sample untuk PilateStudio:

### 📄 File CSV (6 files)
```
✅ Users.csv          - 10 users/members
✅ Trainers.csv       - 6 instruktur
✅ Classes.csv        - 3 tipe kelas
✅ Schedules.csv      - 21 jadwal kelas
✅ Bookings.csv       - 20 booking records
✅ Transactions.csv   - 12 transaksi
```

### 📊 File Excel/HTML
```
✅ PilateStudio_Database.html - Semua table dalam satu file
   (Bisa dibuka di Excel atau browser)
```

### 📖 Dokumentasi
```
✅ README.md           - Panduan lengkap (English)
✅ PETUNJUK_IMPORT.md  - Panduan singkat (Indonesia)
✅ EXCEL_CONVERTER.md  - Cara convert ke Excel
✅ create_excel.py     - Python script
✅ create_excel.js     - Node.js script
✅ INDEX.md           - File ini
```

---

## 🚀 Cara Pakai (3 Pilihan)

### Pilihan 1: Import CSV ke Google Sheets (TERMUDAH ✨)

1. **Buka:** https://sheets.google.com
2. **Buat spreadsheet baru:** "PilateStudio Database"
3. **Import setiap CSV:**
   - Buat sheet "Users" → Import `Users.csv`
   - Buat sheet "Trainers" → Import `Trainers.csv`
   - Buat sheet "Classes" → Import `Classes.csv`
   - Buat sheet "Schedules" → Import `Schedules.csv`
   - Buat sheet "Bookings" → Import `Bookings.csv`
   - Buat sheet "Transactions" → Import `Transactions.csv`
4. **Share dengan service account:**
   - Email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
   - Role: Editor
5. **Copy spreadsheet ID** dari URL
6. **Update .env:**
   ```
   GOOGLE_SHEETS_ID=paste_id_disini
   ```

**⏱️ Waktu:** 5-10 menit

---

### Pilihan 2: Buka File HTML di Excel

1. **Buka file:** `PilateStudio_Database.html`
2. **Di Excel:**
   - File > Open
   - Pilih "All Files (*.*)"
   - Select `PilateStudio_Database.html`
   - Excel akan import semua table
3. **Save as .xlsx** jika perlu
4. **Upload ke Google Drive** → Convert to Google Sheets
5. **Share & copy ID**

**⏱️ Waktu:** 3-5 menit

---

### Pilihan 3: Copy dari Browser

1. **Buka:** `PilateStudio_Database.html` di browser
2. **Buka Google Sheets** di tab lain
3. **Copy-paste** setiap table:
   - Select table di browser
   - Ctrl+C (copy)
   - Paste ke Google Sheets
4. **Share & copy ID**

**⏱️ Waktu:** 5-8 menit

---

## 📋 Isi Data Sample

### 👥 Users (10 members)
```
ID   | Name              | Email                  | Credits
-----|-------------------|------------------------|--------
1143 | Stellaa           | stella@example.com     | 10
75   | Anne              | anne@example.com       | 20
141  | Cecillia Kurniawaty| cecillia@example.com  | 15
2232 | Rosianaa          | rosiana@example.com    | 12
... dan 6 lainnya
```

### 👨‍🏫 Trainers (6 instructors)
```
ID  | Name              | Specialization
----|-------------------|---------------------------
3   | Kim Davis         | Reformer, Wall Board, Chair
5   | Shanti            | Reformer, Wall Board
7   | Monica Theresia   | Reformer
8   | Amelia Venesa     | Reformer, Wall Board
902 | Caitlyn           | Reformer
156 | Stephani Karnadi  | Yoga
```

### 🏋️ Classes (3 types)
```
ID | Name        | Duration | Capacity | Price
---|-------------|----------|----------|--------
9  | Reguler     | 60 mins  | 6 people | 150,000
10 | Happy Hour  | 60 mins  | 6 people | 100,000
12 | Yoga        | 60 mins  | 12 people| 120,000
```

### 📅 Schedules (21 classes)
```
Tanggal 19 Desember 2025:
- 07:00 - Kim Davis - Reguler Reformer (2/6)
- 08:00 - Shanti - Reguler Wall Board (0/6)
- 08:00 - Caitlyn - Happy Hour Reformer (6/6) FULL
- 09:00 - Monica - Happy Hour Reformer (4/6)
- 10:00 - Amelia - Happy Hour Reformer (6/6) FULL
- 16:00 - Monica - Happy Hour Reformer (5/6)
- 17:00 - Amelia - Happy Hour Wall Board (2/6)
- 17:00 - Kim Davis - Reguler Reformer (6/6) BOOKED by Stellaa
- 18:00 - Kim Davis - Reguler Reformer (6/6) FULL

Tanggal 20 Desember 2025:
- 07:00 - Stephani - Yoga (2/12)
- 08:00 - Amelia - Happy Hour Reformer (0/6)
- 09:00 - Caitlyn - Happy Hour Reformer (6/6) FULL
- 10:00 - Caitlyn - Happy Hour Reformer (3/6)
- 16:00 - Kim Davis - Reguler Reformer (5/6)

History (November 2025): 7 completed classes
```

---

## ✅ Test Setelah Import

1. **Update .env file:**
   ```bash
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   ```

2. **Start server:**
   ```bash
   node app.js
   ```

3. **Login:**
   - URL: http://localhost:3001/login
   - Email: `stella@example.com`
   - Password: (hashed, perlu di-generate)

4. **Test di Account page:**
   - Pilih tanggal: **19 Desember 2025**
   - Seharusnya tampil **9 kelas**
   - Kelas jam 17:00 (Kim Davis) seharusnya sudah **"Booked"**
   - Klik **"Book Now"** di kelas available
   - Check Google Sheets - members array terupdate!

5. **Test History tab:**
   - Klik tab **"History"**
   - Seharusnya tampil **8 past bookings**
   - Semua dengan status "Booked"

---

## 🎯 Field Penting

### Schedules.members
```json
Format: ["user_id1","user_id2"]
Contoh: ["1143","2232","943"]

⚠️ HARUS JSON string, bukan array biasa!
```

### Date Format
```
schedule_time: 2025-12-19 07:00:00
registered_date: 2025-01-15
```

### Status Values
```
Schedules: Active, Cancelled, Completed
Bookings: Confirmed, Cancelled, Completed
Users: Active, Inactive, Expired
```

---

## 🐛 Troubleshooting

### ❌ "No classes showing"
**Cek:**
- [ ] Tanggal di schedule_time = tanggal yang dipilih
- [ ] Status = "Active"
- [ ] GOOGLE_SHEETS_ID benar di .env
- [ ] Service account punya akses Editor

### ❌ "Booking not working"
**Cek:**
- [ ] User sudah login (session active)
- [ ] Members format: `["id1","id2"]` bukan `[id1,id2]`
- [ ] Class tidak penuh
- [ ] Bookings sheet exists

### ❌ "Cannot read spreadsheet"
**Cek:**
- [ ] Service account di-share dengan Editor permission
- [ ] Sheet names exact match (case-sensitive)
- [ ] GOOGLE_SHEETS_ID correct

---

## 📁 Struktur Folder

```
database_sample/
├── INDEX.md                  ← ANDA DI SINI
├── README.md                 - Panduan lengkap (English)
├── PETUNJUK_IMPORT.md        - Panduan singkat (Indonesia)
├── EXCEL_CONVERTER.md        - Cara convert CSV
├── create_excel.py           - Python script
├── create_excel.js           - Node.js script
├── PilateStudio_Database.html - HTML version (generated)
├── Users.csv
├── Trainers.csv
├── Classes.csv
├── Schedules.csv
├── Bookings.csv
└── Transactions.csv
```

---

## 💡 Tips

- **CSV files** paling mudah untuk import ke Google Sheets
- **HTML file** bagus untuk preview dan copy-paste
- **Jangan ubah column headers** (row 1 di setiap sheet)
- **Backup Google Sheets** secara regular
- **Test dengan sample data dulu** sebelum pakai data real

---

## 📚 Reference

| Dokumen | Untuk Apa |
|---------|-----------|
| [GOOGLE_SHEETS_DATABASE_DESIGN.md](../GOOGLE_SHEETS_DATABASE_DESIGN.md) | Desain database lengkap |
| [API_INTEGRATION_GUIDE.md](../API_INTEGRATION_GUIDE.md) | Panduan API |
| [SCHEDULE_INTEGRATION_SUMMARY.md](../SCHEDULE_INTEGRATION_SUMMARY.md) | Summary implementasi |
| [LOGIN_IMPLEMENTATION_DOCS.md](../LOGIN_IMPLEMENTATION_DOCS.md) | Setup authentication |
| [FIX_AUTH_ERROR.md](../FIX_AUTH_ERROR.md) | Fix Google Sheets access |

---

## 🎉 Ready to Go!

Semua file sudah siap pakai! Pilih cara import yang paling mudah untuk Anda, lalu mulai testing sistem booking.

**Good luck! 🚀**
