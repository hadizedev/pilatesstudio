# Panduan Enable/Disable Section

## ⚠️ PENTING: Perbedaan Field `active`

Ada 2 jenis field `active` yang **BERBEDA FUNGSI**:

### 1. Field `active` di Sheet **SectionSettings** ✅
**FUNGSI:** Mengontrol apakah **seluruh section** ditampilkan atau disembunyikan di homepage.

**Location:** Sheet **SectionSettings**
- Mengatur visibility untuk: Banner, About, Teachers, Testimonials, Classes, Contact, FAQ
- **INI YANG MENGONTROL** apakah section muncul di homepage

### 2. Field `active` di Sheet Individual (Teachers, Testimonials, Classes, FAQ) ✅  
**FUNGSI:** Mengontrol apakah **item individual** dalam list ditampilkan atau disembunyikan.

**Location:** Di masing-masing sheet data
- **Teachers sheet:** Mengatur visibility per teacher
- **Testimonials sheet:** Mengatur visibility per testimonial  
- **Classes sheet:** Mengatur visibility per class
- **FAQ sheet:** Mengatur visibility per FAQ item

### ❌ Sheet yang TIDAK PUNYA field `active`
Sheet berikut **TIDAK MEMILIKI** field `active` karena hanya berisi 1 row data:
- **Banner** - Dikontrol oleh SectionSettings.banner.active
- **About** - Dikontrol oleh SectionSettings.about.active
- **Contact** - Dikontrol oleh SectionSettings.contact.active
- **Colors** - Tidak perlu active (selalu digunakan)

---

## Deskripsi
Fitur ini memungkinkan Anda untuk mengaktifkan atau menonaktifkan section-section di halaman homepage tanpa menghapus data. Section yang dinonaktifkan tidak akan ditampilkan di halaman utama.

## Section yang Dapat Diatur

1. **Banner** - Section banner utama dengan background image
2. **About** - Section tentang Home Pilates Studio
3. **Teachers** - Section daftar instruktur/teacher
4. **Testimonials** - Section testimoni dari client
5. **Classes** - Section daftar kelas yang tersedia
6. **Contact** - Section informasi kontak dan FAQ

## Cara Mengatur Enable/Disable

### Melalui Google Sheets

1. Buka spreadsheet homepage di Google Sheets
2. Buka sheet **SectionSettings**
3. Cari section yang ingin diatur (kolom `section_name`)
4. Edit kolom `active`:
   - `TRUE` = Section aktif (ditampilkan)
   - `FALSE` = Section tidak aktif (disembunyikan)
5. Simpan perubahan
6. Refresh halaman website untuk melihat perubahan

### Format Sheet SectionSettings

| section_name  | title                        | subtitle                                      | active | order |
|---------------|------------------------------|-----------------------------------------------|--------|-------|
| banner        | -                            | -                                             | TRUE   | 1     |
| about         | -                            | -                                             | TRUE   | 2     |
| teachers      | Our Teacher                  | Enjoy the ultimate class experience...        | TRUE   | 3     |
| testimonials  | What Our Client Says         | How our class change them                     | TRUE   | 4     |
| classes       | Our Classes                  | Transform Your Body and Mind...               | TRUE   | 5     |
| contact       | -                            | -                                             | TRUE   | 6     |

## Contoh Penggunaan

### Menonaktifkan Section Banner (Seluruh Section Hilang)
1. Buka sheet **SectionSettings** (BUKAN sheet Banner!)
2. Cari baris dengan `section_name` = `banner`
3. Ubah kolom `active` menjadi `FALSE`
4. Save → Seluruh section banner akan hilang dari homepage

### Menonaktifkan 1 Teacher (Hanya 1 Teacher Hilang)
1. Buka sheet **Teachers**
2. Cari baris teacher yang ingin disembunyikan
3. Ubah kolom `active` menjadi `FALSE`
4. Save → Teacher tersebut tidak muncul, tapi section Teachers tetap ada

### ❌ KESALAHAN UMUM
**SALAH:** Mengubah field `active` di sheet Banner
- ❌ Sheet Banner **TIDAK PUNYA** field `active`
- ❌ Kalau ada, field itu **TIDAK BERFUNGSI**

**BENAR:** Mengubah field `active` di sheet SectionSettings untuk section banner
- ✅ Sheet **SectionSettings**, row `banner`, kolom `active`

---

## Contoh Penggunaan (Lanjutan)

### Menonaktifkan Section Testimonials
1. Buka sheet SectionSettings
2. Cari baris dengan `section_name` = `testimonials`
3. Ubah kolom `active` menjadi `FALSE`
4. Save
5. Section testimonials tidak akan ditampilkan di homepage

### Mengaktifkan Kembali Section
1. Ubah kolom `active` kembali menjadi `TRUE`
2. Section akan muncul kembali di homepage

## Catatan Penting

- Data section yang dinonaktifkan **TIDAK DIHAPUS**, hanya disembunyikan
- Anda dapat mengaktifkan kembali section kapan saja
- Perubahan akan terlihat setelah refresh halaman
- Field `title` dan `subtitle` hanya digunakan untuk section Teachers, Testimonials, dan Classes
- Field `order` menentukan urutan tampilan section (tidak digunakan saat ini karena urutan sudah fixed di template)

## Default State

Secara default, semua section diatur menjadi `TRUE` (aktif). Jika kolom `active` kosong atau tidak ada, section akan tetap ditampilkan untuk backward compatibility.

## Backend Implementation

File yang terlibat:
- [views/index.hbs](views/index.hbs) - Template dengan kondisi enable/disable
- [utils/googleSheets.js](utils/googleSheets.js) - Fungsi `getSectionSettingsData()` yang membaca data dari sheet

### Struktur Data Backend

```javascript
sectionSettings: {
  banner: {
    enabled: true,
    title: null,
    subtitle: null
  },
  about: {
    enabled: true,
    title: null,
    subtitle: null
  },
  teachers: {
    enabled: true,
    title: "Our Teacher",
    subtitle: "Enjoy the ultimate class experience..."
  },
  // ... dan seterusnya
}
```

### Conditional Rendering di Template

Setiap section dibungkus dengan kondisi Handlebars:

```handlebars
{{#if sectionSettings.banner.enabled}}
<section class="banner-area">
  <!-- Konten banner -->
</section>
{{/if}}
```

## Troubleshooting

### Section tidak muncul padahal sudah diset TRUE
1. Pastikan ejaan `section_name` benar (huruf kecil semua)
2. Pastikan kolom `active` berisi `TRUE` (huruf besar semua)
3. Clear cache browser dan refresh
4. Cek console browser untuk error

### Data tidak tersimpan
1. Pastikan Google Sheets API credentials sudah benar
2. Pastikan service account memiliki akses edit ke spreadsheet
3. Cek log server untuk error message

## Tips

- Gunakan fitur ini untuk maintenance section yang sedang dalam pengembangan
- Nonaktifkan section sementara saat data belum lengkap
- Uji tampilan halaman dengan kombinasi section aktif/nonaktif yang berbeda
