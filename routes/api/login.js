const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const credentials = {
    type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
};

const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';
const apiKeyBrevo = 'xkeysib-XXXXXXXXXXXXXXXXXXXXXX';

// Setup Google Sheets authentication using fromJSON
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

// Authorize and verify
let isAuthorized = false;
auth.getClient().then((client) => {
    isAuthorized = true;
    console.log('✅ Google Sheets API authorized successfully');
}).catch((err) => {
    console.error('❌ Google Sheets Authorization Error:', err.message);
    console.error('');
    console.error('🔧 SOLUSI:');
    console.error('1. Buka Google Sheets: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    console.error('2. Klik "Share" / "Bagikan"');
    console.error('3. Tambahkan email: ' + credentials.client_email);
    console.error('4. Berikan akses "Editor" atau minimal "Viewer"');
    console.error('5. Restart server setelah share');
    console.error('');
});

const sheets = google.sheets({ version: 'v4', auth });

// Login endpoint
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        // Check if authorized
        if (!isAuthorized) {
            return res.status(503).json({
                success: false,
                message: 'Google Sheets API belum ter-autorisasi. Silakan share spreadsheet dengan service account: ' + credentials.client_email
            });
        }

        // Get users from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Users!A:Z', // Include all columns including role
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Data pengguna tidak ditemukan'
            });
        }

        // Assuming first row is header: id, email, password, name, phone, membership_type, membership_status, registered_date, expired_date, profile_picture, total_credits
        const headers = rows[0];
        const idIndex = headers.indexOf('id');
        const emailIndex = headers.indexOf('email');
        const passwordIndex = headers.indexOf('password');
        const nameIndex = headers.indexOf('name');
        const phoneIndex = headers.indexOf('phone');
        const membershipTypeIndex = headers.indexOf('membership_type');
        const membershipStatusIndex = headers.indexOf('membership_status');
        const registeredDateIndex = headers.indexOf('registered_date');
        const expiredDateIndex = headers.indexOf('expired_date');
        const profilePictureIndex = headers.indexOf('profile_picture');
        const totalCreditsIndex = headers.indexOf('total_credits');
        const roleIndex = headers.indexOf('role'); // Add role field

        // Find user by email
        let userFound = null;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
                userFound = row;
                break;
            }
        }

        if (!userFound) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Verify password
        const storedPassword = userFound[passwordIndex];
        let isPasswordValid = false;

        // Check if password is hashed (bcrypt) or plain text
        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
            // Hashed password
            isPasswordValid = await bcrypt.compare(password, storedPassword);
        } else {
            // Plain text password (for backward compatibility, should hash all passwords)
            isPasswordValid = password === storedPassword;
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Create user session
        req.session.user = {
            id: userFound[idIndex],
            email: userFound[emailIndex],
            name: userFound[nameIndex],
            phone: userFound[phoneIndex],
            membership_type: userFound[membershipTypeIndex],
            membership_status: userFound[membershipStatusIndex],
            registered_date: userFound[registeredDateIndex],
            expired_date: userFound[expiredDateIndex],
            profile_picture: userFound[profilePictureIndex],
            total_credits: userFound[totalCreditsIndex],
            role: userFound[roleIndex] || 'user' // Default to 'user' if role is not set
        };

        // Debug logging untuk memeriksa role
        console.log('=== LOGIN DEBUG ===');
        console.log('Email:', userFound[emailIndex]);
        console.log('Role from sheet:', userFound[roleIndex]);
        console.log('Role in session:', req.session.user.role);
        console.log('Role index:', roleIndex);
        console.log('==================');

        // Redirect based on role
        const redirectUrl = req.session.user.role === 'admin' ? '/admin' : '/account';

        res.json({
            success: true,
            message: 'Login berhasil',
            redirectUrl: redirectUrl,
            user: req.session.user
        });

    } catch (error) {
        console.error('Login error:', error);
        
        // Specific error handling
        let errorMessage = 'Terjadi kesalahan pada server';
        
        if (error.message && error.message.includes('unregistered callers')) {
            errorMessage = 'Google Sheets belum ter-autorisasi. Silakan share spreadsheet dengan: ' + credentials.client_email;
            console.error('');
            console.error('❌ ERROR: Service account tidak punya akses ke spreadsheet');
            console.error('');
            console.error('🔧 SOLUSI:');
            console.error('1. Buka: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
            console.error('2. Klik tombol "Share" (Bagikan)');
            console.error('3. Masukkan email: ' + credentials.client_email);
            console.error('4. Pilih role: "Editor" atau "Viewer"');
            console.error('5. Klik "Send" atau "Kirim"');
            console.error('6. Restart server ini');
            console.error('');
        } else if (error.code === 404) {
            errorMessage = 'Spreadsheet tidak ditemukan. Periksa spreadsheet ID.';
        } else if (error.code === 403) {
            errorMessage = 'Akses ditolak. Periksa permissions spreadsheet.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

module.exports = router;