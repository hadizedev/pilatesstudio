# Pilate Studio Web Application

Aplikasi web untuk Pilate Studio menggunakan Node.js, Express, dan Handlebars (HBS).

## Struktur Proyek

```
PilateStudio/
├── app.js                 # File server utama
├── package.json           # Dependencies dan scripts
├── .gitignore            # File yang diabaikan Git
├── routes/               # Route handlers
│   └── index.js          # Routes utama
├── views/                # Template Handlebars
│   ├── layouts/
│   │   └── main.hbs      # Layout utama
│   ├── partials/
│   │   ├── header.hbs    # Header/Navbar
│   │   └── footer.hbs    # Footer
│   ├── index.hbs         # Halaman home
│   ├── about.hbs         # Halaman tentang
│   ├── classes.hbs       # Halaman kelas
│   └── contact.hbs       # Halaman kontak
└── public/               # Static files
    ├── css/
    │   └── style.css     # Stylesheet utama
    └── js/
        └── script.js     # JavaScript utama
```

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan aplikasi:
```bash
npm start
```

atau untuk development dengan auto-reload:
```bash
npm run dev
```

3. Buka browser dan akses:
```
http://localhost:3000
```

## Fitur

### User Features
- ✅ Express.js sebagai backend framework
- ✅ Handlebars (HBS) sebagai template engine
- ✅ Layout system dengan partials (header & footer)
- ✅ Responsive design
- ✅ Static file serving (CSS & JavaScript)
- ✅ Multiple pages (Home, About, Classes, Contact)
- ✅ Modern UI dengan animasi
- ✅ SEO-friendly structure
- ✅ **User Login & Authentication**
- ✅ **User Account Page**
- ✅ **Google Sheets Integration** untuk database
- ✅ **Schedule Booking System**
- ✅ **Session Management**

### Admin Features 🆕
- ✅ **Admin Dashboard** - Comprehensive data overview
- ✅ **Role-based Access Control** - Admin-only sections
- ✅ **Data Tables** - View all Users, Bookings, Classes, Transactions, Schedules, Trainers
- ✅ **Statistics Cards** - Quick insights and metrics
- ✅ **Search & Filter** - DataTables integration for easy data management
- ✅ **Real-time Data** - Data fetched from Google Sheets

## Pages

### Public Pages
- **Home (/)** - Landing page dengan overview studio
- **About (/about)** - Informasi tentang studio
- **Classes (/classes)** - Daftar kelas yang tersedia
- **Contact (/contact)** - Informasi kontak dan form

### Protected Pages
- **Login (/login)** - User authentication
- **Account (/account)** - User dashboard (requires login)
- **Admin Dashboard (/admin)** - Admin-only dashboard (requires admin role)

## Teknologi

- **Backend:** Node.js, Express.js
- **Template Engine:** Handlebars (express-handlebars)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5
- **Database:** Google Sheets API
- **Authentication:** Express Session
- **Password Hashing:** bcryptjs
- **Data Tables:** DataTables (jQuery plugin)
- **Icons:** Font Awesome 6
- **Development:** Nodemon

## Setup & Configuration

### 1. Basic Setup
```bash
npm install
npm start
```

### 2. Google Sheets Integration
Lihat dokumentasi lengkap di:
- `GOOGLE_SHEETS_SETUP.md` - Setup Google Sheets API
- `API_INTEGRATION_GUIDE.md` - Integration guide
- `SETUP_CHECKLIST.md` - Complete setup checklist

### 3. Admin Dashboard Setup 🆕
Lihat dokumentasi lengkap di:
- **`ADMIN_IMPLEMENTATION_SUMMARY.md`** - Overview lengkap
- **`ADMIN_DASHBOARD_SETUP.md`** - Detailed setup guide
- **`ADMIN_QUICK_REFERENCE.md`** - Quick reference
- **`UPDATE_GOOGLE_SHEETS.md`** - ⚠️ IMPORTANT: Update sheets dengan kolom role

**Quick Start untuk Admin:**
1. Buka Google Sheets → Sheet "Users"
2. Tambahkan kolom `role` (kolom M)
3. Set user dengan role `admin`
4. Login dengan user admin
5. Akses `/admin` untuk dashboard

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `GET /logout` - User logout

### Schedule
- `GET /api/schedule` - Get available schedules
- `POST /api/schedule/book` - Book a class

### Admin (Protected) 🆕
- `GET /api/admin/data` - Get all data for admin dashboard (admin only)

## Kustomisasi

- Ubah style di `public/css/style.css`
- Tambah JavaScript di `public/js/script.js`
- Edit layout utama di `views/layouts/main.hbs`
- Modifikasi header/footer di `views/partials/`
- Tambah routes baru di `routes/`
