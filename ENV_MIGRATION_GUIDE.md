# Migrasi Credentials ke Environment Variables

## 📋 Ringkasan

Semua konfigurasi Google Service Account dari `credentials.json` telah dipindahkan ke file `.env` untuk keamanan yang lebih baik.

## 🔐 Keamanan

- File `.env` sudah ada di `.gitignore` sehingga tidak akan di-commit ke repository
- File `credentials.json` juga tetap di `.gitignore` sebagai backup
- Gunakan `.env.example` sebagai template untuk setup di environment lain

## 📁 File yang Diperbarui

Berikut file-file yang telah diperbarui untuk menggunakan environment variables:

1. **app.js** - Menambahkan `require('dotenv').config()` di awal file
2. **routes/api/schedule.js** - Menggunakan credentials dari `.env`
3. **routes/api/login.js** - Menggunakan credentials dari `.env`
4. **routes/api/admin.js** - Menggunakan credentials dari `.env`
5. **utils/googleSheets.js** - Menggunakan credentials dari `.env`
6. **check-user-role.js** - Menggunakan credentials dari `.env`

## 🔧 Environment Variables

File `.env` sekarang berisi:

```bash
# Google Sheets API Configuration
GOOGLE_SHEETS_ID=1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98
HOMEPAGE_SPREADSHEET_ID=1TWRs_Ml-LSqIZpvRDB9klwF_JC9HjWig00iCw1GWnXs

# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_PROJECT_ID=pilatestudio-stella
GOOGLE_PRIVATE_KEY_ID=84e7a55a56a0ca380ce76de5097013077efbdcb3
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=118322761069666876554
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/pilatestudiostella%40pilatestudio-stella.iam.gserviceaccount.com
GOOGLE_UNIVERSE_DOMAIN=googleapis.com
```

## 📦 Package Baru

Telah menginstall package `dotenv` untuk membaca environment variables:

```bash
npm install dotenv
```

## 🚀 Cara Menggunakan

### Setup di Development Environment

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit file `.env` dan isi dengan credentials yang benar dari `credentials.json`

3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

### Setup di Production Environment

1. Buat file `.env` di server production
2. Isi dengan credentials yang sama
3. Pastikan file `.env` memiliki permission yang aman (chmod 600)
4. Restart aplikasi

## 🔄 Struktur Credentials Object

Di setiap file yang menggunakan Google API, credentials dibentuk dari environment variables:

```javascript
require('dotenv').config();

const credentials = {
    type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
};
```

**Catatan:** Private key memerlukan `.replace(/\\n/g, '\n')` untuk mengkonversi escaped newlines menjadi actual newlines.

## ⚠️ Penting

- **JANGAN** commit file `.env` ke repository
- **JANGAN** share file `.env` melalui email atau chat
- **SIMPAN** backup dari credentials di tempat yang aman
- **UPDATE** `.env.example` jika menambahkan environment variables baru
- File `credentials.json` masih bisa disimpan sebagai backup lokal

## ✅ Testing

Untuk memastikan semuanya bekerja dengan baik:

1. Test koneksi Google Sheets:
   ```bash
   node test-sheets.js
   ```

2. Test login:
   ```bash
   npm run dev
   # Buka http://localhost:3001/login
   ```

3. Test schedule API:
   ```bash
   # Buka http://localhost:3001/classes
   # Login dan cek schedule
   ```

## 🔍 Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "GOOGLE_PRIVATE_KEY is undefined"
- Pastikan file `.env` ada di root folder
- Pastikan semua variables sudah diisi dengan benar
- Check apakah ada typo di nama variable

### Error: "Private key is invalid"
- Pastikan private key di wrap dengan double quotes
- Pastikan `\n` characters ada di private key
- Contoh: `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey...\n-----END PRIVATE KEY-----\n"`

### Error: "Cannot authenticate with Google Sheets"
- Verify semua credentials di `.env` benar
- Check apakah spreadsheet sudah dishare dengan service account email
- Test dengan `node check-user-role.js`

## 📝 Notes

- Semua file route API sekarang menggunakan `require('dotenv').config()` di bagian atas
- `app.js` sudah load dotenv pertama kali saat aplikasi start
- Spreadsheet IDs juga bisa di-override melalui environment variables
- Backward compatible: jika env variable tidak ada, akan fallback ke hardcoded value

## 🔐 Best Practices

1. **Different credentials per environment**: Development, Staging, dan Production sebaiknya menggunakan service account yang berbeda
2. **Rotate credentials regularly**: Ganti credentials secara berkala untuk keamanan
3. **Monitor access logs**: Check Google Cloud Console untuk monitoring akses
4. **Use secret management**: Di production, pertimbangkan menggunakan service seperti AWS Secrets Manager atau Google Secret Manager
