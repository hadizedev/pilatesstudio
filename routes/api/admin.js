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

// Setup Google Sheets authentication with write permissions
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
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
                profile_picture: row[9] || '',
                total_credits: row[10] || '0',
                gender: row[11] || '',
                date_of_birth: row[12] || '',
                role: row[13] || ''
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

// ============ CRUD OPERATIONS ============

// Helper function: Get next ID for a sheet
async function getNextId(sheetName) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A:A`
        });
        
        const values = response.data.values || [];
        if (values.length <= 1) return '1'; // Only header or empty
        
        // Get numeric IDs and find the max
        const ids = values.slice(1)
            .map(row => parseInt(row[0]))
            .filter(id => !isNaN(id));
        
        return (Math.max(...ids, 0) + 1).toString();
    } catch (error) {
        console.error('Error getting next ID:', error);
        throw error;
    }
}

// Helper function: Find row index by ID
async function findRowIndexById(sheetName, id) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A:A`
        });
        
        const values = response.data.values || [];
        const rowIndex = values.findIndex(row => row[0] == id);
        
        return rowIndex === -1 ? -1 : rowIndex + 1; // +1 for 1-based indexing
    } catch (error) {
        console.error('Error finding row:', error);
        throw error;
    }
}

// Helper function: Append row to sheet
async function appendRow(sheetName, values) {
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [values],
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error appending row:', error);
        throw error;
    }
}

// Helper function: Update row in sheet
async function updateRow(sheetName, rowNumber, values) {
    try {
        const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, values.length);
        const range = `${sheetName}!A${rowNumber}:${cols[values.length - 1]}${rowNumber}`;
        
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: [values],
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating row:', error);
        throw error;
    }
}

// Helper function: Delete row from sheet
async function deleteRow(sheetName, rowNumber) {
    try {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
        });
        
        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
        
        const sheetId = sheet.properties.sheetId;
        
        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowNumber - 1,
                            endIndex: rowNumber,
                        },
                    },
                }],
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting row:', error);
        throw error;
    }
}

// ============ USER CRUD ============

// POST /api/admin/user - Create new user
router.post('/user', requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, password, membership_type, membership_status, expired_date, total_credits, gender, role } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Users');
        const values = [
            id,
            email,
            password, // In real app, should be hashed
            name,
            phone,
            membership_type,
            membership_status,
            new Date().toISOString().split('T')[0], // registered_date
            expired_date,
            '', // profile_picture
            total_credits,
            gender,
            '', // date_of_birth
            role || 'user'
        ];
        
        await appendRow('Users', values);
        
        res.json({ 
            success: true, 
            message: 'User created successfully',
            data: { id }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Error creating user: ' + error.message });
    }
});

// PUT /api/admin/user/:id - Update user
router.put('/user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, password, membership_type, membership_status, expired_date, total_credits, gender, role } = req.body;
        
        const rowIndex = await findRowIndexById('Users', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get existing data to preserve fields not being updated
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Users!A${rowIndex}:N${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            email || existingRow[1],
            password || existingRow[2], // If empty, keep old password
            name || existingRow[3],
            phone || existingRow[4],
            membership_type || existingRow[5],
            membership_status || existingRow[6],
            existingRow[7], // registered_date (don't change)
            expired_date || existingRow[8],
            existingRow[9], // profile_picture
            total_credits || existingRow[10],
            gender || existingRow[11],
            existingRow[12], // date_of_birth
            role || existingRow[13]
        ];
        
        await updateRow('Users', rowIndex, values);
        
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user: ' + error.message });
    }
});

// DELETE /api/admin/user/:id - Delete user
router.delete('/user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Users', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        await deleteRow('Users', rowIndex);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user: ' + error.message });
    }
});

// ============ BOOKING CRUD ============

// POST /api/admin/booking - Create new booking
router.post('/booking', requireAdmin, async (req, res) => {
    try {
        const { schedule_id, user_id, status, attended, payment_status, credits_used, notes } = req.body;
        
        if (!schedule_id || !user_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Bookings');
        const values = [
            id,
            schedule_id,
            user_id,
            new Date().toISOString(), // booking_time
            status || 'Confirmed',
            attended || '0',
            '', // cancelled_time
            notes || '',
            payment_status || 'Pending',
            credits_used || '0'
        ];
        
        await appendRow('Bookings', values);
        
        res.json({ success: true, message: 'Booking created successfully', data: { id } });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Error creating booking: ' + error.message });
    }
});

// PUT /api/admin/booking/:id - Update booking
router.put('/booking/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule_id, user_id, status, attended, payment_status, credits_used, notes } = req.body;
        
        const rowIndex = await findRowIndexById('Bookings', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Bookings!A${rowIndex}:J${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            schedule_id || existingRow[1],
            user_id || existingRow[2],
            existingRow[3], // booking_time (don't change)
            status || existingRow[4],
            attended !== undefined ? attended : existingRow[5],
            existingRow[6], // cancelled_time
            notes !== undefined ? notes : existingRow[7],
            payment_status || existingRow[8],
            credits_used !== undefined ? credits_used : existingRow[9]
        ];
        
        await updateRow('Bookings', rowIndex, values);
        
        res.json({ success: true, message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ success: false, message: 'Error updating booking: ' + error.message });
    }
});

// DELETE /api/admin/booking/:id - Delete booking
router.delete('/booking/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Bookings', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        await deleteRow('Bookings', rowIndex);
        
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: 'Error deleting booking: ' + error.message });
    }
});

// ============ CLASS CRUD ============

// POST /api/admin/class - Create new class
router.post('/class', requireAdmin, async (req, res) => {
    try {
        const { name, duration, capacity, price, credits_required, status, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Classes');
        const values = [
            id,
            name,
            duration || '',
            capacity || '',
            description || '',
            price || '0',
            credits_required || '0',
            status || 'Active'
        ];
        
        await appendRow('Classes', values);
        
        res.json({ success: true, message: 'Class created successfully', data: { id } });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ success: false, message: 'Error creating class: ' + error.message });
    }
});

// PUT /api/admin/class/:id - Update class
router.put('/class/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, capacity, price, credits_required, status, description } = req.body;
        
        const rowIndex = await findRowIndexById('Classes', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Classes!A${rowIndex}:H${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            name || existingRow[1],
            duration !== undefined ? duration : existingRow[2],
            capacity !== undefined ? capacity : existingRow[3],
            description !== undefined ? description : existingRow[4],
            price !== undefined ? price : existingRow[5],
            credits_required !== undefined ? credits_required : existingRow[6],
            status || existingRow[7]
        ];
        
        await updateRow('Classes', rowIndex, values);
        
        res.json({ success: true, message: 'Class updated successfully' });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ success: false, message: 'Error updating class: ' + error.message });
    }
});

// DELETE /api/admin/class/:id - Delete class
router.delete('/class/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Classes', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        
        await deleteRow('Classes', rowIndex);
        
        res.json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ success: false, message: 'Error deleting class: ' + error.message });
    }
});

// ============ TRANSACTION CRUD ============

// POST /api/admin/transaction - Create new transaction
router.post('/transaction', requireAdmin, async (req, res) => {
    try {
        const { user_id, amount, credits_purchased, payment_method, payment_status, invoice_number } = req.body;
        
        if (!user_id || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Transactions');
        const values = [
            id,
            user_id,
            new Date().toISOString(), // transaction_time
            amount,
            credits_purchased || '0',
            payment_method || 'Bank Transfer',
            payment_status || 'Pending',
            invoice_number || ''
        ];
        
        await appendRow('Transactions', values);
        
        res.json({ success: true, message: 'Transaction created successfully', data: { id } });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ success: false, message: 'Error creating transaction: ' + error.message });
    }
});

// PUT /api/admin/transaction/:id - Update transaction
router.put('/transaction/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, amount, credits_purchased, payment_method, payment_status, invoice_number } = req.body;
        
        const rowIndex = await findRowIndexById('Transactions', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Transactions!A${rowIndex}:H${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            user_id || existingRow[1],
            existingRow[2], // transaction_time (don't change)
            amount || existingRow[3],
            credits_purchased !== undefined ? credits_purchased : existingRow[4],
            payment_method || existingRow[5],
            payment_status || existingRow[6],
            invoice_number || existingRow[7]
        ];
        
        await updateRow('Transactions', rowIndex, values);
        
        res.json({ success: true, message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ success: false, message: 'Error updating transaction: ' + error.message });
    }
});

// DELETE /api/admin/transaction/:id - Delete transaction
router.delete('/transaction/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Transactions', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        
        await deleteRow('Transactions', rowIndex);
        
        res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ success: false, message: 'Error deleting transaction: ' + error.message });
    }
});

// ============ SCHEDULE CRUD ============

// POST /api/admin/schedule - Create new schedule
router.post('/schedule', requireAdmin, async (req, res) => {
    try {
        const { schedule_time, trainer_id, class_id, assigned_users, gender_restriction, status, notes } = req.body;
        
        if (!schedule_time || !trainer_id || !class_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Schedules');
        const usersList = assigned_users || '';
        
        const values = [
            id,
            schedule_time,
            trainer_id,
            class_id,
            usersList, // members (assigned users)
            gender_restriction || '',
            '', // placeholder
            notes || '',
            '', '', '', '', '', '', '', '', '',
            status || 'Active'
        ];
        
        await appendRow('Schedules', values);
        
        res.json({ success: true, message: 'Schedule created successfully', data: { id } });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ success: false, message: 'Error creating schedule: ' + error.message });
    }
});

// PUT /api/admin/schedule/:id - Update schedule
router.put('/schedule/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule_time, trainer_id, class_id, assigned_users, gender_restriction, status, notes } = req.body;
        
        const rowIndex = await findRowIndexById('Schedules', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Schedules!A${rowIndex}:R${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            schedule_time || existingRow[1],
            trainer_id || existingRow[2],
            class_id || existingRow[3],
            assigned_users !== undefined ? assigned_users : existingRow[4],
            gender_restriction !== undefined ? gender_restriction : existingRow[5],
            existingRow[6],
            notes !== undefined ? notes : existingRow[7],
            existingRow[8] || '',
            existingRow[9] || '',
            existingRow[10] || '',
            existingRow[11] || '',
            existingRow[12] || '',
            existingRow[13] || '',
            existingRow[14] || '',
            existingRow[15] || '',
            status || existingRow[16]
        ];
        
        await updateRow('Schedules', rowIndex, values);
        
        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: 'Error updating schedule: ' + error.message });
    }
});

// DELETE /api/admin/schedule/:id - Delete schedule
router.delete('/schedule/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Schedules', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        await deleteRow('Schedules', rowIndex);
        
        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ success: false, message: 'Error deleting schedule: ' + error.message });
    }
});

// ============ TRAINER CRUD ============

// POST /api/admin/trainer - Create new trainer
router.post('/trainer', requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, specialization, status, bio } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const id = await getNextId('Trainers');
        const values = [
            id,
            name,
            email,
            phone || '',
            specialization || '',
            '', // placeholder
            bio || '',
            status || 'Active',
            new Date().toISOString().split('T')[0] // joined_date
        ];
        
        await appendRow('Trainers', values);
        
        res.json({ success: true, message: 'Trainer created successfully', data: { id } });
    } catch (error) {
        console.error('Error creating trainer:', error);
        res.status(500).json({ success: false, message: 'Error creating trainer: ' + error.message });
    }
});

// PUT /api/admin/trainer/:id - Update trainer
router.put('/trainer/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, specialization, status, bio } = req.body;
        
        const rowIndex = await findRowIndexById('Trainers', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `Trainers!A${rowIndex}:I${rowIndex}`
        });
        
        const existingRow = response.data.values[0] || [];
        
        const values = [
            id,
            name || existingRow[1],
            email || existingRow[2],
            phone !== undefined ? phone : existingRow[3],
            specialization !== undefined ? specialization : existingRow[4],
            existingRow[5],
            bio !== undefined ? bio : existingRow[6],
            status || existingRow[7],
            existingRow[8] // joined_date (don't change)
        ];
        
        await updateRow('Trainers', rowIndex, values);
        
        res.json({ success: true, message: 'Trainer updated successfully' });
    } catch (error) {
        console.error('Error updating trainer:', error);
        res.status(500).json({ success: false, message: 'Error updating trainer: ' + error.message });
    }
});

// DELETE /api/admin/trainer/:id - Delete trainer
router.delete('/trainer/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rowIndex = await findRowIndexById('Trainers', id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }
        
        await deleteRow('Trainers', rowIndex);
        
        res.json({ success: true, message: 'Trainer deleted successfully' });
    } catch (error) {
        console.error('Error deleting trainer:', error);
        res.status(500).json({ success: false, message: 'Error deleting trainer: ' + error.message });
    }
});

module.exports = router;
