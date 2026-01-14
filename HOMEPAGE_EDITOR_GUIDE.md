# Homepage Visual Editor - User Guide

## Overview
Homepage Visual Editor adalah interface berbasis web yang memungkinkan admin untuk mengedit konten homepage secara langsung tanpa perlu mengakses Google Sheets atau mengubah kode.

## Access

### URL
```
http://localhost:3001/admin/homepage-editor
```

### Requirements
- **Role**: Admin
- **Login**: Harus login sebagai user dengan role "admin"

## Features

### 1. Banner Section Editor
Edit banner section homepage dengan field:
- **Title Line 1**: Baris pertama judul (default: "The heaven of")
- **Title Line 2**: Baris kedua judul - main title (default: "PILATES")
- **Subtitle**: Subtitle banner (default: "Restructure your body and mind")
- **Tagline**: Tagline tambahan (default: "Established since 2015")
- **Background Image URL**: URL gambar background banner
- **Instagram URL**: Link ke Instagram profile
- **Location URL**: Link ke Google Maps location
- **WhatsApp Number**: Nomor WhatsApp (tanpa +, dengan country code)
- **WhatsApp Button Text**: Text tombol WhatsApp

### 2. About Section Editor
Edit about section dengan field:
- **Section Title**: Judul section (default: "About Home Pilates Studio")
- **Highlighted Word**: Kata yang akan di-highlight dengan warna berbeda
- **Title Color**: Warna utama judul (color picker)
- **Highlight Color**: Warna highlight word (color picker)
- **Subtitle**: Subtitle section (default: "Reason Why You Need Us")
- **Logo Image URL**: URL gambar logo
- **Reason 1-4**: 4 bullet point alasan mengapa memilih studio

### 3. Contact Section Editor
Edit contact information dengan field:
- **Address**: Alamat lengkap studio
- **Phone Number**: Nomor telepon studio
- **WhatsApp Number**: Nomor WhatsApp untuk contact
- **Working Hours**:
  - Monday - Friday hours
  - Saturday hours
  - Sunday hours
- **Google Maps Embed URL**: URL embed dari Google Maps

## How to Use

### Step 1: Login as Admin
1. Buka `http://localhost:3001/login`
2. Login dengan credentials admin
3. Navigate ke Admin Dashboard

### Step 2: Access Homepage Editor
1. Di Admin Dashboard, klik button **"Edit Homepage"**
2. Atau langsung akses: `http://localhost:3001/admin/homepage-editor`

### Step 3: Edit Content
1. **Select Tab**: Pilih tab section yang ingin diedit (Banner, About, atau Contact)
2. **Fill Form**: Isi atau edit field yang tersedia
3. **Save**: Klik tombol "Save [Section] Settings"
4. **Success Message**: Alert hijau akan muncul jika berhasil save

### Step 4: Preview Changes
1. Klik button **"Preview Homepage"** di kanan atas
2. Homepage akan terbuka di tab baru
3. Refresh homepage untuk melihat perubahan

## Tips & Tricks

### Keyboard Shortcuts
- **Ctrl+S** (atau Cmd+S di Mac): Quick save form di tab yang aktif

### Unsaved Changes Warning
- Editor akan warning jika ada perubahan yang belum disave saat akan meninggalkan halaman

### Color Picker
- Klik pada color input untuk membuka color picker
- Copy-paste hex color code langsung ke input
- Format: `#RRGGBB` (contoh: `#514f34`)

### URLs
- **Image URLs**: Gunakan full URL (https://...)
- **Google Maps Embed**: Cara mendapatkan:
  1. Buka Google Maps
  2. Cari lokasi studio
  3. Klik "Share" > "Embed a map"
  4. Copy HTML code
  5. Extract URL dari `src="..."`

### WhatsApp Number Format
- ✅ Correct: `6287822282068` (dengan country code, tanpa +)
- ❌ Wrong: `+62-878-2228-2068`
- ❌ Wrong: `0878-2228-2068`

## Data Flow

```
Editor Form → API Endpoint → Google Sheets → Homepage Display
```

1. User mengisi form di editor
2. Submit form → API PUT request ke `/api/homepage/[section]`
3. Backend update Google Sheets via Google Sheets API
4. Homepage membaca data updated dari Google Sheets
5. Changes langsung terlihat di homepage

## Troubleshooting

### Changes tidak muncul di homepage
**Solution:**
1. Refresh homepage dengan hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check console untuk error messages

### Error: "Failed to save settings"
**Possible causes:**
1. **Google Sheets permissions**: Pastikan spreadsheet shared dengan service account
2. **Spreadsheet ID salah**: Check `HOMEPAGE_SPREADSHEET_ID` di `.env` atau `utils/googleSheets.js`
3. **Sheet tidak ada**: Pastikan sheet dengan nama yang exact sudah dibuat
4. **Network error**: Check internet connection

### Error: "Failed to load homepage data"
**Solution:**
1. Check Google Sheets permissions
2. Verify Spreadsheet ID
3. Ensure all sheets exist (Banner, About, Contact, etc.)
4. Check server logs untuk detail error

### Color picker tidak muncul
**Solution:**
- Gunakan browser modern (Chrome, Firefox, Edge)
- Update browser ke versi terbaru

## API Endpoints

Editor menggunakan endpoints berikut:

### GET Endpoints (Read)
```
GET /api/homepage          - Get all homepage data
GET /api/homepage/banner   - Get banner data
GET /api/homepage/about    - Get about data
GET /api/homepage/contact  - Get contact data
```

### PUT Endpoints (Update)
```
PUT /api/homepage/banner   - Update banner data
PUT /api/homepage/about    - Update about data
PUT /api/homepage/contact  - Update contact data
```

## Security

### Authentication
- **Required**: User harus login dengan role "admin"
- **Middleware**: `requireAdmin` di routes
- **Session**: Express session dengan secure cookies

### Authorization
- Hanya admin yang bisa akses `/admin/homepage-editor`
- Non-admin akan redirect ke login page
- Session expires setelah 24 jam

### Data Validation
- Client-side: HTML5 form validation
- Server-side: Express.js validation (bisa ditambahkan)
- Google Sheets API: Type validation

## Best Practices

### Content Guidelines
1. **Keep it concise**: Short, clear text lebih baik
2. **Use high-quality images**: Minimal 1920x1080px untuk banner
3. **Optimize images**: Compress images sebelum upload
4. **Test on mobile**: Preview di mobile devices
5. **Consistent branding**: Gunakan brand colors

### Workflow
1. **Draft changes** di text editor dulu
2. **Batch updates**: Edit semua field sekaligus sebelum save
3. **Preview first**: Selalu preview sebelum publish
4. **Backup**: Screenshot atau note down old values sebelum edit
5. **Test links**: Pastikan semua URL works

## Limitations

### Current Version
- ✅ Edit: Banner, About, Contact sections
- ❌ Not yet: Teachers, Testimonials, Classes, FAQ (managed via Google Sheets)
- ❌ Not yet: Image upload (gunakan external hosting)
- ❌ Not yet: Preview mode (harus buka homepage di tab baru)

### Future Enhancements
- [ ] Inline image upload
- [ ] Live preview panel
- [ ] Undo/redo functionality
- [ ] Version history
- [ ] Bulk operations
- [ ] Media library
- [ ] WYSIWYG editor for text fields

## Support

### Documentation
- **Setup Guide**: [HOMEPAGE_QUICK_START.md](HOMEPAGE_QUICK_START.md)
- **Database Structure**: [HOMEPAGE_SHEETS_SETUP.md](HOMEPAGE_SHEETS_SETUP.md)
- **Integration Guide**: [HOMEPAGE_INTEGRATION.md](HOMEPAGE_INTEGRATION.md)

### Need Help?
1. Check server console logs
2. Check browser console (F12)
3. Verify Google Sheets setup
4. Review API responses

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Access Level**: Admin Only
