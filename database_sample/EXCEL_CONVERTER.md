# Excel File Creator

## Quick Convert CSV to Excel

Jika Anda ingin langsung membuat file Excel (.xlsx) dari CSV files, gunakan salah satu cara berikut:

---

## Option 1: Using Python (Recommended)

### Install Required Package:
```bash
pip install pandas openpyxl
```

### Run Script:
```python
import pandas as pd
import os

# Create Excel file with multiple sheets
excel_file = 'PilateStudio_Database.xlsx'

# List of CSV files
csv_files = {
    'Users': 'Users.csv',
    'Trainers': 'Trainers.csv',
    'Classes': 'Classes.csv',
    'Schedules': 'Schedules.csv',
    'Bookings': 'Bookings.csv',
    'Transactions': 'Transactions.csv'
}

# Create Excel writer
with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
    for sheet_name, csv_file in csv_files.items():
        # Read CSV
        df = pd.read_csv(csv_file)
        
        # Write to Excel
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        print(f'✓ Created sheet: {sheet_name}')

print(f'\n✅ Excel file created: {excel_file}')
```

Save as `create_excel.py` and run:
```bash
python create_excel.py
```

---

## Option 2: Using Node.js

### Install Package:
```bash
npm install xlsx
```

### Run Script:
```javascript
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create new workbook
const workbook = XLSX.utils.book_new();

// List of CSV files
const csvFiles = [
    'Users.csv',
    'Trainers.csv',
    'Classes.csv',
    'Schedules.csv',
    'Bookings.csv',
    'Transactions.csv'
];

// Convert each CSV to worksheet
csvFiles.forEach(file => {
    const csvData = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const worksheet = XLSX.utils.sheet_to_json(
        XLSX.utils.aoa_to_sheet(
            csvData.split('\n').map(row => row.split(','))
        )
    );
    
    const sheetName = file.replace('.csv', '');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    console.log(`✓ Created sheet: ${sheetName}`);
});

// Write Excel file
XLSX.writeFile(workbook, 'PilateStudio_Database.xlsx');
console.log('\n✅ Excel file created: PilateStudio_Database.xlsx');
```

Save as `create_excel.js` and run:
```bash
node create_excel.js
```

---

## Option 3: Manual Excel Conversion

### Steps:
1. Open Excel
2. Create new workbook
3. For each CSV file:
   - Create new sheet
   - Go to `Data > From Text/CSV`
   - Select CSV file
   - Click "Load"
   - Rename sheet accordingly
4. Save as `.xlsx`

---

## Option 4: Online Converter

Use online tools:
- [Convertio](https://convertio.co/csv-xlsx/)
- [Zamzar](https://www.zamzar.com/convert/csv-to-xlsx/)
- [CloudConvert](https://cloudconvert.com/csv-to-xlsx)

**Note:** Upload files one by one, then manually combine into single workbook.

---

## 🎯 Recommended Approach

**For Quick Setup:**
→ Use **Python script** (Option 1) - Creates perfect Excel file in seconds

**For No Coding:**
→ Import directly to **Google Sheets** (see main README.md)

**For Local Excel File:**
→ Use **Manual Conversion** (Option 3)

---

## ✅ After Creating Excel File

1. Open `PilateStudio_Database.xlsx`
2. Verify all 6 sheets exist
3. Check data integrity
4. Upload to Google Drive (if needed)
5. Convert to Google Sheets:
   - Right click file → Open with → Google Sheets
   - File → Save as Google Sheets
6. Share with service account
7. Update `.env` with spreadsheet ID

---

## 📦 What You'll Get

**Single Excel file with 6 sheets:**
- ✅ Users (10 rows)
- ✅ Trainers (6 rows)
- ✅ Classes (3 rows)
- ✅ Schedules (21 rows)
- ✅ Bookings (20 rows)
- ✅ Transactions (12 rows)

All ready to use! 🎉
