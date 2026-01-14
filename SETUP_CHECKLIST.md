# ✅ Setup Checklist - Login System

## 📋 Pre-Implementation (Sudah Selesai)

- [x] ✅ Install dependencies (express-session, googleapis, bcryptjs)
- [x] ✅ Create login API endpoint
- [x] ✅ Create authentication middleware
- [x] ✅ Create account/dashboard page
- [x] ✅ Create logout functionality
- [x] ✅ Update header untuk conditional login/logout
- [x] ✅ Configure express-session
- [x] ✅ Create documentation

---

## 🚀 Deployment Checklist (Yang Perlu Dilakukan)

### 1. Google Sheets Setup
- [ ] Buka Google Sheets (ID: 1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98)
- [ ] Buat sheet baru dengan nama **"Users"**
- [ ] Tambahkan header row:
  ```
  email | password | name | phone | membership_type | membership_status | registered_date | profile_picture | total_credits
  ```
- [ ] Import `sample_users_data.csv` ATAU tambah data manual
- [ ] Pastikan service account punya akses Editor ke spreadsheet

### 2. Test Users (Minimal 1)
- [ ] Tambahkan minimal 1 test user
- [ ] Generate password hash (opsional): `node utils/hashPassword.js yourpassword`
- [ ] Verifikasi data sudah tersimpan di Google Sheets

### 3. Server Testing
- [ ] Stop server yang sedang berjalan (jika ada)
- [ ] Start server: `npm start` atau `node app.js`
- [ ] Verifikasi server berjalan di port 3001
- [ ] Cek console untuk errors

### 4. Login Testing
- [ ] Akses `http://localhost:3001/login`
- [ ] Test login dengan credentials yang benar
- [ ] Verifikasi redirect ke `/account`
- [ ] Cek data user tampil dengan benar di account page
- [ ] Test logout functionality
- [ ] Verifikasi redirect ke homepage setelah logout

### 5. Authentication Testing
- [ ] Coba akses `/account` tanpa login (harus redirect ke `/login`)
- [ ] Login kemudian akses `/account` (harus bisa akses)
- [ ] Verifikasi header menampilkan LOGOUT + MY ACCOUNT saat login
- [ ] Verifikasi header menampilkan LOGIN saat logout

### 6. Error Handling Testing
- [ ] Test login dengan email yang tidak terdaftar
- [ ] Test login dengan password salah
- [ ] Test login dengan field kosong
- [ ] Verifikasi error messages ditampilkan dengan benar

---

## 🔐 Security Checklist (Production)

### Immediate (Sebelum Production)
- [ ] Ganti session secret di `app.js` dengan random string yang aman
- [ ] Set `cookie.secure: true` jika menggunakan HTTPS
- [ ] Hash semua password di Google Sheets menggunakan bcrypt
- [ ] Hapus plain text passwords

### Recommended
- [ ] Setup environment variables (.env file)
- [ ] Implement rate limiting untuk prevent brute force
- [ ] Add CSRF protection
- [ ] Implement input sanitization
- [ ] Setup session store (Redis/MongoDB) untuk production
- [ ] Enable HTTPS
- [ ] Add logging (Winston/Morgan)

---

## 📱 User Acceptance Testing

### Login Flow
- [ ] User bisa akses halaman login
- [ ] Form validation bekerja dengan baik
- [ ] Loading indicator muncul saat submit
- [ ] Success message ditampilkan saat login berhasil
- [ ] Error message ditampilkan saat login gagal
- [ ] Auto redirect ke account page setelah sukses

### Account Page
- [ ] Profile information tampil dengan benar
- [ ] Membership info tampil dengan benar
- [ ] Credits tampil dengan benar
- [ ] Contact info tampil dengan benar
- [ ] Quick action buttons dapat diklik
- [ ] Layout responsive di mobile

### Navigation
- [ ] Header menampilkan menu yang tepat berdasarkan auth status
- [ ] MY ACCOUNT link berfungsi
- [ ] LOGOUT button berfungsi
- [ ] Back to Home link di login page berfungsi

### Session Management
- [ ] Session persistent setelah refresh page
- [ ] Session expire setelah 24 jam (atau waktu yang ditentukan)
- [ ] Logout menghapus session dengan benar
- [ ] User tidak bisa akses protected route setelah logout

---

## 🐛 Known Issues & Solutions

### Issue: Port 3001 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Atau ganti port di app.js
```

### Issue: "Data pengguna tidak ditemukan"
**Solution:**
- Pastikan sheet "Users" exists
- Pastikan ada data di sheet
- Cek service account permissions

### Issue: Session tidak persistent
**Solution:**
- Clear browser cookies
- Restart server
- Cek session configuration

---

## 📞 Support Resources

- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Google Sheets Setup:** [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
- **Full Documentation:** [LOGIN_IMPLEMENTATION_DOCS.md](LOGIN_IMPLEMENTATION_DOCS.md)
- **Implementation Summary:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## ✅ Final Verification

Sebelum menandai sebagai complete, pastikan:

- [ ] ✅ Google Sheets "Users" tabel sudah dibuat dan ada data
- [ ] ✅ Server bisa start tanpa error
- [ ] ✅ Login berhasil dengan test account
- [ ] ✅ Account page accessible setelah login
- [ ] ✅ Logout berfungsi dengan baik
- [ ] ✅ Authentication middleware berfungsi (protected routes)
- [ ] ✅ Header menampilkan menu yang benar
- [ ] ✅ Responsive di mobile device

---

## 🎉 Ready for Use!

Jika semua checklist di atas sudah ✅, sistem login siap digunakan!

**Last Updated:** 19 Desember 2025
