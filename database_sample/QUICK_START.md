# 🚀 Quick Start - Database Setup

## ⚡ 3 Langkah Simple

### 1️⃣ Import ke Google Sheets (5 menit)

```
1. Buka: https://sheets.google.com
2. Create new spreadsheet: "PilateStudio Database"
3. Import 6 CSV files:
   - Users.csv → sheet "Users"
   - Trainers.csv → sheet "Trainers"  
   - Classes.csv → sheet "Classes"
   - Schedules.csv → sheet "Schedules"
   - Bookings.csv → sheet "Bookings"
   - Transactions.csv → sheet "Transactions"
4. Share dengan: pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com
   (Role: Editor)
```

### 2️⃣ Update .env file

```bash
# Copy Spreadsheet ID dari URL:
# https://docs.google.com/spreadsheets/d/{THIS_IS_THE_ID}/edit

GOOGLE_SHEETS_ID=paste_id_here
```

### 3️⃣ Test!

```bash
# Start server
node app.js

# Open browser
http://localhost:3001/account

# Login (jika belum)
# Pilih tanggal: 19 Desember 2025
# Click "Book Now"
# ✅ Success! Check Google Sheets updated!
```

---

## 📊 Yang Akan Anda Dapatkan

```
✅ 10 users siap login
✅ 6 trainers/instructors
✅ 3 class types (Reguler, Happy Hour, Yoga)
✅ 21 schedules (upcoming + history)
✅ 20 booking records
✅ 12 transactions
```

---

## 🎯 Test Login

**Test User:**
- Email: `stella@example.com`
- Has: 7 completed bookings + 1 upcoming
- Credits: 10

**Untuk generate password:**
```bash
node utils/hashPassword.js stella123
# Copy hash ke Users.csv kolom password
```

---

## 📱 Quick Links

| File | Deskripsi |
|------|-----------|
| [INDEX.md](INDEX.md) | **START HERE** - Panduan lengkap |
| [PETUNJUK_IMPORT.md](PETUNJUK_IMPORT.md) | Panduan Bahasa Indonesia |
| [PilateStudio_Database.html](PilateStudio_Database.html) | Preview semua data |

---

## ❓ Butuh Bantuan?

**Lihat file:**
- `README.md` - Detailed guide
- `PETUNJUK_IMPORT.md` - Indonesian guide
- `EXCEL_CONVERTER.md` - Excel conversion

**Atau check dokumentasi project:**
- `GOOGLE_SHEETS_DATABASE_DESIGN.md` - Database structure
- `API_INTEGRATION_GUIDE.md` - API docs
- `SCHEDULE_INTEGRATION_SUMMARY.md` - Implementation summary

---

**That's it! Simple kan? 🎉**
