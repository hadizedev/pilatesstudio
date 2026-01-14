# Setup Google Sheets untuk Sistem Login

## Struktur Tabel "Users"

Buat sheet baru dengan nama **"Users"** di Google Sheets Anda (ID: 1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98)

### Kolom yang Diperlukan (Header Row):

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| email | password | name | phone | membership_type | membership_status | registered_date | profile_picture | total_credits |

### Deskripsi Kolom:

1. **email** - Email user untuk login (contoh: stellaa@example.com)
2. **password** - Password user (disarankan di-hash menggunakan bcrypt)
3. **name** - Nama lengkap user (contoh: Stellaa)
4. **phone** - Nomor telepon (contoh: 08123456789)
5. **membership_type** - Tipe membership (contoh: Reguler, Premium)
6. **membership_status** - Status membership (Active / Inactive)
7. **registered_date** - Tanggal registrasi (format: DD/MM/YYYY atau YYYY-MM-DD)
8. **profile_picture** - URL foto profil (optional, bisa kosong)
9. **total_credits** - Jumlah kredit kelas yang tersisa (contoh: 10)

### Contoh Data:

```
| email                    | password                                                      | name      | phone        | membership_type | membership_status | registered_date | profile_picture                    | total_credits |
|--------------------------|---------------------------------------------------------------|-----------|--------------|-----------------|-------------------|-----------------|-----------------------------------|---------------|
| stellaa@example.com      | $2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ         | Stellaa   | 08123456789  | Reguler         | Active            | 01/01/2025      | https://example.com/stellaa.jpg   | 10            |
| user@test.com            | password123                                                    | Test User | 08198765432  | Premium         | Active            | 15/12/2024      |                                   | 20            |
```

## Cara Membuat Password Hash

Untuk keamanan, password sebaiknya di-hash. Anda bisa menggunakan script Node.js berikut:

```javascript
const bcrypt = require('bcryptjs');

// Hash password
const password = 'password123';
bcrypt.hash(password, 10, (err, hash) => {
    console.log('Hashed password:', hash);
});
```

Atau gunakan online bcrypt generator seperti: https://bcrypt-generator.com/

## Permissions Google Sheets

Pastikan service account `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com` memiliki akses **Editor** ke spreadsheet Anda.

## Testing

1. Tambahkan minimal 1 user ke tabel Users
2. Restart aplikasi Node.js
3. Coba login menggunakan email dan password yang sudah ditambahkan
4. Setelah login berhasil, Anda akan diarahkan ke halaman `/account`

## Catatan Keamanan

⚠️ **PENTING:**
- Jangan simpan password dalam bentuk plain text di production
- Selalu gunakan bcrypt untuk hash password
- Ganti `secret` di express-session (app.js) dengan string yang aman dan unik
- Aktifkan HTTPS di production dan set `cookie.secure: true`
- Jangan commit credentials ke Git repository
