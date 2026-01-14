# 📝 Dokumentasi Sistem Login & Authentication

## ✅ Fitur yang Telah Diimplementasikan

### 1. **Login dengan Google Sheets Integration**
- ✅ Autentikasi menggunakan email/username dan password
- ✅ Integrasi dengan Google Sheets tabel "Users"
- ✅ Support untuk password hash (bcrypt) dan plain text
- ✅ Session management dengan express-session

### 2. **Halaman Account User**
- ✅ Dashboard user yang menampilkan:
  - Informasi profil (nama, email, foto)
  - Status membership
  - Jumlah kredit kelas
  - Tanggal registrasi
  - Quick actions (Book Class, My Bookings)
  - Upcoming classes

### 3. **Logout Functionality**
- ✅ Tombol logout yang menghapus session
- ✅ Redirect ke homepage setelah logout

### 4. **Authentication Middleware**
- ✅ Proteksi halaman yang memerlukan login
- ✅ Auto redirect ke login jika belum authenticated
- ✅ Header yang menampilkan LOGIN/LOGOUT secara kondisional

---

## 📁 File Structure

```
PilateStudio/
├── app.js                          # ✅ Updated dengan session & middleware
├── middleware/
│   └── auth.js                     # ✅ NEW - Authentication middleware
├── routes/
│   ├── index.js                    # ✅ Updated dengan account & logout routes
│   └── api/
│       └── login.js                # ✅ Updated - Login API endpoint
├── views/
│   ├── account.hbs                 # ✅ NEW - User account page
│   ├── login.hbs                   # ✅ Updated - Login form dengan API
│   └── partials/
│       └── header.hbs              # ✅ Updated - Conditional login/logout
├── utils/
│   └── hashPassword.js             # ✅ NEW - Utility untuk hash password
├── GOOGLE_SHEETS_SETUP.md          # ✅ NEW - Setup guide untuk Google Sheets
└── LOGIN_IMPLEMENTATION_DOCS.md    # ✅ NEW - Dokumentasi ini
```

---

## 🗂️ Google Sheets Structure

### Tabel: **Users**

| Kolom | Tipe | Deskripsi | Required |
|-------|------|-----------|----------|
| email | String | Email untuk login | ✅ Yes |
| password | String | Password (hash/plain) | ✅ Yes |
| name | String | Nama lengkap user | ✅ Yes |
| phone | String | Nomor telepon | ✅ Yes |
| membership_type | String | Reguler/Premium | ✅ Yes |
| membership_status | String | Active/Inactive | ✅ Yes |
| registered_date | String | Tanggal registrasi | ✅ Yes |
| profile_picture | String | URL foto profil | ❌ No |
| total_credits | Number | Sisa kredit kelas | ✅ Yes |

**Contoh Data:**
```
email: stellaa@example.com
password: $2b$10$... (hashed) atau password123 (plain)
name: Stellaa
phone: 08123456789
membership_type: Reguler
membership_status: Active
registered_date: 01/01/2025
profile_picture: https://example.com/photo.jpg
total_credits: 10
```

---

## 🚀 Cara Setup & Testing

### Step 1: Setup Google Sheets

1. Buka Google Sheets (ID: `1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98`)
2. Buat sheet baru dengan nama **"Users"**
3. Tambahkan header di baris pertama:
   ```
   email | password | name | phone | membership_type | membership_status | registered_date | profile_picture | total_credits
   ```
4. Tambahkan data user untuk testing

### Step 2: Generate Password Hash (Opsional tapi Disarankan)

```bash
# Generate hash untuk password
node utils/hashPassword.js password123

# Copy hash yang dihasilkan ke kolom password di Google Sheets
```

### Step 3: Tambahkan Test User

Contoh data user untuk testing:
```
Email: test@pilatestudio.com
Password: test123
Name: Test User
Phone: 08123456789
Membership Type: Reguler
Membership Status: Active
Registered Date: 19/12/2025
Profile Picture: (kosongkan atau isi dengan URL)
Total Credits: 10
```

### Step 4: Start Server

```bash
# Jalankan server
npm start
# atau
node app.js
```

Server akan berjalan di: `http://localhost:3001`

### Step 5: Test Login

1. Buka browser: `http://localhost:3001/login`
2. Masukkan email & password yang sudah dibuat di Google Sheets
3. Klik "Sign In"
4. Jika berhasil, akan redirect ke `/account`

---

## 🔐 Security Features

### 1. **Password Hashing**
- Support bcrypt password hashing
- Backward compatible dengan plain text password
- Salt rounds: 10

### 2. **Session Management**
- Session disimpan di memory (production: gunakan Redis/MongoDB)
- Cookie HTTP-only untuk prevent XSS
- Session expire: 24 jam
- Secret key untuk sign cookie

### 3. **Authentication Middleware**
```javascript
// Protect route
router.get('/account', requireAuth, (req, res) => {
  // Only accessible if logged in
});
```

### 4. **CSRF Protection**
⚠️ **To-Do:** Implement CSRF token untuk production

---

## 📝 API Endpoints

### POST `/api/login`

**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "redirectUrl": "/account",
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "phone": "08123456789",
    "membership_type": "Reguler",
    "membership_status": "Active",
    "registered_date": "01/01/2025",
    "profile_picture": "",
    "total_credits": "10"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

### GET `/logout`
- Destroy session
- Redirect ke homepage

---

## 🧪 Testing Checklist

- [ ] ✅ User bisa login dengan email & password yang benar
- [ ] ✅ Login gagal dengan password salah
- [ ] ✅ Login gagal dengan email yang tidak terdaftar
- [ ] ✅ Header menampilkan "LOGIN" saat belum login
- [ ] ✅ Header menampilkan "LOGOUT" dan "MY ACCOUNT" saat sudah login
- [ ] ✅ Halaman `/account` hanya bisa diakses setelah login
- [ ] ✅ Akses `/account` tanpa login redirect ke `/login`
- [ ] ✅ Logout berhasil dan redirect ke homepage
- [ ] ✅ Data user ditampilkan dengan benar di halaman account
- [ ] ✅ Session persistent selama 24 jam

---

## 🐛 Troubleshooting

### Problem: "Data pengguna tidak ditemukan"
**Solution:**
- Pastikan sheet "Users" sudah dibuat di Google Sheets
- Pastikan ada data di sheet tersebut
- Cek apakah service account punya akses ke spreadsheet

### Problem: "Email atau password salah" (padahal sudah benar)
**Solution:**
- Cek apakah password di Google Sheets dalam format hash atau plain text
- Jika hash, pastikan hash-nya valid (bisa regenerate dengan utils/hashPassword.js)
- Pastikan tidak ada spasi di email/password di Google Sheets

### Problem: Session tidak persistent / selalu logout
**Solution:**
- Cek konfigurasi session di app.js
- Pastikan secret key tidak berubah
- Production: gunakan session store (Redis/MongoDB)

### Problem: Cannot access `/account`
**Solution:**
- Pastikan sudah login terlebih dahulu
- Cek browser console untuk error
- Cek server logs

---

## 🔄 Next Steps (Pengembangan Selanjutnya)

### 1. **Booking System Integration**
- [ ] Integrasi dengan Google Sheets "Bookings"
- [ ] Show real upcoming classes di account page
- [ ] Cancel booking functionality
- [ ] Credit deduction saat booking

### 2. **User Registration**
- [ ] Halaman register untuk user baru
- [ ] Auto create entry di Google Sheets

### 3. **Password Management**
- [ ] Forgot password functionality
- [ ] Change password feature
- [ ] Email verification

### 4. **Profile Management**
- [ ] Edit profile information
- [ ] Upload profile picture
- [ ] View booking history

### 5. **Admin Panel**
- [ ] Admin login
- [ ] Manage users
- [ ] Manage classes
- [ ] View all bookings

---

## 📞 Support

Untuk pertanyaan atau issue, silakan kontak developer atau buat issue di repository.

---

**Last Updated:** 19 Desember 2025
**Version:** 1.0.0
