# Environment Variables Setup

## Quick Start

File `.env` telah dikonfigurasi untuk menyimpan semua credentials Google Service Account dengan aman.

### File Structure
```
.
├── .env                    # Actual credentials (sudah di .gitignore)
├── .env.example           # Template untuk setup
├── credentials.json       # Backup (sudah di .gitignore)
└── ENV_MIGRATION_GUIDE.md # Dokumentasi lengkap
```

### Setup untuk Developer Baru

1. Copy template:
   ```bash
   copy .env.example .env
   ```

2. Isi `.env` dengan credentials dari Google Service Account

3. Install dependencies:
   ```bash
   npm install
   ```

4. Test koneksi:
   ```bash
   node check-user-role.js your_email@example.com
   ```

5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Dokumentasi Lengkap

Lihat [ENV_MIGRATION_GUIDE.md](ENV_MIGRATION_GUIDE.md) untuk:
- Detail migrasi dari credentials.json
- Struktur environment variables
- Troubleshooting
- Best practices

## Security Notes

⚠️ **JANGAN** commit file `.env` ke repository
✅ File `.env` sudah ada di `.gitignore`
✅ Gunakan `.env.example` sebagai template
