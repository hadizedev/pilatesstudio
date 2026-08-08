const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
const bcrypt = require('bcryptjs');

const serviceAccountEmail = 'pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com';
const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';

// Setup Google Sheets authentication — credentials.json is gitignored and never committed.
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'),
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
    console.error('3. Tambahkan email: ' + serviceAccountEmail);
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
                message: 'Google Sheets API belum ter-autorisasi. Silakan share spreadsheet dengan service account: ' + serviceAccountEmail
            });
        }

        // Get users from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Users!A:Z', // Wide range so newly-added columns (e.g. role) aren't silently excluded
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Data pengguna tidak ditemukan'
            });
        }

        // Header lookup is case-insensitive since the Users sheet's header casing/naming
        // has been hand-edited over time (e.g. "Email" vs "email").
        const headers = rows[0];
        const col = name => headers.findIndex(h => (h || '').toString().trim().toLowerCase() === name);
        const idIndex = col('id');
        const emailIndex = col('email');
        const passwordIndex = col('password');
        const nameIndex = col('name');
        const phoneIndex = col('phone');
        const membershipTypeIndex = col('membership_type');
        const membershipStatusIndex = col('membership_status');
        const registeredDateIndex = col('registered_date');
        const profilePictureIndex = col('profile_picture');
        const totalCreditsIndex = col('total_credits');
        const roleIndex = col('role'); // Add role field

        // Find user by email
        let userFound = null;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
                userFound = row;
                break;
            }
        }

        // Coaches log in with the same form but live in the separate Trainers sheet — try
        // that before giving up, so one endpoint serves both members/admins and trainers.
        if (!userFound) {
            const trainerResp = await sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Trainers!A2:I',
            });
            const trainerRows = trainerResp.data.values || [];
            const trainerRow = trainerRows.find(r => (r[2] || '').toLowerCase() === email.toLowerCase());
            if (!trainerRow) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            const storedTrainerPassword = trainerRow[3] || '';
            const isTrainerPasswordValid = (storedTrainerPassword.startsWith('$2a$') || storedTrainerPassword.startsWith('$2b$'))
                ? await bcrypt.compare(password, storedTrainerPassword)
                : password === storedTrainerPassword;

            if (!isTrainerPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email atau password salah'
                });
            }

            req.session.user = {
                id: trainerRow[0],
                email: trainerRow[2],
                name: trainerRow[1],
                phone: trainerRow[4],
                image: trainerRow[6] || '',
                role: 'trainer'
            };

            return res.json({
                success: true,
                message: 'Login berhasil',
                redirectUrl: '/coach',
                user: req.session.user
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
            profile_picture: userFound[profilePictureIndex],
            total_credits: userFound[totalCreditsIndex],
            role: userFound[roleIndex] || 'user' // Default to 'user' if role is not set
        };

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
            errorMessage = 'Google Sheets belum ter-autorisasi. Silakan share spreadsheet dengan: ' + serviceAccountEmail;
            console.error('');
            console.error('❌ ERROR: Service account tidak punya akses ke spreadsheet');
            console.error('');
            console.error('🔧 SOLUSI:');
            console.error('1. Buka: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
            console.error('2. Klik tombol "Share" (Bagikan)');
            console.error('3. Masukkan email: ' + serviceAccountEmail);
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