# Homepage Google Sheets Integration

## 📌 Overview

Sistem manajemen konten homepage menggunakan Google Sheets sebagai database. Admin dapat mengupdate konten website langsung dari Google Sheets tanpa perlu mengubah code.

## 🏗️ Arsitektur

```
Google Sheets (Database)
    ↓
utils/googleSheets.js (Data Access Layer)
    ↓
routes/api/homepage.js (API Endpoints)
    ↓
routes/index.js (Homepage Route)
    ↓
views/index.hbs (Frontend View)
```

## 📊 Database Structure

### 9 Sheets yang Dibutuhkan:

1. **Banner** - Hero section dengan background image dan CTA
2. **About** - Tentang studio dan alasan memilih
3. **Teachers** - Daftar instruktur dengan foto
4. **Testimonials** - Review dari klien
5. **Classes** - Jenis-jenis kelas yang ditawarkan
6. **Contact** - Informasi kontak dan lokasi
7. **FAQ** - Frequently Asked Questions
8. **Colors** - Color scheme untuk setiap section
9. **SectionSettings** - Settings untuk setiap section (title, subtitle, visibility)

## 🚀 Quick Start

### 1. Setup Google Sheets

```bash
# Lihat panduan lengkap
cat HOMEPAGE_QUICK_START.md
```

Atau ikuti langkah berikut:
1. Buat Google Spreadsheet baru
2. Buat 9 sheets dengan nama exact: Banner, About, Teachers, Testimonials, Classes, Contact, FAQ, Colors, SectionSettings
3. Share dengan: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
4. Copy Spreadsheet ID dari URL

### 2. Configure Environment

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan update SPREADSHEET_ID
nano .env
```

Atau update langsung di `utils/googleSheets.js`:
```javascript
const SPREADSHEET_ID = 'your_actual_spreadsheet_id';
```

### 3. Jalankan Server

```bash
npm run dev
```

### 4. Test API

```bash
# Test all homepage data
curl http://localhost:3001/api/homepage

# Test specific section
curl http://localhost:3001/api/homepage/banner
curl http://localhost:3001/api/homepage/teachers
```

### 5. Lihat Homepage

Buka browser: `http://localhost:3001/`

## 📁 File Structure

```
PilateStudio/
├── utils/
│   └── googleSheets.js           # Google Sheets API integration
├── routes/
│   ├── index.js                  # Homepage route (updated)
│   └── api/
│       └── homepage.js           # Homepage API endpoints (new)
├── views/
│   └── index.hbs                 # Homepage template (updated with dynamic data)
├── credentials.json              # Google Service Account credentials
├── .env.example                  # Environment variables template
├── HOMEPAGE_SHEETS_SETUP.md      # Detailed database structure
├── HOMEPAGE_QUICK_START.md       # Quick setup guide
└── HOMEPAGE_INTEGRATION.md       # This file
```

## 🔌 API Endpoints

### Get All Homepage Data
```
GET /api/homepage
```

Response:
```json
{
  "success": true,
  "data": {
    "banner": { ... },
    "about": { ... },
    "teachers": [ ... ],
    "testimonials": [ ... ],
    "classes": [ ... ],
    "contact": { ... },
    "faq": [ ... ],
    "colors": { ... },
    "sectionSettings": { ... }
  }
}
```

### Get Specific Section
```
GET /api/homepage/banner
GET /api/homepage/about
GET /api/homepage/teachers
GET /api/homepage/testimonials
GET /api/homepage/classes
GET /api/homepage/contact
GET /api/homepage/faq
GET /api/homepage/colors
```

## 🛠️ Development

### Menambah Section Baru

1. **Buat sheet baru** di Google Sheets
2. **Tambah function** di `utils/googleSheets.js`:
```javascript
async function getNewSectionData() {
  try {
    const rows = await getSheetData('NewSection');
    const data = rowsToObjects(rows);
    return data;
  } catch (error) {
    console.error('Error getting new section data:', error.message);
    return [];
  }
}
```

3. **Update getAllHomepageData()** function
4. **Tambah API endpoint** di `routes/api/homepage.js`
5. **Update view** di `views/index.hbs`

### Update Data Format

Edit langsung di Google Sheets, tidak perlu restart server.

### Caching (Optional)

Untuk performa lebih baik, implementasi caching:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getAllHomepageData() {
  const cacheKey = 'homepage_data';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await fetchDataFromSheets();
  cache.set(cacheKey, data);
  return data;
}
```

## 🎨 Customization

### Mengubah Warna Section

Edit sheet **Colors**:
```
section_name     | primary_color | secondary_color | background_color | text_color
testimonials     | #514f34       | #a05a3f         | #F0E9D6          | #333333
```

### Menyembunyikan Section

Edit sheet **SectionSettings**, set `active` ke `FALSE`:
```
section_name | title        | subtitle | active | order
teachers     | Our Teacher  | ...      | FALSE  | 3
```

### Mengubah Urutan Item

Edit kolom `order` di sheet Teachers, Testimonials, Classes, atau FAQ:
```
id | name           | ... | order | active
1  | LEE CHING CHING| ... | 1     | TRUE
2  | KIM DAVIS      | ... | 2     | TRUE
3  | SHANTI         | ... | 3     | TRUE
```

## 🐛 Troubleshooting

### Error: "Unable to parse range"
**Penyebab**: Nama sheet tidak exact match  
**Solusi**: Pastikan nama sheet exactly: `Banner`, `About`, `Teachers`, dll (case sensitive)

### Error: "The caller does not have permission"
**Penyebab**: Service account belum di-share  
**Solusi**: Share spreadsheet dengan `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`

### Error: "Requested entity was not found"
**Penyebab**: SPREADSHEET_ID salah  
**Solusi**: Copy ulang ID dari URL spreadsheet

### Data Tidak Muncul
**Penyebab**: 
- Header row tidak ada
- Nama kolom tidak match
- Data tidak ada di row 2+

**Solusi**: 
- Pastikan row 1 adalah header
- Check console log untuk error
- Test API endpoint langsung

### Data Lama Masih Muncul
**Penyebab**: Browser cache  
**Solusi**: Hard refresh (Ctrl + Shift + R atau Cmd + Shift + R)

## 📚 Documentation

- **Setup Guide**: [HOMEPAGE_QUICK_START.md](HOMEPAGE_QUICK_START.md)
- **Database Structure**: [HOMEPAGE_SHEETS_SETUP.md](HOMEPAGE_SHEETS_SETUP.md)
- **Google Sheets API**: [Official Docs](https://developers.google.com/sheets/api)

## 🔒 Security Notes

- `credentials.json` sudah ada service account credentials
- Jangan commit `.env` file ke git
- Share spreadsheet hanya dengan service account yang diperlukan
- Set spreadsheet permission ke **Viewer** untuk production (Editor untuk development)

## 🚀 Production Deployment

1. Set environment variable di hosting:
```bash
HOMEPAGE_SPREADSHEET_ID=your_production_spreadsheet_id
NODE_ENV=production
```

2. Ubah permission spreadsheet ke **Viewer**

3. Implementasi caching untuk reduce API calls

4. Monitor Google Sheets API quota:
   - Free: 100 requests per 100 seconds per user
   - Gunakan caching untuk stay within limits

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console log untuk error messages
2. Test API endpoint langsung
3. Verify Google Sheets structure
4. Check service account permissions

---

**Version**: 1.0  
**Created**: January 2026  
**Last Updated**: January 2026
