const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { requireAdmin } = require('../../middleware/auth');
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
