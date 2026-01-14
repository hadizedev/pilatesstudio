# Database Sample Files - Import Guide

## 📁 Files Overview

Folder ini berisi 6 file CSV yang siap di-import ke Google Sheets atau Excel:

1. **Users.csv** - Data member/pengguna (10 users)
2. **Trainers.csv** - Data instruktur (6 trainers)
3. **Classes.csv** - Tipe kelas (3 classes)
4. **Schedules.csv** - Jadwal kelas (21 schedules)
5. **Bookings.csv** - History booking (20 bookings)
6. **Transactions.csv** - History transaksi (12 transactions)

---

## 🔧 Import to Google Sheets

### Method 1: Manual Import (Recommended)

1. **Create New Spreadsheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create new spreadsheet
   - Rename to "PilateStudio Database"

2. **Import Each CSV File:**
   
   **For Users Sheet:**
   - Click "+ Add sheet" (bottom left)
   - Rename sheet to "Users"
   - Go to `File > Import > Upload`
   - Select `Users.csv`
   - Import location: "Replace current sheet"
   - Separator type: "Comma"
   - Click "Import data"
   
   **Repeat for other files:**
   - Create sheet "Trainers" → Import `Trainers.csv`
   - Create sheet "Classes" → Import `Classes.csv`
   - Create sheet "Schedules" → Import `Schedules.csv`
   - Create sheet "Bookings" → Import `Bookings.csv`
   - Create sheet "Transactions" → Import `Transactions.csv`

3. **Share with Service Account:**
   - Click "Share" button (top right)
   - Add email: `pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com`
   - Select "Editor" permission
   - Uncheck "Notify people"
   - Click "Share"

4. **Get Spreadsheet ID:**
   - Copy ID from URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Update `.env` file:
     ```
     GOOGLE_SHEETS_ID=your_spreadsheet_id_here
     ```

---

### Method 2: Using Google Apps Script

1. Create new Google Spreadsheet
2. Go to `Extensions > Apps Script`
3. Paste this script:

```javascript
function importAllCSVs() {
  // Get folder with CSV files
  var folderId = 'YOUR_FOLDER_ID'; // Replace with actual folder ID
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFilesByType(MimeType.CSV);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  while (files.hasNext()) {
    var file = files.next();
    var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
    
    // Create new sheet
    var sheetName = file.getName().replace('.csv', '');
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    // Import data
    if (csvData.length > 0) {
      sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
    }
    
    Logger.log('Imported: ' + sheetName);
  }
  
  Logger.log('All CSV files imported successfully!');
}
```

4. Run the function
5. Authorize when prompted

---

## 📊 Import to Microsoft Excel

### Method 1: Direct Open

1. Open Excel
2. Go to `File > Open`
3. Select one CSV file (e.g., `Users.csv`)
4. Excel will open it automatically
5. **Create new workbook** and copy data
6. Repeat for other files, creating new sheets in same workbook
7. Save as `.xlsx`

### Method 2: Power Query (Excel 2016+)

1. Create new Excel workbook
2. Go to `Data > Get Data > From File > From Folder`
3. Select `database_sample` folder
4. Click "Combine & Load"
5. Excel will create separate sheets for each CSV

---

## ✅ Verification Checklist

After import, verify:

- [ ] All 6 sheets exist
- [ ] Headers in row 1 (bold recommended)
- [ ] Data starts from row 2
- [ ] **Users**: 10 rows of data
- [ ] **Trainers**: 6 rows of data
- [ ] **Classes**: 3 rows of data
- [ ] **Schedules**: 21 rows of data
- [ ] **Bookings**: 20 rows of data
- [ ] **Transactions**: 12 rows of data
- [ ] No empty rows between data
- [ ] JSON strings in `members` column properly formatted: `["id1","id2"]`

---

## 🔍 Sample Data Overview

### Users (10 members)
- **Stellaa** (ID: 1143) - Has 7 completed bookings + 1 upcoming
- **Anne** (ID: 75) - Premium member, 20 credits
- **Cecillia** (ID: 141) - Regular member, 15 credits
- And 7 more...

### Trainers (6 instructors)
- **Kim Davis** - Reformer, Wall Board, Chair specialist
- **Caitlyn** - Beginner-friendly Reformer
- **Monica Theresia** - Reformer expert
- And 3 more...

### Schedules
- **Dec 19, 2025**: 9 classes (7am-6pm)
- **Dec 20, 2025**: 5 classes (7am-4pm)
- **Nov 2025**: 7 completed classes (for history)

### Bookings
- **20 bookings total**
- **12 completed** (attended)
- **8 confirmed** (upcoming)
- User 1143 (Stellaa) has most bookings

---

## 📝 Data Notes

### Important Fields

**Schedules.members** (Column E):
```
Format: ["user_id1","user_id2","user_id3"]
Example: ["1143","2232","943"]
```
This is a JSON string, NOT a regular array!

**Date Formats:**
- `schedule_time`: `YYYY-MM-DD HH:MM:SS`
- `registered_date`: `YYYY-MM-DD`
- Consistent format required for API to work

**Status Values:**
- Schedules: `Active`, `Cancelled`, `Completed`
- Bookings: `Confirmed`, `Cancelled`, `Completed`
- Membership: `Active`, `Inactive`, `Expired`

---

## 🚀 Next Steps After Import

1. **Update .env file:**
   ```bash
   GOOGLE_SHEETS_ID=your_actual_spreadsheet_id
   ```

2. **Test API connection:**
   ```bash
   node app.js
   ```

3. **Test in browser:**
   - Login with: `stella@example.com`
   - Password: Use hashed password or generate new one
   - Go to `/account` page
   - Select date: December 19, 2025
   - Should see 9 classes

4. **Verify booking flow:**
   - Click "Book Now" on available class
   - Check Schedules sheet - members array updated
   - Check Bookings sheet - new row added
   - Refresh page - should show "Cancel Book"

---

## 🐛 Troubleshooting

### Issue: "Members field not updating"
**Solution:** Make sure members column uses JSON string format:
- ✅ Correct: `["75","141"]`
- ❌ Wrong: `[75,141]` or `75,141`

### Issue: "No classes showing"
**Solution:** 
- Check schedule_time date matches selected date
- Verify status = "Active"
- Check API console for errors

### Issue: "Cannot read spreadsheet"
**Solution:**
- Verify service account has Editor access
- Check GOOGLE_SHEETS_ID in .env
- Check sheet names match exactly (case-sensitive)

---

## 📧 Support

For issues with:
- Database structure: See `GOOGLE_SHEETS_DATABASE_DESIGN.md`
- API integration: See `API_INTEGRATION_GUIDE.md`
- Authentication: See `LOGIN_IMPLEMENTATION_DOCS.md`
- Google Sheets access: See `FIX_AUTH_ERROR.md`

---

## 📦 Files Included

```
database_sample/
├── README.md (this file)
├── Users.csv
├── Trainers.csv
├── Classes.csv
├── Schedules.csv
├── Bookings.csv
└── Transactions.csv
```

---

**Ready to use! Import files and start testing! 🎉**
