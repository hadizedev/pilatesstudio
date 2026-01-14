/**
 * PilateStudio Database Excel Creator
 * Creates a single Excel file with multiple sheets from CSV files
 * 
 * Usage: node create_excel.js
 */

const fs = require('fs');
const path = require('path');

// Simple CSV to Array converter
function csvToArray(csvText) {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    // Simple CSV parsing (handles basic comma separation)
    return line.split(',').map(cell => cell.trim());
  });
}

// Create Excel-compatible HTML
function createExcelHTML() {
  const csvFiles = [
    'Users.csv',
    'Trainers.csv',
    'Classes.csv',
    'Schedules.csv',
    'Bookings.csv',
    'Transactions.csv'
  ];

  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PilateStudio Database</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #4a3829; }
    h2 { color: #8b6f47; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
    th { background-color: #d4c5b0; font-weight: bold; padding: 10px; border: 1px solid #999; }
    td { padding: 8px; border: 1px solid #ddd; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .info { background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>📊 PilateStudio Database</h1>
  <div class="info">
    <strong>Instructions:</strong><br>
    1. Open this file in Excel/LibreOffice<br>
    2. Or copy tables to Google Sheets<br>
    3. Share with service account: pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com
  </div>
`;

  csvFiles.forEach(csvFile => {
    const csvPath = path.join(__dirname, csvFile);
    
    if (!fs.existsSync(csvPath)) {
      console.log(`⚠️  Warning: ${csvFile} not found, skipping...`);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = csvToArray(csvContent);
    
    const sheetName = csvFile.replace('.csv', '');
    
    htmlContent += `\n  <h2>${sheetName} (${rows.length - 1} rows)</h2>\n`;
    htmlContent += `  <table>\n`;
    
    // Header row
    htmlContent += `    <tr>\n`;
    rows[0].forEach(header => {
      htmlContent += `      <th>${header}</th>\n`;
    });
    htmlContent += `    </tr>\n`;
    
    // Data rows
    for (let i = 1; i < rows.length; i++) {
      htmlContent += `    <tr>\n`;
      rows[i].forEach(cell => {
        htmlContent += `      <td>${cell}</td>\n`;
      });
      htmlContent += `    </tr>\n`;
    }
    
    htmlContent += `  </table>\n`;
    
    console.log(`✓ Processed: ${sheetName} (${rows.length - 1} rows)`);
  });

  htmlContent += `
</body>
</html>`;

  return htmlContent;
}

// Main function
function main() {
  console.log('=' .repeat(50));
  console.log('  PilateStudio Database - HTML/Excel Creator');
  console.log('=' .repeat(50));
  console.log();
  console.log('🔧 Creating HTML file from CSV data...');
  console.log('-'.repeat(50));

  try {
    const htmlContent = createExcelHTML();
    const outputFile = path.join(__dirname, 'PilateStudio_Database.html');
    
    fs.writeFileSync(outputFile, htmlContent, 'utf-8');
    
    console.log('-'.repeat(50));
    console.log('✅ Success! HTML file created:');
    console.log(`   📁 ${outputFile}`);
    console.log();
    console.log('📊 How to use:');
    console.log('   1. Open PilateStudio_Database.html in browser');
    console.log('   2. Copy each table to Google Sheets');
    console.log('   3. Or open in Excel: File > Open > Select .html file');
    console.log();
    console.log('🚀 Alternative:');
    console.log('   Import CSV files directly to Google Sheets');
    console.log('   (See PETUNJUK_IMPORT.md for instructions)');
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run
main();
