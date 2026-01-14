# 🚀 Quick Start - Login System

## ⚡ Setup Cepat (5 Menit)

### 1. Setup Google Sheets

1. Buka Google Sheets dengan ID: `1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98`
2. Buat sheet baru dengan nama: **Users**
3. Import file `sample_users_data.csv` atau copy-paste data berikut:

```csv
email,password,name,phone,membership_type,membership_status,registered_date,profile_picture,total_credits
test@pilatestudio.com,$2b$10$b8Snvgo367vuKvtUL34cQ.JCMumICcnrxtn2XA3/s1PuUKoNnu.RS,Test User,08123456789,Reguler,Active,19/12/2025,,10
stellaa@example.com,stellaa123,Stellaa,08198765432,Premium,Active,01/12/2025,https://i.pravatar.cc/150?img=1,20
admin@pilatestudio.com,admin123,Admin User,08112345678,Premium,Active,15/11/2025,https://i.pravatar.cc/150?img=5,50
```

### 2. Start Server

```bash
npm start
```

atau

```bash
node app.js
```

### 3. Test Login

Buka browser: `http://localhost:3001/login`

**Test Accounts:**

| Email | Password | Description |
|-------|----------|-------------|
| `test@pilatestudio.com` | `test123` | User dengan password hash (recommended) |
| `stellaa@example.com` | `stellaa123` | User dengan plain password |
| `admin@pilatestudio.com` | `admin123` | Admin user |

---

## 📱 User Flow

1. **Homepage** → Klik "LOGIN" di header
2. **Login Page** → Masukkan email & password → Klik "Sign In"
3. **Account Page** → Lihat profil, booking, dll
4. **Logout** → Klik "LOGOUT" di header

---

## 🔑 Generate Password Hash

Untuk membuat password hash baru:

```bash
node utils/hashPassword.js yourpassword
```

Copy hash yang dihasilkan ke kolom password di Google Sheets.

---

## 📚 Dokumentasi Lengkap

- **Setup Google Sheets:** [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
- **Implementasi Detail:** [LOGIN_IMPLEMENTATION_DOCS.md](LOGIN_IMPLEMENTATION_DOCS.md)
- **Integration Notes:** [INTEGRATION_NOTES.md](INTEGRATION_NOTES.md)

---

## ✅ Features

- ✅ Login dengan email & password
- ✅ Integrasi Google Sheets untuk database users
- ✅ Session management (24 jam)
- ✅ Password hashing dengan bcrypt
- ✅ Protected routes (authentication middleware)
- ✅ User account/dashboard page
- ✅ Logout functionality
- ✅ Conditional header (login/logout)

---

## 🆘 Troubleshooting

**Login gagal?**
- Pastikan email & password sesuai dengan data di Google Sheets
- Cek console browser (F12) untuk error
- Cek terminal server untuk error logs

**Session tidak persistent?**
- Clear browser cookies
- Restart server
- Cek konfigurasi session di app.js

**"Data pengguna tidak ditemukan"?**
- Pastikan sheet "Users" sudah dibuat
- Pastikan ada data di sheet
- Pastikan service account punya akses ke spreadsheet

---

## 📞 Need Help?

Lihat dokumentasi lengkap atau hubungi developer.
