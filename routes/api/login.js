const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');

const credentials = {
    type: "service_account",
    project_id: "pilatestudio-stella",
    private_key_id: "YOUR_PRIVATE_KEY_ID",
    client_email: 'pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQC70lSgWGsgCa30\n+ITfbmFTAQe3OboaTuszaNBvku7O2yVGYFMOhljJxf26jij2Euds2TvM82lqdNaz\nb9ebkD2uYH2eNx7yGzi/9If2LqtsxaUs0XV5MU0MmiiZentVTFNbd608LSKGOGGV\nWLAI42LD8PgujwYMgJ/KNyJRQQsBV1oAeGUoR6u/QQKNe+uomAbd7t9L3ltlc+qk\nXVg480q/EeIKu9PBqcGasrjBioSiU6rWilzmM6fKEYdvOPLitt9Wug0OGUpJz27N\nmVCgqWZz1bbdDKUFNg1QakjbsBINLjjd2neC+DpV3nQzqyN6w1hlQIEqw7i0CnB5\n7JoxugLpAgMBAAECgf8ILi3ONHIPmY+G2+W6byEa1f1zPYOdiB82XgC2DonYK8zn\nA8sAsIx6PUvC+rrnlmsxLBHITp6IxHRiQrzHsCb/l7RHVjjcbDl/vGbJK78yCmm0\nFtHHAlHllDewd5hnkd6pKgBuXojiaUVwYix70DhWnTT+0iJK6RwMjECYyWLXuNYx\nbtFcUs1YkwhLM66oml3g0gsNCg2WK81CaAgj8OMAIeG81dN+C83pelUth1fH2CO5\nW3vpmqoh5bvrS2o8YgV8h5lhAuX/pI763Vjo5sRI8GT55AuzhyeHjTh6LtqqCkih\n3ehjXwgcl5iIKNgcWqSjgHXrVxCP+EsOf/bpu/0CgYEA+O06DcLzLXKSO4EDZ98N\nm/uJL51nBzRhUphQe3XBpm6Q3TIwiPDkCNQFrqHPjrNrY8/U6h4LEpm/vqzKD3K7\n4pJMCFVu1sPb6ZC4jqSu+pS/Q630i9qxVirtAiwiewv0D632DHhUCIkUnCSkKxX+\nFNkj6p5zCEttbZ27xpZWoUUCgYEAwSibE9BLBCrIh357XIPaMeq6JW6VFZtHqtzL\noSQ/8WzEAhdKsFoE77FF13tOkv4gEKZZbJXrHhthelFF7RHlAhArxDxxkkp1FDab\nQNmRWKtLuyiLiv9//iZ/kcnfhdktlJTm8T2ilzcAxklzbitpVhTWk8SMwGxpOVqg\n1+cui1UCgYA2LavNAvlaku0w9kt/eBTGNmENc/zQnJ3yFCSwOlkDmFz/R8U4iPWY\n1kzGTYGXVYWyG7IDorZWPhB1t7Xi1t392kmiJrYRGF/s3grNQRq0f1uBp4LqTZb7\nYixjpKd8kIV2RC6hWC8yDGPn+DGjDw5WC0y96+6th30xtnsAJgiE4QKBgQCDMPEj\nI/XPfr90R5PB4kvwW1zSz6iyZCTpB83GRLipYRY/1VIFNR7lLaIiGL3lWHSu2k0i\nUzC94hry2QCFZAIGxLT1M5hvo+KhN/V6tkrhznZBR+h/H8nu9HbwrgwC/N7Ya8nv\nT81+pvz/sCOWUCXbMYwMERMIHpnZOpTED2CtgQKBgAYpYiqFnhb22LhBTo5VvZpL\nQ4VAqMCAkEvq4GY1RxH9UIZuvN4ifafdsrz6Ez0eLpC+VRWmUkQhL+/IzTaRVs29\nh2IGEuVRVzpdduKz2syYsN9wE0I5ycnkcP5GCjcDqguKQD6+fl/6puUM+nPdxJNF\nCVCZGxFcffE8TjQ7Tpwi\n-----END PRIVATE KEY-----\n',
    client_id: "YOUR_CLIENT_ID",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/pilatestudiostella%40pilatestudio-stella.iam.gserviceaccount.com"
};

const spreadsheetId = '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';
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