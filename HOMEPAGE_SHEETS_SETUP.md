# Homepage Google Sheets Setup Guide

## Overview
Panduan ini menjelaskan cara setup Google Sheets sebagai database untuk homepage settings website Pilate Studio.

## Spreadsheet ID
Setelah membuat Google Spreadsheet, tambahkan ID-nya ke environment variable atau langsung di file `utils/googleSheets.js`:

```
HOMEPAGE_SPREADSHEET_ID=your_spreadsheet_id_here
```

Spreadsheet ID bisa ditemukan di URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

## Sheets Structure

### 1. Sheet: Banner
Nama Sheet: **Banner**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| title_line1 | text | The heaven of | Banner text line 1 |
| title_line2 | text | PILATES | Banner text line 2 (main title) |
| subtitle | text | Restructure your body and mind | Banner subtitle |
| tagline | text | Established since 2015 | Additional tagline |
| background_image | url | https://homepilatesstudio.com/uploads/website/home-banner.webp | Banner background image URL |
| overlay_opacity | number | 0.5 | Overlay opacity (0-1) |
| instagram_url | url | https://www.instagram.com/home_pilates_studio | Instagram profile link |
| location_url | url | https://maps.app.goo.gl/8V99Pyg82etrUswj9 | Google Maps location link |
| whatsapp_number | text | 6287822282068 | WhatsApp number (with country code) |
| whatsapp_text | text | Chat with Admin | WhatsApp button text |

**Sample Data Row:**
```
1 | The heaven of | PILATES | Restructure your body and mind | Established since 2015 | https://homepilatesstudio.com/uploads/website/home-banner.webp | 0.5 | https://www.instagram.com/home_pilates_studio | https://maps.app.goo.gl/8V99Pyg82etrUswj9 | 6287822282068 | Chat with Admin
```

---

### 2. Sheet: About
Nama Sheet: **About**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| title | text | About Home Pilates Studio | Section title |
| title_highlight | text | About | Word to highlight in different color |
| title_color | hex | #514f34 | Main title color |
| title_color_highlight | hex | #a05a3f | Highlighted word color |
| subtitle | text | Reason Why You Need Us | Section subtitle |
| logo_image | url | /images/logo.png | Logo image URL |
| reason_1 | text | Need help on back ache and perfect body posture? | First reason bullet point |
| reason_2 | text | Want to get better balance and strenth of your body core | Second reason bullet point |
| reason_3 | text | Want to try how to refresh the mind and better body composition? | Third reason bullet point |
| reason_4 | text | Trained by certified trainers | Fourth reason bullet point |

**Sample Data Row:**
```
1 | About Home Pilates Studio | About | #514f34 | #a05a3f | Reason Why You Need Us | /images/logo.png | Need help on back ache and perfect body posture? | Want to get better balance and strenth of your body core | Want to try how to refresh the mind and better body composition? | Trained by certified trainers
```

---

### 3. Sheet: Teachers
Nama Sheet: **Teachers**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| name | text | LEE CHING CHING | Teacher name |
| position | text | Head Teacher | Teacher position/title |
| image_url | url | https://homepilatesstudio.com/uploads/users/u-2.webp | Profile image URL |
| order | number | 1 | Display order |
| active | boolean | TRUE | Show/hide teacher |

**Sample Data Rows:**
```
1 | LEE CHING CHING | Head Teacher | https://homepilatesstudio.com/uploads/users/u-2.webp | 1 | TRUE
2 | KIM DAVIS | Expert Teacher - Masterclass | https://homepilatesstudio.com/uploads/users/u-3.webp | 2 | TRUE
3 | SHANTI | Expert Teacher - Masterclass | https://homepilatesstudio.com/uploads/users/u-5.webp | 3 | TRUE
```

---

### 4. Sheet: Testimonials
Nama Sheet: **Testimonials**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| client_name | text | Ellie Damayanti | Client name |
| rating | number | 5 | Rating (1-5 stars) |
| testimonial | text | Tempat pilates yg homey bangettt... | Review text |
| order | number | 1 | Display order |
| active | boolean | TRUE | Show/hide testimonial |

**Sample Data Rows:**
```
1 | Ellie Damayanti | 5 | Tempat pilates yg homey bangettt, suasananya tenang, bersih, alat2 lengkap dan pelatihnya mantab2. Ga salah deh pilih pilates disini 👍👍👍👍 | 1 | TRUE
2 | Tiara Aprilia | 5 | Tempat sangat nyaman, alat2 pilates lengkap dari reformer, wallboard, chair dll. Instruktur juga sangat membantu, beginner sampai ke intermediate semua bisa ikut. Highly recommended | 2 | TRUE
3 | Giovanni | 5 | Very nice place to workout supported by helpful and humble coaches! Experts in their area. Recommended for everyone! | 3 | TRUE
```

---

### 5. Sheet: Classes
Nama Sheet: **Classes**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| class_name | text | Reformer Class | Class name |
| description | text | A machine with a sliding platform and springs | Short description |
| image_url | url | https://homepilatesstudio.com/uploads/website/slider-reformer.webp | Class image URL |
| anchor_link | text | reformer | Hash link for navigation |
| order | number | 1 | Display order |
| active | boolean | TRUE | Show/hide class |

**Sample Data Rows:**
```
1 | Reformer Class | A machine with a sliding platform and springs | https://homepilatesstudio.com/uploads/website/slider-reformer.webp | reformer | 1 | TRUE
2 | Wunda Chair Class | Chair with attach pedal with spring | https://homepilatesstudio.com/uploads/website/slider-wundachair.webp | wundachair | 2 | TRUE
3 | Wallboard Class | A wall-mounted plywood board with springs, handles, foot straps, and a rollback bar | https://homepilatesstudio.com/uploads/website/slider-wallboard.webp | wallboard | 3 | TRUE
4 | Therapy Program Class | Correcting the Curvature of the Spine | https://homepilatesstudio.com/uploads/website/slider-scolio.webp | scolio | 4 | TRUE
5 | Yoga Class | Postures and breathing exercises to promote calm and mindfulness | https://homepilatesstudio.com/uploads/website/slider-yoga.webp | yoga | 5 | TRUE
```

---

### 6. Sheet: Contact
Nama Sheet: **Contact**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| address | text | Jl. Kuta Kencana Tim... | Full address |
| phone | text | 0878-2228-2068 | Phone number |
| mon_fri_hours | text | 07.00 - 19.00 | Monday-Friday hours |
| sat_hours | text | 07.00 - 11.00 | Saturday hours |
| sun_hours | text | Closed | Sunday hours |
| map_embed_url | url | https://www.google.com/maps/embed?pb=... | Google Maps embed URL |
| whatsapp_number | text | 6281393339939 | Contact WhatsApp number |

**Sample Data Row:**
```
1 | Jl. Kuta Kencana Tim. Jl. Singgasana Raya No.2, Mekarwangi, Kec. Bojongloa Kidul, Kota Bandung, Jawa Barat 40236 | 0878-2228-2068 | 07.00 - 19.00 | 07.00 - 11.00 | Closed | https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3960.445005251872... | 6281393339939
```

---

### 7. Sheet: FAQ
Nama Sheet: **FAQ**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| id | number | 1 | Primary key |
| question | text | What is Pilates? | FAQ question |
| answer | text | Pilates is a form of low-impact exercise... | FAQ answer |
| order | number | 1 | Display order |
| active | boolean | TRUE | Show/hide FAQ |

**Sample Data Rows:**
```
1 | What is Pilates? | Pilates is a form of low-impact exercise that aims to strengthen muscles while improving postural alignment and flexibility. | 1 | TRUE
2 | Do I need to bring my own equipment? | No, all equipment is provided at our studio. We have a wide range of Pilates equipment for all types of classes. | 2 | TRUE
3 | Is Pilates suitable for beginners? | Yes, we offer classes for all levels, including beginners. Our instructors are trained to modify exercises to suit individual needs. | 3 | TRUE
4 | What should I wear to class? | Comfortable workout clothes that allow for movement are recommended. Avoid loose clothing that might get caught in equipment. | 4 | TRUE
```

---

### 8. Sheet: Colors
Nama Sheet: **Colors**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| section_name | text | banner | Section identifier |
| primary_color | hex | #514f34 | Main color |
| secondary_color | hex | #a05a3f | Accent color |
| background_color | hex | #000000 | Background color |
| text_color | hex | #ffffff | Text color |

**Sample Data Rows:**
```
banner | #514f34 | #a05a3f | #000000 | #ffffff
about | #514f34 | #a05a3f | #ffffff | #333333
testimonials | #514f34 | #a05a3f | #F0E9D6 | #333333
classes | #514f34 | #a05a3f | #ffffff | #333333
contact | #514f34 | #a05a3f | #ffffff | #333333
```

---

### 9. Sheet: SectionSettings
Nama Sheet: **SectionSettings**

| Column Name | Type | Example Value | Description |
|-------------|------|---------------|-------------|
| section_name | text | teachers | Section identifier |
| title | text | Our Teacher | Section title |
| subtitle | text | Enjoy the ultimate class experience... | Section subtitle |
| active | boolean | TRUE | Show/hide section |
| order | number | 3 | Section display order |

**Sample Data Rows:**
```
banner | Welcome | Transform Your Life | TRUE | 1
about | About Us | Why Choose Us | TRUE | 2
teachers | Our Teacher | Enjoy the ultimate class experience from highly experienced certified teachers! | TRUE | 3
testimonials | What Our Client Says About Us | How our class change them | TRUE | 4
classes | Our Classes | Transform Your Body and Mind with Expert Guidance | TRUE | 5
contact | Contacts |  | TRUE | 6
faq | FAQ | Frequently Asked Questions | TRUE | 7
```

---

## Google Sheets Permissions

1. Buat Google Spreadsheet baru
2. Buat sheets dengan nama yang tepat seperti di atas
3. Share spreadsheet dengan service account email:
   ```
   pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com
   ```
4. Berikan akses **Editor** atau minimal **Viewer**

## Testing API

Setelah setup selesai, test API endpoints:

```bash
# Get all homepage data
GET http://localhost:3001/api/homepage

# Get specific sections
GET http://localhost:3001/api/homepage/banner
GET http://localhost:3001/api/homepage/about
GET http://localhost:3001/api/homepage/teachers
GET http://localhost:3001/api/homepage/testimonials
GET http://localhost:3001/api/homepage/classes
GET http://localhost:3001/api/homepage/contact
GET http://localhost:3001/api/homepage/faq
GET http://localhost:3001/api/homepage/colors
```

## Environment Variables

Tambahkan ke file `.env` (buat jika belum ada):

```env
HOMEPAGE_SPREADSHEET_ID=your_spreadsheet_id_here
PORT=3001
```

## Notes

- **Header Row**: Setiap sheet harus memiliki header row (baris pertama) dengan nama kolom yang exact
- **Boolean Values**: Gunakan `TRUE` atau `FALSE` (huruf besar)
- **Order**: Gunakan angka untuk menentukan urutan tampilan
- **Active**: Set ke `FALSE` untuk menyembunyikan item tanpa menghapus data
- **URL**: Pastikan URL lengkap dan valid
- **Colors**: Gunakan format hex color code dengan `#` prefix

## Troubleshooting

### Error: "Unable to parse range"
- Pastikan nama sheet exact match dengan yang di kode
- Jangan ada spasi extra di nama sheet

### Error: "The caller does not have permission"
- Pastikan service account email sudah di-share akses ke spreadsheet
- Berikan minimal akses **Viewer**

### Error: "Requested entity was not found"
- Pastikan SPREADSHEET_ID benar
- Check URL spreadsheet untuk ID yang tepat

### Data tidak muncul
- Pastikan header row ada dan nama kolom exact match
- Check console untuk error messages
- Test API endpoint langsung di browser atau Postman

## Update Utils GoogleSheets.js

Jangan lupa update SPREADSHEET_ID di file `utils/googleSheets.js` line 12:

```javascript
const SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID';
```

Atau gunakan environment variable yang lebih aman dengan membuat file `.env`:

```env
HOMEPAGE_SPREADSHEET_ID=your_actual_spreadsheet_id
```

Lalu update di `utils/googleSheets.js`:
```javascript
const SPREADSHEET_ID = process.env.HOMEPAGE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';
```

---

**Created:** January 2026  
**Last Updated:** January 2026
