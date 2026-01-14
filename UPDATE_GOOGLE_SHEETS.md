# ⚠️ IMPORTANT: Update Google Sheets

## Action Required

Anda perlu **menambahkan kolom `role`** ke Google Sheets yang asli (bukan hanya file CSV sample).

## Steps to Update Google Sheets

### 1. Buka Google Sheets
URL: https://docs.google.com/spreadsheets/d/1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98

### 2. Buka Sheet "Users"

### 3. Tambahkan Kolom Baru
- Klik kolom **M** (setelah kolom `date_of_birth`)
- Klik kanan → Insert 1 column right
- Atau insert di kolom M langsung

### 4. Set Header
Di cell **M1**, isi dengan: `role`

### 5. Set Admin Users
Untuk user yang ingin dijadikan admin, isi kolom `role` dengan: `admin`

**Contoh:**
```
Row 2 (Stella): M2 = admin
Row 3 (Anne):   M3 = user
Row 4 (Cecilia): M4 = user
```

### 6. Isi Kolom Role untuk Semua User
- Admin user: `admin`
- Regular user: `user` atau kosongkan

## Visual Guide

```
┌────┬───────┬──────────┬─────────┬──────────────┬──────┐
│ ID │ Name  │ Gender   │ DOB      │ role         │      │
├────┼───────┼──────────┼─────────┼──────────────┼──────┤
│1143│Stella │ F        │1990-05-15│ admin        │      │
│ 75 │Anne   │ F        │1988-03-22│ user         │      │
│141 │Cecil  │ F        │1992-07-18│ user         │      │
└────┴───────┴──────────┴─────────┴──────────────┴──────┘
     Kolom A-L (existing)         Kolom M (NEW)
```

## Verification

Setelah update Google Sheets:

1. **Restart server** (jika sudah running)
   ```bash
   # Ctrl+C to stop
   # Then start again:
   npm start
   ```

2. **Clear browser cache dan cookies**

3. **Login dengan user admin**

4. **Verify:**
   - Link "ADMIN DASHBOARD" muncul di header
   - Dapat akses ke `/admin`
   - Dashboard menampilkan semua data

## Important Notes

- ⚠️ Jika kolom `role` tidak ada, user default sebagai `user` (bukan admin)
- ⚠️ Hanya user dengan role `admin` yang bisa akses dashboard
- ⚠️ Update di Google Sheets akan langsung terpakai saat login berikutnya
- ⚠️ Tidak perlu restart server untuk perubahan role di Google Sheets

## Sample Users.csv Format

Referensi format yang benar ada di: `database_sample/Users.csv`

Header lengkap:
```csv
id,email,password,name,phone,membership_type,membership_status,registered_date,profile_picture,total_credits,gender,date_of_birth,role
```

## Test Admin User

Default admin dari sample:
- Email: `stella@example.com`
- Password: (gunakan password yang di Google Sheets)
- Role: `admin`

---

**Need help?** Check `ADMIN_DASHBOARD_SETUP.md` for detailed documentation.
