const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
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
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';
const SCHEDULES_SHEET = 'Schedules';
const TRAINERS_SHEET = 'Trainers';
const CLASSES_SHEET = 'Classes';
const BOOKINGS_SHEET = 'Bookings';

/**
 * Helper function to get sheets data
 */
async function getSheetsData(range) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });
  
  return response.data.values || [];
}

/**
 * Helper function to update sheets data
 */
async function updateSheetsData(range, values) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });
}

/**
 * Helper function to append sheets data
 */
async function appendSheetsData(range, values) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values },
  });
}

/**
 * Convert sheet row to schedule object
 */
function rowToSchedule(row, trainers, classes) {
  const [sid, stime, strain, sclass, smember, sgender, sallday, snotes, bid, flag, cuser, cpid, ctime, muser, mpid, mtime, status] = row;
  
  // Find trainer
  const trainer = trainers.find(t => t.id === strain) || {};
  
  // Find class
  const classInfo = classes.find(c => c.id === sclass) || {};
  
  // Parse members JSON
  let membersArray = [];
  try {
    membersArray = JSON.parse(smember || '[]');
  } catch (e) {
    membersArray = [];
  }
  
  return {
    sid,
    stime,
    strain,
    sclass,
    smember,
    sgender: sgender || '',
    sallday,
    snotes: snotes || '',
    bid,
    flag,
    cuser,
    cpid,
    ctime,
    muser,
    mpid,
    mtime,
    aname: trainer.name || '',
    aimg: trainer.image || '',
    cname: classInfo.name || '',
    cdur: classInfo.duration || '60',
    ccap: classInfo.capacity || '6',
    scap: membersArray.length,
    btnclass: 'enabled',
    bookclass: '',
    booked: '0'
  };
}

/**
 * GET /api/schedule?date=YYYY-MM-DD
 * Get upcoming schedules for specific date
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { date } = req.query;
    const userId = req.session.user.id || req.session.user.email;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in session' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    // Fetch all required data
    const [schedulesData, trainersData, classesData, bookingsData] = await Promise.all([
      getSheetsData(`${SCHEDULES_SHEET}!A2:Q`),
      getSheetsData(`${TRAINERS_SHEET}!A2:I`),
      getSheetsData(`${CLASSES_SHEET}!A2:H`),
      getSheetsData(`${BOOKINGS_SHEET}!A2:J`)
    ]);
    
    // Parse trainers
    const trainers = trainersData.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      specialization: row[4],
      image: row[5],
      bio: row[6],
      status: row[7],
      joined_date: row[8]
    }));
    
    // Parse classes
    const classes = classesData.map(row => ({
      id: row[0],
      name: row[1],
      duration: row[2],
      capacity: row[3],
      description: row[4],
      price: row[5],
      credits_required: row[6],
      status: row[7]
    }));
    
    // Parse bookings for current user
    const userBookings = bookingsData
      .filter(row => row[2] === userId.toString() && row[4] === 'Confirmed')
      .map(row => row[1]); // Get schedule IDs
    
    // Filter schedules for the requested date
    const targetDate = new Date(date).toISOString().split('T')[0];
    const schedules = schedulesData
      .filter(row => {
        const scheduleDate = row[1] ? row[1].split(' ')[0] : '';
        const status = row[16] || 'Active';
        return scheduleDate === targetDate && status === 'Active';
      })
      .map(row => {
        const schedule = rowToSchedule(row, trainers, classes);
        
        // Check if user has booked this class
        if (userBookings.includes(schedule.sid)) {
          schedule.booked = '1';
          schedule.bookclass = 'booked';
        }
        
        return schedule;
      })
      .sort((a, b) => new Date(a.stime) - new Date(b.stime));
    
    res.json({ schedule: schedules });
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

/**
 * GET /api/schedule/history
 * Get user's booking history
 */
router.get('/history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.session.user.id || req.session.user.email;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in session' });
    }
    
    // Fetch all required data
    const [schedulesData, trainersData, classesData, bookingsData] = await Promise.all([
      getSheetsData(`${SCHEDULES_SHEET}!A2:Q`),
      getSheetsData(`${TRAINERS_SHEET}!A2:I`),
      getSheetsData(`${CLASSES_SHEET}!A2:H`),
      getSheetsData(`${BOOKINGS_SHEET}!A2:J`)
    ]);
    
    // Parse trainers
    const trainers = trainersData.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      specialization: row[4],
      image: row[5],
      bio: row[6],
      status: row[7],
      joined_date: row[8]
    }));
    
    // Parse classes
    const classes = classesData.map(row => ({
      id: row[0],
      name: row[1],
      duration: row[2],
      capacity: row[3],
      description: row[4],
      price: row[5],
      credits_required: row[6],
      status: row[7]
    }));
    
    // Get user's bookings (past only)
    const userBookings = bookingsData
      .filter(row => {
        const bookingUserId = row[2];
        const bookingStatus = row[4];
        return bookingUserId === userId.toString() && 
               (bookingStatus === 'Confirmed' || bookingStatus === 'Completed');
      })
      .map(row => ({
        id: row[0],
        schedule_id: row[1],
        user_id: row[2],
        booking_time: row[3],
        status: row[4],
        attended: row[5],
        cancelled_time: row[6],
        notes: row[7],
        payment_status: row[8],
        credits_used: row[9]
      }));
    
    // Get schedule IDs
    const scheduleIds = userBookings.map(b => b.schedule_id);
    
    // Filter schedules for user's bookings (past classes only)
    const now = new Date();
    const schedules = schedulesData
      .filter(row => {
        const sid = row[0];
        const scheduleTime = new Date(row[1]);
        return scheduleIds.includes(sid) && scheduleTime < now;
      })
      .map(row => {
        const schedule = rowToSchedule(row, trainers, classes);
        schedule.booked = '1';
        schedule.bookclass = 'booked';
        
        // Add jsonmember field for history display (participants list)
        try {
          const membersArray = JSON.parse(schedule.smember || '[]');
          schedule.jsonmember = JSON.stringify(
            membersArray.map(mid => ({ aid: mid, aname: 'Member ' + mid, aimg: '' }))
          );
        } catch (e) {
          schedule.jsonmember = '[]';
        }
        
        return schedule;
      })
      .sort((a, b) => new Date(b.stime) - new Date(a.stime)); // Most recent first
    
    res.json({ schedule: schedules });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch booking history' });
  }
});

/**
 * POST /api/schedule/book
 * Book a class
 */
router.post('/book', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { sid } = req.body;
    const userId = req.session.user.id;
    
    console.log('Booking request:', { sid, userId, sessionUser: req.session.user });
    
    if (!sid) {
      return res.status(400).json({ success: false, message: 'Schedule ID is required' });
    }
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID not found in session' });
    }
    
    // Get schedule data
    const schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
    const scheduleIndex = schedulesData.findIndex(row => row[0] === sid);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const scheduleRow = schedulesData[scheduleIndex];
    const [scheduleId, stime, strain, sclass, smember, sgender, sallday, snotes, bid, flag, cuser, cpid, ctime, muser, mpid, mtime, status] = scheduleRow;
    
    // Parse current members
    let membersArray = [];
    try {
      membersArray = JSON.parse(smember || '[]');
    } catch (e) {
      membersArray = [];
    }
    
    // Check if already booked
    if (membersArray.includes(userId.toString())) {
      return res.status(400).json({ success: false, message: 'You have already booked this class' });
    }
    
    // Get class capacity
    const classesData = await getSheetsData(`${CLASSES_SHEET}!A2:H`);
    const classInfo = classesData.find(row => row[0] === sclass);
    const capacity = classInfo ? parseInt(classInfo[3]) : 6;
    
    // Check if full
    if (membersArray.length >= capacity) {
      return res.status(400).json({ success: false, message: 'Class is full' });
    }
    
    // Add user to members array
    membersArray.push(userId.toString());
    const updatedMembers = JSON.stringify(membersArray);
    
    // Update schedule row
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedRow = [
      scheduleId, stime, strain, sclass, updatedMembers, sgender, sallday, snotes, bid, flag,
      cuser, cpid, ctime, req.session.user.email || userId, 'controller\\api\\scheduleservice::bookapply', now, status
    ];
    
    await updateSheetsData(`${SCHEDULES_SHEET}!A${scheduleIndex + 2}:Q${scheduleIndex + 2}`, [updatedRow]);
    
    // Add booking record
    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const newBookingId = bookingsData.length > 0 ? parseInt(bookingsData[bookingsData.length - 1][0]) + 1 : 1;
    
    const bookingRow = [
      newBookingId,
      sid,
      userId,
      now,
      'Confirmed',
      '0', // attended
      '', // cancelled_time
      '', // notes
      'Paid', // payment_status
      '1' // credits_used
    ];
    
    await appendSheetsData(`${BOOKINGS_SHEET}!A:J`, [bookingRow]);
    
    res.json({ success: true, message: 'Class booked successfully' });
    
  } catch (error) {
    console.error('Error booking class:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to book class', error: error.message });
  }
});

/**
 * POST /api/schedule/cancel
 * Cancel a booking
 */
router.post('/cancel', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { sid } = req.body;
    const userId = req.session.user.id || req.session.user.email;
    
    console.log('Cancel booking request:', { sid, userId, sessionUser: req.session.user });
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID not found in session' });
    }
    
    if (!sid) {
      return res.status(400).json({ success: false, message: 'Schedule ID is required' });
    }
    
    // Get schedule data
    const schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
    const scheduleIndex = schedulesData.findIndex(row => row[0] === sid);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    
    const scheduleRow = schedulesData[scheduleIndex];
    const [scheduleId, stime, strain, sclass, smember, sgender, sallday, snotes, bid, flag, cuser, cpid, ctime, muser, mpid, mtime, status] = scheduleRow;
    
    // Parse current members
    let membersArray = [];
    try {
      membersArray = JSON.parse(smember || '[]');
    } catch (e) {
      membersArray = [];
    }
    
    // Check if user has booked
    if (!membersArray.includes(userId.toString())) {
      return res.status(400).json({ success: false, message: 'You have not booked this class' });
    }
    
    // Remove user from members array
    membersArray = membersArray.filter(id => id !== userId.toString());
    const updatedMembers = JSON.stringify(membersArray);
    
    // Update schedule row
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedRow = [
      scheduleId, stime, strain, sclass, updatedMembers, sgender, sallday, snotes, bid, flag,
      cuser, cpid, ctime, req.session.user.email || userId, 'controller\\api\\scheduleservice::bookcancel', now, status
    ];
    
    await updateSheetsData(`${SCHEDULES_SHEET}!A${scheduleIndex + 2}:Q${scheduleIndex + 2}`, [updatedRow]);
    
    // Update booking record to Cancelled
    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const bookingIndex = bookingsData.findIndex(row => 
      row[1] === sid && row[2] === userId.toString() && row[4] === 'Confirmed'
    );
    
    if (bookingIndex !== -1) {
      const bookingRow = bookingsData[bookingIndex];
      bookingRow[4] = 'Cancelled'; // status
      bookingRow[6] = now; // cancelled_time
      
      await updateSheetsData(`${BOOKINGS_SHEET}!A${bookingIndex + 2}:J${bookingIndex + 2}`, [bookingRow]);
    }
    
    res.json({ success: true, message: 'Booking cancelled successfully' });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
});

module.exports = router;
