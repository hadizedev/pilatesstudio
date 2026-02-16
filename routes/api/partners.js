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

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

// POST /api/partners/login - Trainer login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        // Get trainers from Google Sheets
        // Table: id | name | email | password | phone | specialization | image | bio | status | joined_date
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Trainers!A:J'
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Data trainer tidak ditemukan'
            });
        }

        const headers = rows[0];
        const idIndex = headers.indexOf('id');
        const nameIndex = headers.indexOf('name');
        const emailIndex = headers.indexOf('email');
        const passwordIndex = headers.indexOf('password');
        const phoneIndex = headers.indexOf('phone');
        const specializationIndex = headers.indexOf('specialization');
        const imageIndex = headers.indexOf('image');
        const bioIndex = headers.indexOf('bio');
        const statusIndex = headers.indexOf('status');
        const joinedDateIndex = headers.indexOf('joined_date');

        // Find trainer by email
        let trainerFound = null;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[emailIndex] && row[emailIndex].toLowerCase() === email.toLowerCase()) {
                trainerFound = row;
                break;
            }
        }

        if (!trainerFound) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Check if trainer is active
        const trainerStatus = trainerFound[statusIndex] || '';
        if (trainerStatus.toLowerCase() !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Akun trainer tidak aktif. Hubungi admin.'
            });
        }

        // Verify password
        const storedPassword = trainerFound[passwordIndex];
        if (!storedPassword) {
            return res.status(401).json({
                success: false,
                message: 'Password belum diatur. Hubungi admin.'
            });
        }

        let isPasswordValid = false;

        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, storedPassword);
        } else {
            isPasswordValid = password === storedPassword;
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Create trainer session
        req.session.trainer = {
            id: trainerFound[idIndex],
            name: trainerFound[nameIndex],
            email: trainerFound[emailIndex],
            phone: trainerFound[phoneIndex] || '',
            specialization: trainerFound[specializationIndex] || '',
            image: trainerFound[imageIndex] || '',
            bio: trainerFound[bioIndex] || '',
            status: trainerFound[statusIndex] || '',
            joined_date: trainerFound[joinedDateIndex] || ''
        };

        console.log('=== TRAINER LOGIN DEBUG ===');
        console.log('Email:', trainerFound[emailIndex]);
        console.log('Name:', trainerFound[nameIndex]);
        console.log('ID:', trainerFound[idIndex]);
        console.log('===========================');

        res.json({
            success: true,
            message: 'Login berhasil',
            redirectUrl: '/partners'
        });

    } catch (error) {
        console.error('Trainer login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

// POST /api/partners/logout - Trainer logout
router.post('/logout', (req, res) => {
    delete req.session.trainer;
    res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/partners/schedules - Get schedules for logged-in trainer
router.get('/schedules', async (req, res) => {
    try {
        if (!req.session || !req.session.trainer) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const trainerId = req.session.trainer.id;
        const { date } = req.query;

        // Fetch schedules, classes, and users data in parallel
        const [schedulesResponse, classesResponse, usersResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Schedules!A:R'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Classes!A:G'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Users!A:O'
            })
        ]);

        const schedulesRows = schedulesResponse.data.values || [];
        const classesRows = classesResponse.data.values || [];
        const usersRows = usersResponse.data.values || [];

        // Build classes lookup
        const classesMap = {};
        classesRows.slice(1).forEach(row => {
            classesMap[row[0]] = {
                id: row[0] || '',
                name: row[1] || '',
                duration: row[2] || '',
                capacity: row[3] || '',
                description: row[4] || '',
                credits_required: row[5] || ''
            };
        });

        // Build users lookup
        const usersMap = {};
        usersRows.slice(1).forEach(row => {
            usersMap[row[0]] = {
                id: row[0] || '',
                name: row[3] || '',
                email: row[1] || '',
                phone: row[4] || '',
                gender: row[12] || ''
            };
        });

        // Filter schedules for this trainer only
        let schedules = schedulesRows.slice(1)
            .filter(row => row[2] === trainerId) // trainer_id match
            .map(row => {
                const classInfo = classesMap[row[3]] || {};
                
                // Parse members
                let membersList = [];
                try {
                    const membersArray = JSON.parse(row[4] || '[]');
                    membersList = membersArray.map(mid => {
                        const user = usersMap[mid];
                        return user ? { id: user.id, name: user.name, gender: user.gender } : { id: mid, name: 'Unknown', gender: '' };
                    });
                } catch (e) {
                    membersList = [];
                }

                // Normalize schedule_time to YYYY-MM-DD HH:mm format
                let rawTime = row[1] || '';
                let normalizedTime = rawTime;
                try {
                    const dt = new Date(rawTime);
                    if (!isNaN(dt.getTime())) {
                        const yyyy = dt.getFullYear();
                        const mm = String(dt.getMonth() + 1).padStart(2, '0');
                        const dd = String(dt.getDate()).padStart(2, '0');
                        const hh = String(dt.getHours()).padStart(2, '0');
                        const min = String(dt.getMinutes()).padStart(2, '0');
                        normalizedTime = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
                    }
                } catch (e) {}

                return {
                    id: row[0] || '',
                    schedule_time: normalizedTime,
                    trainer_id: row[2] || '',
                    class_id: row[3] || '',
                    class_name: classInfo.name || '',
                    class_duration: classInfo.duration || '',
                    class_capacity: classInfo.capacity || '',
                    members_count: membersList.length,
                    members: membersList,
                    gender_restriction: row[5] || '',
                    notes: row[7] || '',
                    status: row[16] || 'Active'
                };
            });

        // Filter by week if date parameter is provided
        if (date) {
            const target = new Date(date + 'T00:00:00');
            if (!isNaN(target.getTime())) {
                const day = target.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;
                const weekStart = new Date(target);
                weekStart.setDate(target.getDate() + diffToMonday);
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                schedules = schedules.filter(s => {
                    const sDate = new Date(s.schedule_time);
                    return sDate >= weekStart && sDate <= weekEnd;
                });
            }
        }

        res.json({
            success: true,
            data: schedules,
            total: schedules.length,
            trainer: {
                id: req.session.trainer.id,
                name: req.session.trainer.name
            }
        });

    } catch (error) {
        console.error('Error fetching trainer schedules:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
    }
});

// GET /api/partners/profile - Get trainer profile
router.get('/profile', (req, res) => {
    if (!req.session || !req.session.trainer) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.json({ success: true, data: req.session.trainer });
});

module.exports = router;
