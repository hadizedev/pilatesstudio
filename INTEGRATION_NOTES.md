# Integrasi home.scss ke Homepage

## Perubahan yang Dilakukan

### 1. **CSS Integration (style.css)**
Telah mengintegrasikan semua style dari `home.scss` ke dalam `public/css/style.css` dengan konversi dari SCSS ke CSS, termasuk:

- **Section Gap Utilities**: Padding responsif untuk section-section
- **Banner Area Styles**: Hero section dengan background image, overlay, dan positioning untuk social buttons
- **About Area**: Layout untuk konten about dengan grid sistem
- **Feature Area**: Card style untuk menampilkan kelas-kelas
- **Team Area**: Hover effect untuk foto instruktur dengan overlay
- **Testimonial Area**: Card testimonial dengan styling yang sesuai
- **CTA Area**: Call-to-action section dengan background image
- **Blog Area**: Card untuk blog posts dengan hover effects
- **Primary Button**: Button dengan arrow icon dan hover effects
- **Responsive Grid System**: Bootstrap-like grid system (container, row, col-*)

### 2. **HTML Structure (views/index.hbs)**
Mengupdate struktur HTML untuk menggunakan class dari home.scss:

#### Banner Section
```html
<section class="banner-area fullscreen relative">
  - Background image dengan overlay
  - Banner content dengan 4 text layers (banner-text1 sampai banner-text4)
  - Banner socials (Instagram & Maps) dengan positioning absolute di kanan
  - Banner chat button (WhatsApp) di bottom right
```

#### About Section
```html
<section class="about-area section-gap">
  - Menggunakan grid system (row & col)
  - About reasons dengan icon dan deskripsi
```

#### Team Section
```html
<section class="team-area section-gap">
  - Single-team cards dengan thumb wrapper
  - Hover overlay effect untuk menampilkan nama dan title
```

#### Testimonials Section
```html
<section class="testomial-area section-gap">
  - Single-testimonial cards dengan quote icon
  - Grid layout responsive (col-lg-4, col-md-6)
```

#### Feature/Classes Section
```html
<section class="feature-area section-gap courses">
  - Single-feature dengan figure dan image
  - Hover effect untuk zoom image
```

#### CTA Section
```html
<section class="cta-one-area">
  - Background dengan overlay
  - Primary button dengan style white untuk contrast
```

### 3. **Layout Update (views/layouts/main.hbs)**
- Menghapus class `container` dari `<main>` element
- Menambahkan Bootstrap 5 CSS & JS
- Menambahkan Flaticon untuk ikon social media
- Setiap section sekarang mengatur container sendiri

### 4. **Button Styles**
Menambahkan dua jenis button:

**Standard Button (.btn)**
- Rounded button dengan padding dan hover effect
- Variant: `.btn-outline`

**Primary Button (.primary-btn)**
- Button dengan arrow icon di kanan
- Hover effect menggerakkan arrow
- Variant: `.primary-btn.white` untuk background gelap

### 5. **Grid System**
Implementasi grid system sederhana mirip Bootstrap:
- `.container` & `.container-fluid`
- `.row` dengan flexbox
- `.col-lg-4`, `.col-lg-6`, `.col-lg-12`, `.col-md-6`
- Responsive breakpoints di 768px (md) dan 992px (lg)

### 6. **Helper Classes**
- `.section-gap`: Padding 120px/80px/60px (desktop/tablet/mobile)
- `.section-gap-bottom`: Padding bottom saja
- `.fullscreen`: Min-height 100vh dengan flexbox center
- `.relative`: Position relative
- `.d-flex`: Display flex
- `.align-items-center`: Align items center
- `.overlay` & `.overlay-bg`: Overlay dengan background transparan

## Dependencies Baru

Ditambahkan ke `views/layouts/main.hbs`:
```html
<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Flaticon untuk ikon -->
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.0.0/uicons-brands/css/uicons-brands.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.0.0/uicons-regular-straight/css/uicons-regular-straight.css'>
```

## Testing

Server berjalan di: `http://localhost:3000`

Untuk menjalankan:
```bash
npm start
```

## Catatan

1. Semua style SCSS telah dikonversi ke CSS biasa
2. Media queries diimplementasikan untuk responsive design
3. Hover effects dan transitions sudah diterapkan
4. Grid system menggunakan flexbox untuk kompatibilitas maksimal
5. Background images menggunakan inline style untuk fleksibilitas

## Next Steps (Opsional)

1. Tambahkan animasi scroll untuk section
2. Implementasi carousel untuk testimonials
3. Tambahkan loading skeleton
4. Optimasi gambar dengan lazy loading
5. Tambahkan Google Fonts untuk typography yang lebih baik
