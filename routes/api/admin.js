const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { requireAdmin } = require('../../middleware/auth');

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

// Setup Google Sheets authentication
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

// Get all dashboard data (Admin only)
router.get('/data', requireAdmin, async (req, res) => {
    try {
        // Fetch all data in parallel
        const [usersResponse, bookingsResponse, classesResponse, transactionsResponse, schedulesResponse, trainersResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Users!A:N'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Bookings!A:J'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Classes!A:H'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Transactions!A:H'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Schedules!A:R'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Trainers!A:I'
            })
        ]);

        // Process Users data
        const usersRows = usersResponse.data.values || [];
        const users = usersRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                email: row[1] || '',
                name: row[3] || '',
                phone: row[4] || '',
                membership_type: row[5] || '',
                membership_status: row[6] || '',
                registered_date: row[7] || '',
                expired_date: row[8] || '',
                total_credits: row[9] || '0',
                gender: row[10] || '',
                date_of_birth: row[11] || ''
            };
        });

        // Process Bookings data
        const bookingsRows = bookingsResponse.data.values || [];
        const bookings = bookingsRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                schedule_id: row[1] || '',
                user_id: row[2] || '',
                booking_time: row[3] || '',
                status: row[4] || '',
                attended: row[5] || '0',
                cancelled_time: row[6] || '',
                notes: row[7] || '',
                payment_status: row[8] || '',
                credits_used: row[9] || '0'
            };
        });

        // Process Classes data
        const classesRows = classesResponse.data.values || [];
        const classes = classesRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                name: row[1] || '',
                duration: row[2] || '',
                capacity: row[3] || '',
                description: row[4] || '',
                price: row[5] || '',
                credits_required: row[6] || '',
                status: row[7] || ''
            };
        });

        // Process Transactions data
        const transactionsRows = transactionsResponse.data.values || [];
        const transactions = transactionsRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                user_id: row[1] || '',
                transaction_time: row[2] || '',
                amount: row[3] || '',
                credits_purchased: row[4] || '',
                payment_method: row[5] || '',
                payment_status: row[6] || '',
                invoice_number: row[7] || ''
            };
        });

        // Process Schedules data
        const schedulesRows = schedulesResponse.data.values || [];
        const schedules = schedulesRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                schedule_time: row[1] || '',
                trainer_id: row[2] || '',
                class_id: row[3] || '',
                members: row[4] || '',
                gender_restriction: row[5] || '',
                notes: row[7] || '',
                status: row[16] || ''
            };
        });

        // Process Trainers data
        const trainersRows = trainersResponse.data.values || [];
        const trainers = trainersRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                name: row[1] || '',
                email: row[2] || '',
                phone: row[3] || '',
                specialization: row[4] || '',
                bio: row[6] || '',
                status: row[7] || '',
                joined_date: row[8] || ''
            };
        });

        res.json({
            success: true,
            data: {
                users,
                bookings,
                classes,
                transactions,
                schedules,
                trainers,
                stats: {
                    totalUsers: users.length,
                    totalBookings: bookings.length,
                    totalClasses: classes.length,
                    totalTransactions: transactions.length,
                    totalSchedules: schedules.length,
                    totalTrainers: trainers.length
                }
            }
        });

    } catch (error) {
        console.error('Admin data fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data'
        });
    }
});

module.exports = router;
