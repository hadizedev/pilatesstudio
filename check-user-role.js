/**
 * Check User Role in Google Sheets
 * Run: node check-user-role.js [email]
 */

const { google } = require('googleapis');
require('dotenv').config();

const credentials = {
    type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
};
const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

async function checkUserRole(email) {
    try {
        console.log('🔍 Checking user role for:', email);
        console.log('📊 Spreadsheet ID:', spreadsheetId);
        console.log('');

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Users!A:N',
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            console.log('❌ No data found in Users sheet');
            return;
        }

        // Get headers
        const headers = rows[0];
        console.log('📋 Headers found:', headers.join(', '));
        console.log('');

        const emailIndex = headers.indexOf('email');
        const roleIndex = headers.indexOf('role');
        const nameIndex = headers.indexOf('name');

        if (roleIndex === -1) {
            console.log('⚠️  WARNING: "role" column not found in sheet!');
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log(`1. Open Google Sheets: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
            console.log('2. Go to "Users" sheet');
            console.log('3. Add a new column header "role" (after the last column)');
            console.log('4. For admin users, enter "admin" in their role column');
            console.log('5. For regular users, enter "user" or leave empty');
            console.log('6. Save the sheet');
            console.log('');
            console.log('Example:');
            console.log('   | email | name | ... | role  |');
            console.log('   |-------|------|-----|-------|');
            console.log('   | diyesh.jco@gmail.com | ... | admin |');
            console.log('');
            return;
        }

        console.log(`📍 Column positions:`);
        console.log(`   Email: Column ${emailIndex + 1} (${String.fromCharCode(65 + emailIndex)})`);
        console.log(`   Role: Column ${roleIndex + 1} (${String.fromCharCode(65 + roleIndex)})`);
        console.log('');

        // Find user
        let userFound = null;
        let rowNumber = 0;
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
                userFound = row;
                rowNumber = i + 1;
                break;
            }
        }

        if (!userFound) {
            console.log('❌ User not found with email:', email);
            console.log('');
            console.log('💡 Available users:');
            for (let i = 1; i < Math.min(rows.length, 11); i++) {
                if (rows[i][emailIndex]) {
                    const userRole = rows[i][roleIndex] || '(no role)';
                    console.log(`   ${i}. ${rows[i][emailIndex]} - Role: ${userRole}`);
                }
            }
            return;
        }

        console.log('✅ User found!');
        console.log('═══════════════════════════════════════');
        console.log(`Row number: ${rowNumber}`);
        console.log(`Email: ${userFound[emailIndex]}`);
        console.log(`Name: ${userFound[nameIndex] || '(no name)'}`);
        console.log(`Role value: "${userFound[roleIndex] || '(empty)'}"`);
        console.log(`Role is empty?: ${!userFound[roleIndex]}`);
        console.log('═══════════════════════════════════════');
        console.log('');

        if (!userFound[roleIndex] || userFound[roleIndex].trim() === '') {
            console.log('⚠️  PROBLEM: Role is empty for this user!');
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log(`1. Open: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
            console.log(`2. Go to "Users" sheet`);
            console.log(`3. Find row ${rowNumber} (email: ${email})`);
            console.log(`4. In the "role" column (column ${String.fromCharCode(65 + roleIndex)}), enter: admin`);
            console.log(`5. Make sure it's exactly "admin" (lowercase, no spaces)`);
            console.log(`6. Save the sheet`);
            console.log(`7. Logout and login again`);
            console.log('');
        } else if (userFound[roleIndex].trim().toLowerCase() !== 'admin') {
            console.log(`⚠️  Role is "${userFound[roleIndex]}" but should be "admin"`);
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log(`1. Open: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
            console.log(`2. Go to "Users" sheet`);
            console.log(`3. Find row ${rowNumber} (email: ${email})`);
            console.log(`4. Change role value to: admin`);
            console.log(`5. Save the sheet`);
            console.log(`6. Logout and login again`);
            console.log('');
        } else {
            console.log('✅ Role is correctly set to "admin"');
            console.log('');
            console.log('💡 If still getting access denied:');
            console.log('   1. Logout from application');
            console.log('   2. Clear browser cookies/cache');
            console.log('   3. Login again');
            console.log('   4. Check server console for debug logs');
            console.log('');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        
        if (error.message.includes('unregistered callers')) {
            console.log('🔧 SOLUTION: Share spreadsheet with service account');
            console.log(`   Email: ${credentials.client_email}`);
            console.log(`   Link: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        } else if (error.code === 404) {
            console.log('🔧 SOLUTION: Spreadsheet not found. Check spreadsheet ID.');
        } else if (error.code === 403) {
            console.log('🔧 SOLUTION: Access denied. Share spreadsheet with service account.');
        }
    }
}

// Get email from command line or use default
const emailToCheck = process.argv[2] || 'diyesh.jco@gmail.com';

checkUserRole(emailToCheck);
