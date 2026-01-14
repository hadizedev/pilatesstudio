# ✅ Admin Dashboard - Pre-Launch Checklist

Gunakan checklist ini untuk memastikan admin dashboard siap digunakan.

## 📋 Setup Checklist

### 1. Google Sheets Configuration
- [ ] Buka Google Sheets: `https://docs.google.com/spreadsheets/d/1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98`
- [ ] Verify sheet "Users" ada
- [ ] **Tambahkan kolom `role` di kolom M**
- [ ] Set header M1 = `role`
- [ ] Set minimal 1 user dengan role `admin` (contoh: Stella)
- [ ] Verify sheets lain ada: Bookings, Classes, Transactions, Schedules, Trainers
- [ ] Share spreadsheet dengan service account: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`

### 2. Code Files Verification
- [ ] File `routes/api/admin.js` ada
- [ ] File `views/admin.hbs` ada
- [ ] File `views/error.hbs` ada
- [ ] File `middleware/auth.js` sudah diupdate
- [ ] File `routes/index.js` sudah diupdate
- [ ] File `app.js` sudah register admin routes
- [ ] File `views/partials/header.hbs` sudah ada link admin

### 3. Dependencies Check
- [ ] Bootstrap 5 CDN terhubung
- [ ] DataTables CDN terhubung
- [ ] Font Awesome CDN terhubung
- [ ] jQuery CDN terhubung
- [ ] Package `googleapis` terinstall
- [ ] Package `express-session` terinstall
- [ ] Package `bcryptjs` terinstall

### 4. Server Configuration
- [ ] Server dapat dijalankan tanpa error: `npm start`
- [ ] Server berjalan di port 3001 (atau port Anda)
- [ ] Session secret sudah diset di `app.js`
- [ ] Google Sheets credentials valid di `routes/api/login.js` dan `routes/api/admin.js`

## 🧪 Testing Checklist

### Test 1: Basic Access
- [ ] Server running: `http://localhost:3001`
- [ ] Homepage bisa diakses
- [ ] Login page bisa diakses: `/login`
- [ ] Logout bekerja: `/logout`

### Test 2: Admin Login
- [ ] Login dengan user admin (role=admin)
- [ ] Session created successfully
- [ ] Redirect ke `/account` setelah login
- [ ] Link "ADMIN DASHBOARD" muncul di header (warna emas)
- [ ] User name tampil di header

### Test 3: Admin Dashboard Access
- [ ] Klik link "ADMIN DASHBOARD" → Dashboard muncul
- [ ] Atau akses langsung `/admin` → Dashboard muncul
- [ ] Loading spinner tampil sebentar
- [ ] 6 statistics cards muncul dengan angka
- [ ] 6 tabs tampil: Users, Bookings, Classes, Transactions, Schedules, Trainers

### Test 4: Data Tables
- [ ] Tab "Users" menampilkan data user
- [ ] Tab "Bookings" menampilkan data booking
- [ ] Tab "Classes" menampilkan data kelas
- [ ] Tab "Transactions" menampilkan data transaksi
- [ ] Tab "Schedules" menampilkan data jadwal
- [ ] Tab "Trainers" menampilkan data trainer
- [ ] Search box berfungsi di setiap tab
- [ ] Sort by column berfungsi
- [ ] Pagination berfungsi
- [ ] Status badges berwarna dengan benar

### Test 5: Security - Non-Admin User
- [ ] Login dengan user biasa (role=user atau kosong)
- [ ] Link "ADMIN DASHBOARD" TIDAK muncul di header
- [ ] Akses langsung `/admin` → Error 403 atau redirect
- [ ] Error page tampil dengan message yang jelas

### Test 6: Security - No Login
- [ ] Logout dari semua session
- [ ] Akses `/admin` → Redirect ke `/login`
- [ ] Akses `/api/admin/data` → Error 401 (Unauthorized)

### Test 7: API Endpoints
- [ ] `/api/admin/data` return JSON dengan struktur benar
- [ ] Data users ada dan format benar
- [ ] Data bookings ada dan format benar
- [ ] Data classes ada dan format benar
- [ ] Data transactions ada dan format benar
- [ ] Data schedules ada dan format benar
- [ ] Data trainers ada dan format benar
- [ ] Stats object ada dengan semua counts

## 🎨 UI/UX Checklist

### Visual Design
- [ ] Statistics cards tampil dengan gradient warna
- [ ] Icons tampil dengan benar (Font Awesome)
- [ ] Color-coded status badges
  - [ ] Green untuk Active/Completed/Paid
  - [ ] Blue untuk Confirmed
  - [ ] Yellow untuk Pending
  - [ ] Red untuk Inactive/Cancelled
- [ ] Tables responsive dan readable
- [ ] Loading spinner animasi smooth

### Responsiveness
- [ ] Desktop view (1920px) - Layout rapi
- [ ] Laptop view (1366px) - Layout rapi
- [ ] Tablet view (768px) - Layout adjust
- [ ] Mobile view (375px) - Layout mobile-friendly

### Performance
- [ ] Page load < 3 detik (first load)
- [ ] API response < 2 detik
- [ ] Table rendering smooth
- [ ] No console errors
- [ ] No JavaScript errors
- [ ] No CSS render issues

## 📄 Documentation Checklist

- [ ] `ADMIN_IMPLEMENTATION_SUMMARY.md` tersedia
- [ ] `ADMIN_DASHBOARD_SETUP.md` tersedia
- [ ] `ADMIN_QUICK_REFERENCE.md` tersedia
- [ ] `ADMIN_USER_GUIDE.md` tersedia
- [ ] `UPDATE_GOOGLE_SHEETS.md` tersedia
- [ ] `README.md` updated dengan info admin
- [ ] Sample `database_sample/Users.csv` updated dengan kolom role

## 🔒 Security Checklist

- [ ] `requireAdmin` middleware berfungsi
- [ ] Session timeout 24 jam
- [ ] Password tidak di-log ke console
- [ ] Google Sheets credentials tidak di-commit ke git
- [ ] `.gitignore` includes sensitive files
- [ ] Error messages tidak expose sensitive info
- [ ] HTTPS ready (jika production)

## 🚀 Production Ready Checklist

### Before Going Live
- [ ] Change session secret ke random secure string
- [ ] Update Google Sheets credentials (production account)
- [ ] Set `cookie.secure = true` jika HTTPS
- [ ] Review dan audit all admin users
- [ ] Backup Google Sheets
- [ ] Test on production environment
- [ ] Setup monitoring/logging
- [ ] Document admin procedures

### Post-Launch Monitoring
- [ ] Monitor server logs for errors
- [ ] Check API response times
- [ ] Verify data accuracy
- [ ] Test weekly with different scenarios
- [ ] Keep documentation updated

## ❌ Common Issues to Check

- [ ] ✅ Google Sheets shared dengan service account
- [ ] ✅ Kolom `role` ada di sheet Users
- [ ] ✅ Format range sesuai: Users!A:M (bukan A:L)
- [ ] ✅ User admin punya role=`admin` (bukan Admin atau ADMIN)
- [ ] ✅ Session middleware terpasang sebelum routes
- [ ] ✅ checkAuth middleware run di semua routes
- [ ] ✅ API route `/api/admin` terdaftar di app.js
- [ ] ✅ Bootstrap dan DataTables CSS/JS loaded
- [ ] ✅ No mixed HTTP/HTTPS content warnings

## 📊 Success Metrics

Dashboard dianggap **berhasil** jika:
- ✅ Admin bisa login dan akses dashboard tanpa error
- ✅ Semua 6 tabel menampilkan data dengan benar
- ✅ Non-admin TIDAK bisa akses dashboard
- ✅ Search dan filter berfungsi di semua tabel
- ✅ No console errors
- ✅ Page load time < 3 detik
- ✅ Mobile responsive

## 🎯 Final Verification

Setelah semua checklist completed:

1. **Clean Test:**
   - [ ] Clear browser cache
   - [ ] Clear cookies
   - [ ] Restart server
   - [ ] Fresh login sebagai admin
   - [ ] Akses dashboard → Everything works

2. **Documentation Review:**
   - [ ] Baca `ADMIN_IMPLEMENTATION_SUMMARY.md`
   - [ ] Follow `UPDATE_GOOGLE_SHEETS.md`
   - [ ] Verify dengan `ADMIN_QUICK_REFERENCE.md`

3. **Handover:**
   - [ ] Train admin users
   - [ ] Share documentation
   - [ ] Demo dashboard features
   - [ ] Setup support process

---

## ✅ Sign Off

- [ ] **Developer:** Implementation complete and tested
- [ ] **Admin User:** Trained and can use dashboard
- [ ] **Stakeholder:** Approved and ready for production

**Completed Date:** _______________  
**Signed by:** _______________

---

**Version:** 1.0  
**Last Updated:** December 20, 2025
