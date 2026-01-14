# API Integration Guide

## Overview
Dokumentasi ini menjelaskan cara mengintegrasikan frontend dengan backend API untuk sistem schedule dan booking.

---

## API Endpoints

### 1. Get Schedule by Date
**Endpoint:** `GET /api/schedule?date=YYYY-MM-DD`

**Authentication:** Required (Session-based)

**Parameters:**
- `date` (query, required): Tanggal dalam format `YYYY-MM-DD`

**Response:**
```json
{
  "schedule": [
    {
      "sid": "11345",
      "stime": "2025-12-19 07:00:00",
      "strain": "3",
      "sclass": "9",
      "smember": "[\"75\",\"141\"]",
      "sgender": "F",
      "sallday": "0",
      "snotes": "Reformer \n(Basic/Intermediate)",
      "bid": "0",
      "flag": "0",
      "cuser": "ERIKA0109",
      "cpid": "controller\\api\\adminservice::savecontent",
      "ctime": "2025-12-10 16:43:48",
      "muser": "ERIKA0109",
      "mpid": "controller\\api\\adminservice::savecontent",
      "mtime": "2025-12-18 16:01:51",
      "aname": "Kim Davis",
      "aimg": "u-3.webp",
      "cname": "Reguler",
      "cdur": "60",
      "ccap": "6",
      "scap": 2,
      "btnclass": "enabled",
      "bookclass": "",
      "booked": "0"
    }
  ]
}
```

**Example:**
```javascript
const response = await fetch('/api/schedule?date=2025-12-19');
const data = await response.json();
console.log(data.schedule);
```

---

### 2. Get Booking History
**Endpoint:** `GET /api/schedule/history`

**Authentication:** Required (Session-based)

**Response:**
```json
{
  "schedule": [
    {
      "sid": "11353",
      "stime": "2025-12-19 17:00:00",
      "snotes": "Reformer \n(Beginner)",
      "aname": "Kim Davis",
      "aimg": "u-3.webp",
      "cname": "Reguler",
      "cdur": "60",
      "ccap": "6",
      "scap": 6,
      "sgender": "",
      "booked": "1",
      "bookclass": "booked",
      "jsonmember": "[{\"aid\": 1143, \"aname\": \"Stellaa\", \"aimg\": \"\"}]"
    }
  ]
}
```

**Example:**
```javascript
const response = await fetch('/api/schedule/history');
const data = await response.json();
console.log(data.schedule);
```

---

### 3. Book a Class
**Endpoint:** `POST /api/schedule/book`

**Authentication:** Required (Session-based)

**Request Body:**
```json
{
  "sid": "11345"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Class booked successfully"
}
```

**Response (Error):**
```json
{
  "error": "Class is full"
}
```

**Example:**
```javascript
const response = await fetch('/api/schedule/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sid: '11345' })
});
const result = await response.json();
```

---

### 4. Cancel Booking
**Endpoint:** `POST /api/schedule/cancel`

**Authentication:** Required (Session-based)

**Request Body:**
```json
{
  "sid": "11345"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Response (Error):**
```json
{
  "error": "You have not booked this class"
}
```

**Example:**
```javascript
const response = await fetch('/api/schedule/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sid: '11345' })
});
const result = await response.json();
```

---

## Frontend Implementation

### JavaScript Variables
```javascript
// Base API URL
const API_BASE = '/api';

// Current state
let selectedDate = new Date(2025, 11, 19); // December 19, 2025
let currentTab = 'upcoming'; // 'upcoming' or 'history'
let classesData = []; // Array of schedule objects
```

### Fetch Schedule Function
```javascript
async function fetchSchedule(date, isHistory = false) {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const endpoint = isHistory 
      ? `${API_BASE}/schedule/history` 
      : `${API_BASE}/schedule?date=${dateStr}`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.schedule) {
      classesData = data.schedule;
      renderClasses();
      updateStatusCard();
    }
  } catch (error) {
    console.error('Error fetching schedule:', error);
    // Handle error or use fallback data
  }
}
```

### Render Classes Function
```javascript
function renderClasses() {
  const listContainer = document.getElementById('classes-list');
  listContainer.innerHTML = '';
  
  classesData.forEach((schedule) => {
    // Parse schedule data
    const scheduleDate = new Date(schedule.stime);
    const timeStr = scheduleDate.toTimeString().substring(0, 5);
    
    // Create card HTML
    const card = document.createElement('div');
    card.innerHTML = `
      <div class="class-card">
        <!-- Time badge -->
        <div class="time-badge">${timeStr}</div>
        
        <!-- Class info -->
        <h5>${schedule.cname} ${schedule.snotes}</h5>
        <p>Instructor: ${schedule.aname}</p>
        <p>Slots: ${schedule.scap}/${schedule.ccap}</p>
        
        <!-- Book button -->
        ${schedule.booked === "1" 
          ? '<button class="cancel-btn" data-sid="' + schedule.sid + '">Cancel</button>'
          : '<button class="book-btn" data-sid="' + schedule.sid + '">Book Now</button>'}
      </div>
    `;
    
    listContainer.appendChild(card);
  });
  
  // Add event listeners
  attachBookingListeners();
}
```

### Booking Handlers
```javascript
async function handleBookClass(sid) {
  if (!confirm('Are you sure you want to book this class?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/schedule/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Class booked successfully!');
      fetchSchedule(selectedDate, currentTab === 'history');
    } else {
      alert(result.error || 'Failed to book class');
    }
  } catch (error) {
    console.error('Error booking class:', error);
    alert('Failed to book class. Please try again.');
  }
}

async function handleCancelBook(sid) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/schedule/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Booking cancelled successfully!');
      fetchSchedule(selectedDate, currentTab === 'history');
    } else {
      alert(result.error || 'Failed to cancel booking');
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Failed to cancel booking. Please try again.');
  }
}
```

### Tab Switching
```javascript
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    currentTab = this.dataset.tab; // 'upcoming' or 'history'
    
    // Update UI
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    // Fetch appropriate data
    fetchSchedule(selectedDate, currentTab === 'history');
  });
});
```

### Calendar Date Selection
```javascript
dateDiv.onclick = () => {
  selectedDate = date;
  renderCalendar();
  updateCalendarTitle();
  
  // Fetch schedule for new date
  fetchSchedule(selectedDate, currentTab === 'history');
};
```

---

## Testing Guide

### 1. Setup Google Sheets
Follow instructions in `GOOGLE_SHEETS_DATABASE_DESIGN.md` to create and populate sheets.

### 2. Test API Endpoints

**Using Browser DevTools:**
```javascript
// Test get schedule
fetch('/api/schedule?date=2025-12-19')
  .then(r => r.json())
  .then(data => console.log(data));

// Test book class (replace sid)
fetch('/api/schedule/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sid: '11345' })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

**Using cURL:**
```bash
# Get schedule
curl http://localhost:3001/api/schedule?date=2025-12-19

# Book class
curl -X POST http://localhost:3001/api/schedule/book \
  -H "Content-Type: application/json" \
  -d '{"sid":"11345"}'
```

### 3. Test Frontend Integration

1. Login to account page
2. Verify classes load for current date
3. Select different date - classes should update
4. Click "Book Now" - should book class and refresh
5. Switch to History tab - should show past bookings
6. Click "Cancel Book" - should cancel and refresh

---

## Error Handling

### Common Errors

**401 Unauthorized:**
```json
{ "error": "Unauthorized" }
```
**Solution:** User not logged in. Redirect to login page.

**400 Bad Request:**
```json
{ "error": "Date parameter is required" }
```
**Solution:** Check API call includes required parameters.

**404 Not Found:**
```json
{ "error": "Schedule not found" }
```
**Solution:** Schedule ID doesn't exist. Refresh schedule list.

**500 Internal Server Error:**
```json
{ "error": "Failed to fetch schedule" }
```
**Solution:** Check Google Sheets connection and permissions.

---

## Performance Tips

1. **Cache schedule data** for 1-2 minutes to reduce API calls
2. **Show loading spinner** during fetch operations
3. **Implement pagination** for history with many bookings
4. **Debounce** date selection to prevent rapid API calls
5. **Use WebSockets** for real-time slot updates (optional)

---

## Security Considerations

1. **Session validation** on every API call
2. **Rate limiting** to prevent booking spam
3. **Input sanitization** for all user inputs
4. **CSRF protection** for POST requests
5. **HTTPS only** in production

---

## Next Steps

1. ✅ Create Google Sheets database structure
2. ✅ Implement API endpoints
3. ✅ Update frontend JavaScript
4. ⏳ Populate sample data in Google Sheets
5. ⏳ Test booking flow end-to-end
6. ⏳ Add error messages and loading states
7. ⏳ Deploy to production

---

## Support

For issues or questions, check:
- `GOOGLE_SHEETS_DATABASE_DESIGN.md` - Database structure
- `FIX_AUTH_ERROR.md` - Google Sheets authorization
- `LOGIN_IMPLEMENTATION_DOCS.md` - Authentication setup
