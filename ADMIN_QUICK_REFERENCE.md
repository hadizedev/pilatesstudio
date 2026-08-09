# Quick Reference - Admin Dashboard

## 🚀 Cara Cepat Setup Admin

### 1. Update Google Sheets
Tambahkan kolom `role` di sheet Users (kolom M):

| ... | date_of_birth | role |
|-----|---------------|------|
| ... | 1990-05-15    | admin |
| ... | 1988-03-22    | user |

### 2. Set Admin User
Untuk user Stella (ID 1143):
```
Kolom M (role): admin
```

### 3. Login & Access
1. Login dengan email: `stella@example.com`
2. Setelah login, klik "ADMIN DASHBOARD" di header
3. Atau akses langsung: `http://localhost:3001/admin`

## 📊 Fitur Dashboard

### Statistics Cards
- Total Users
- Total Bookings  
- Total Classes
- Total Transactions
- Total Schedules
- Total Trainers

### Data Tables
**6 Tab dengan data lengkap:**
1. **Users** - Semua member
2. **Bookings** - Booking history
3. **Classes** - Daftar kelas
4. **Transactions** - Payment history
5. **Schedules** - Jadwal kelas
6. **Trainers** - Data instruktur

**Fitur Tabel:**
- 🔍 Search
- 🔄 Sort by column
- 📄 Pagination
- 🎨 Color-coded status

## 🔐 Security

### Admin Access
✅ Role = "admin" → Can access dashboard  
❌ Role = "user" atau kosong → Access denied

### URL Protection
- `/admin` → Protected by `requireAdmin` middleware
- Non-admin user → Error 403
- Not logged in → Redirect to login

## 🎯 Testing Checklist

- [ ] Update Google Sheets dengan kolom `role`
- [ ] Set minimal 1 user dengan role `admin`
- [ ] Login sebagai admin → Dashboard harus muncul
- [ ] Login sebagai user biasa → Dashboard TIDAK muncul
- [ ] Akses `/admin` tanpa login → Redirect ke `/login`
- [ ] Semua 6 tabel menampilkan data dengan benar

## 📁 Files Modified

```
middleware/auth.js         ✅ Added requireAdmin
routes/api/admin.js        ✅ New API endpoint
routes/api/login.js        ✅ Added role field
routes/index.js            ✅ Added /admin route
app.js                     ✅ Registered admin API
views/admin.hbs            ✅ Dashboard UI
views/error.hbs            ✅ Error page
views/partials/header.hbs  ✅ Admin link
database_sample/Users.csv  ✅ Added role column
```

## 🆘 Common Issues

### "Akses Ditolak"
→ Check role in Google Sheets is "admin"  
→ Logout and login again

### Dashboard tidak muncul
→ Clear cache  
→ Check browser console for errors

### No data in tables
→ Verify Google Sheets API access  
→ Check service account permissions

---

**For detailed documentation, see:** `ADMIN_DASHBOARD_SETUP.md`
