# Google Sheets Database Design

## Overview
Database structure untuk sistem Pilates Studio menggunakan Google Sheets sebagai data storage.

## Spreadsheet Structure

### 1. Sheet: Users
Menyimpan data user/member yang terdaftar.

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | User ID (auto increment) | 1143 |
| B | email | String | Email address (unique) | stella@example.com |
| C | password | String | Hashed password (bcrypt) | $2a$10$... |
| D | name | String | Full name | Stellaa |
| E | phone | String | Phone number | +62812345678 |
| F | membership_type | String | Type: Regular/Premium | Regular |
| G | membership_status | String | Status: Active/Inactive/Expired | Active |
| H | registered_date | Date | Registration date | 2025-01-15 |
| I | profile_picture | String | Image filename | u-1143.webp |
| J | total_credits | Number | Available class credits | 10 |
| K | gender | String | M/F | F |
| L | date_of_birth | Date | Birth date | 1990-05-15 |

**Sample Data:**
```
1143 | stella@example.com | $2a$10$hashed... | Stellaa | +62812345678 | Regular | Active | 2025-01-15 | u-1143.webp | 10 | F | 1990-05-15
```

---

### 2. Sheet: Trainers
Menyimpan data instruktur/trainer.

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | Trainer ID | 3 |
| B | name | String | Trainer name | Kim Davis |
| C | email | String | Email address | kim@pilatestudio.com |
| D | phone | String | Phone number | +62812345678 |
| E | specialization | String | Specialization area | Reformer, Wall Board |
| F | image | String | Profile image filename | u-3.webp |
| G | bio | Text | Short biography | Certified Pilates... |
| H | status | String | Active/Inactive | Active |
| I | joined_date | Date | Join date | 2024-01-10 |

**Sample Data:**
```
3 | Kim Davis | kim@pilatestudio.com | +62812345678 | Reformer, Wall Board | u-3.webp | Certified Pilates instructor... | Active | 2024-01-10
```

---

### 3. Sheet: Classes
Menyimpan master data tipe kelas.

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | Class ID | 9 |
| B | name | String | Class name | Reguler |
| C | duration | Number | Duration in minutes | 60 |
| D | capacity | Number | Max participants | 6 |
| E | description | Text | Class description | Basic to intermediate... |
| F | price | Number | Price per session | 150000 |
| G | credits_required | Number | Credits needed to book | 1 |
| H | status | String | Active/Inactive | Active |

**Sample Data:**
```
9 | Reguler | 60 | 6 | Basic to intermediate pilates reformer class | 150000 | 1 | Active
10 | Happy Hour | 60 | 6 | Discounted beginner class | 100000 | 1 | Active
12 | Yoga | 60 | 12 | Vinyasa yoga class | 120000 | 1 | Active
```

---

### 4. Sheet: Schedules
Menyimpan jadwal kelas yang akan datang.

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | Schedule ID (sid) | 11345 |
| B | schedule_time | DateTime | Class date & time | 2025-12-19 07:00:00 |
| C | trainer_id | Number | Trainer ID (foreign key) | 3 |
| D | class_id | Number | Class ID (foreign key) | 9 |
| E | members | JSON String | Array of booked member IDs | ["75","141"] |
| F | gender_restriction | String | F=Female only, M=Male only, ""=All | F |
| G | all_day | Boolean | 0=No, 1=Yes | 0 |
| H | notes | Text | Additional notes/level | Reformer \n(Basic/Intermediate) |
| I | booking_id | Number | Related booking reference | 0 |
| J | flag | Number | Status flag | 0 |
| K | created_user | String | Creator username | ERIKA0109 |
| L | created_pid | String | Creator process ID | controller\api\adminservice::savecontent |
| M | created_time | DateTime | Creation timestamp | 2025-12-10 16:43:48 |
| N | modified_user | String | Last modifier username | ERIKA0109 |
| O | modified_pid | String | Modifier process ID | controller\api\adminservice::savecontent |
| P | modified_time | DateTime | Last modified timestamp | 2025-12-18 16:01:51 |
| Q | status | String | Active/Cancelled/Completed | Active |

**Sample Data:**
```
11345 | 2025-12-19 07:00:00 | 3 | 9 | ["75","141"] | F | 0 | Reformer \n(Basic/Intermediate) | 0 | 0 | ERIKA0109 | controller\api\adminservice::savecontent | 2025-12-10 16:43:48 | ERIKA0109 | controller\api\adminservice::savecontent | 2025-12-18 16:01:51 | Active
```

---

### 5. Sheet: Bookings
Menyimpan history booking member (untuk tracking dan history).

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | Booking ID | 1 |
| B | schedule_id | Number | Schedule ID (foreign key) | 11345 |
| C | user_id | Number | User ID (foreign key) | 1143 |
| D | booking_time | DateTime | When booking was made | 2025-12-18 10:30:00 |
| E | status | String | Confirmed/Cancelled/Completed | Confirmed |
| F | attended | Boolean | 0=No, 1=Yes | 0 |
| G | cancelled_time | DateTime | Cancellation timestamp | null |
| H | notes | Text | Booking notes | null |
| I | payment_status | String | Paid/Pending/Refunded | Paid |
| J | credits_used | Number | Credits deducted | 1 |

**Sample Data:**
```
1 | 11345 | 1143 | 2025-12-18 10:30:00 | Confirmed | 0 | null | null | Paid | 1
2 | 11353 | 1143 | 2025-12-19 09:53:53 | Confirmed | 0 | null | null | Paid | 1
```

---

### 6. Sheet: Transactions (Optional)
Menyimpan history transaksi pembelian credits.

| Column | Field Name | Data Type | Description | Example |
|--------|-----------|-----------|-------------|---------|
| A | id | Number | Transaction ID | 1 |
| B | user_id | Number | User ID | 1143 |
| C | transaction_time | DateTime | Transaction timestamp | 2025-12-15 14:20:00 |
| D | amount | Number | Payment amount | 500000 |
| E | credits_purchased | Number | Credits purchased | 5 |
| F | payment_method | String | Payment method | Transfer Bank |
| G | payment_status | String | Paid/Pending/Failed | Paid |
| H | invoice_number | String | Invoice reference | INV-2025-001 |

---

## Data Relationships

```
Users (1) ----< (M) Bookings (M) >---- (1) Schedules
                                           |
                                           |
                                    +------+------+
                                    |             |
                              Trainers (1)   Classes (1)
```

---

## API Endpoints Required

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user/profile` - Get user profile

### Schedule
- `GET /api/schedule?date=YYYY-MM-DD` - Get upcoming schedules for specific date
- `GET /api/schedule/history` - Get user's booking history
- `POST /api/schedule/book` - Book a class
- `POST /api/schedule/cancel` - Cancel a booking

### Classes
- `GET /api/classes` - Get all class types
- `GET /api/classes/:id` - Get specific class details

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get specific trainer details

---

## Google Sheets Setup Instructions

1. **Create a new Google Spreadsheet** with name: "PilateStudio Database"

2. **Create 6 sheets** dengan nama:
   - Users
   - Trainers
   - Classes
   - Schedules
   - Bookings
   - Transactions

3. **Setup Headers** - Baris pertama setiap sheet harus berisi nama kolom sesuai tabel di atas

4. **Share with Service Account**:
   - Klik "Share" button
   - Add email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
   - Give "Editor" permission

5. **Copy Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   ```

6. **Update .env file**:
   ```
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   USERS_SHEET=Users
   TRAINERS_SHEET=Trainers
   CLASSES_SHEET=Classes
   SCHEDULES_SHEET=Schedules
   BOOKINGS_SHEET=Bookings
   ```

---

## Query Patterns

### Get Upcoming Schedules for Date
```javascript
// Filter schedules where:
// - schedule_time = specific date
// - schedule_time >= current time
// - status = 'Active'
// Then JOIN with Trainers and Classes to get complete data
```

### Get User Booking History
```javascript
// Filter bookings where:
// - user_id = current user
// - status = 'Confirmed' OR 'Completed'
// - schedule_time < current time
// Then JOIN with Schedules, Trainers, Classes
```

### Check if User Already Booked
```javascript
// Check Schedules.members array contains user_id
// OR
// Check Bookings table for schedule_id + user_id + status='Confirmed'
```

---

## Notes

1. **JSON String Storage**: Field `members` di Schedules menggunakan JSON string karena Google Sheets tidak support array. Contoh: `["75","141","1143"]`

2. **Date Format**: Gunakan format `YYYY-MM-DD HH:MM:SS` untuk konsistensi

3. **ID Generation**: Untuk auto-increment ID, gunakan formula di Google Sheets atau generate di backend

4. **Performance**: Untuk data yang besar, consider indexing dengan membuat sheet terpisah untuk lookup

5. **Backup**: Set up automatic backup untuk Google Sheets secara regular

6. **Validation**: Implement data validation rules di Google Sheets untuk ensure data quality
