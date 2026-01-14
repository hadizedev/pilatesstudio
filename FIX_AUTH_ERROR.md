# 🔧 Fix Google Sheets Authorization Error

## ❌ Error yang Muncul

```
GaxiosError: Method doesn't allow unregistered callers (callers without established identity). 
Please use API Key or other form of API consumer identity to call this API
```

**ATAU**

```
Error: The caller does not have permission
```

## 🎯 Penyebab

Service account **belum memiliki akses** ke Google Sheets Anda. Service account perlu di-share spreadsheet secara eksplisit agar bisa membaca data.

---

## ✅ SOLUSI LENGKAP (5 Menit)

### 📋 Step 1: Buka Google Sheets

1. **Klik link ini atau copy-paste ke browser:**
   ```
   https://docs.google.com/spreadsheets/d/1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98
   ```

2. **Login** dengan akun Google yang memiliki spreadsheet tersebut

### 📋 Step 2: Share dengan Service Account

1. **Klik tombol "Share"** (pojok kanan atas) atau **icon orang dengan +**

2. **Di field "Add people and groups"**, masukkan email ini:
   ```
   pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com
   ```

3. **Pilih permission level:**
   - **Klik dropdown** di sebelah email
   - Pilih **"Viewer"** (cukup untuk read-only) atau **"Editor"** (recommended)

4. **PENTING: Uncheck "Notify people"**
   - Service account tidak perlu notifikasi
   - Hilangkan centang pada "Notify people" sebelum send

5. **Klik "Send"** atau "Done"

### 📋 Step 3: Verifikasi Share

Setelah share, verifikasi bahwa service account sudah ada di list:
- Klik tombol "Share" lagi
- Cek apakah `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com` muncul di list
- Permission harus **Viewer** atau **Editor**

### 📋 Step 4: Restart Server

```bash
# Stop server yang sedang running (Ctrl+C di terminal)

# Start lagi
npm start
# atau
node app.js
```

### 📋 Step 5: Cek Console

Server console harus menampilkan:
```
Server berjalan di http://localhost:3001
✅ Google Sheets API authorized successfully
```

**Jika muncul ✅**, berarti sudah berhasil!

---

## 📸 Screenshot Guide

### 1. Klik Share Button
<img src="https://i.imgur.com/share-button.png" width="300">

### 2. Add Service Account Email
<img src="https://i.imgur.com/add-email.png" width="400">

### 3. Set Permission to Editor
<img src="https://i.imgur.com/set-permission.png" width="400">

---

## 🧪 Testing

Setelah share spreadsheet dan restart server:

1. **Cek server console** - harus muncul "✅ Google Sheets API authorized successfully"
2. **Test login** - akses `http://localhost:3001/login`
3. **Masukkan credentials** test user
4. **Verifikasi** - login harus berhasil

---

## ⚠️ Troubleshooting

### Error masih muncul setelah share?

**Checklist:**
- [ ] Email service account yang di-share **sudah benar**?
- [ ] Permission minimal **Viewer**, recommended **Editor**
- [ ] **Sudah restart server** setelah share?
- [ ] **Spreadsheet ID benar**: `1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98`
- [ ] Sheet **"Users"** sudah dibuat di spreadsheet?

### Masih error "Data pengguna tidak ditemukan"?

- Pastikan sheet bernama **"Users"** (huruf U besar)
- Pastikan ada **data di sheet** (minimal header row)
- Import `sample_users_data.csv` jika belum ada data

### Error 404 - Spreadsheet not found?

- Cek spreadsheet ID di `routes/api/login.js`
- Pastikan spreadsheet **tidak dihapus**
- Pastikan spreadsheet **accessible** (tidak private)

---

## 🔐 Alternative: Gunakan OAuth2 (Advanced)

Jika tidak ingin share dengan service account, Anda bisa menggunakan OAuth2:

1. Setup OAuth2 credentials di Google Cloud Console
2. Implement OAuth2 flow
3. Store refresh token

**Namun ini lebih kompleks, untuk production gunakan service account + share.**

---

## 📝 Catatan

- Service account email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
- Spreadsheet ID: `1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98`
- Server akan auto-check authorization saat start
- Error handling sudah ditambahkan untuk memberikan pesan yang jelas

---

## ✅ Verification Checklist

Setelah implementasi fix:

- [ ] Server start tanpa error authorization
- [ ] Console show "✅ Google Sheets API authorized successfully"
- [ ] Login page bisa diakses
- [ ] Test login berhasil
- [ ] Data user tampil di account page

---

## 📞 Masih Error?

Jika masih ada masalah:

1. **Cek console server** untuk error message detail
2. **Cek browser console (F12)** untuk error di frontend
3. **Verifikasi** service account email sudah benar di share settings
4. **Restart server** setelah setiap perubahan
5. **Clear browser cache** jika perlu

---

**Last Updated:** 19 Desember 2025  
**Fix Version:** 1.1.0
