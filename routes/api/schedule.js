const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const bcrypt = require('bcryptjs');

// Credentials come from env vars (not credentials.json, which is gitignored and never deployed).
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

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';
const SCHEDULES_SHEET = 'Schedules';
const TRAINERS_SHEET = 'Trainers';
const CLASSES_SHEET = 'Classes';
const BOOKINGS_SHEET = 'Bookings';
const SUBSCRIPTIONS_SHEET = 'Subscriptions';
const USERS_SHEET = 'Users';

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
 * RAW (not USER_ENTERED) so date/time strings like "2026-08-07 07:00:00" are stored as the
 * literal text the app expects — USER_ENTERED auto-detects them as dates/numbers and corrupts
 * the column (e.g. becomes a raw serial number, or a time value loses its leading zero).
 */
async function updateSheetsData(range, values) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'RAW',
    resource: { values },
  });
}

/**
 * Helper function to append sheets data (see updateSheetsData for why RAW is used)
 */
async function appendSheetsData(range, values) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: { values },
  });
}

/**
 * Booking quota helpers — quota is derived from the Subscriptions sheet (one row per membership
 * package a member has registered for), not stored as a mutable counter. This keeps the ledger
 * (total_sessions granted vs used_sessions consumed) as the single source of truth so nothing can
 * drift out of sync with actual bookings.
 */
function toDateOnlyStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSubscriptionActive(endDate) {
  if (!endDate) return true;
  return endDate.slice(0, 10) >= toDateOnlyStr(new Date());
}

async function getUserSubscriptions(userId) {
  const uid = (userId || '').toString();
  const rows = await getSheetsData(`${SUBSCRIPTIONS_SHEET}!A2:J`);
  return rows
    .map((row, idx) => ({
      rowIndex: idx, // sheet row number = rowIndex + 2 (header is row 1)
      id: row[0],
      memberId: row[1],
      packageName: row[2] || '',
      startDate: row[3] || '',
      endDate: row[4] || '',
      totalSessions: parseInt(row[5], 10) || 0,
      usedSessions: parseInt(row[6], 10) || 0,
      buddyMemberId: row[7] || '',
      buddyName: row[8] || '',
    }))
    // Couple packages are shared: the row counts for both the primary member and their buddy,
    // and both draw from the same total_sessions/used_sessions pool (one shared subscription row).
    .filter(s => s.id && (s.memberId === uid || s.buddyMemberId === uid));
}

async function getUserQuota(userId) {
  const subscriptions = await getUserSubscriptions(userId);
  const active = subscriptions.filter(s => isSubscriptionActive(s.endDate));
  const total = active.reduce((sum, s) => sum + s.totalSessions, 0);
  const used = active.reduce((sum, s) => sum + s.usedSessions, 0);

  // Soonest end_date among active subscriptions that still have sessions left — the date by
  // which those sessions must be used or they lapse (consumeQuota draws from this one first).
  const expiryDate = active
    .filter(s => s.totalSessions - s.usedSessions > 0)
    .map(s => s.endDate)
    .filter(Boolean)
    .sort()[0] || null;

  return { total, used, remaining: Math.max(0, total - used), expiryDate, activeSubscriptions: active };
}

function isTrialPackage(packageName) {
  return (packageName || '').trim().toLowerCase() === 'trial';
}

// A Trial subscription grants at most one session per coach (not just a raw session count), so
// consuming it needs to know which trainers it has already been used for. Derived from the
// Bookings sheet (Confirmed rows tagged sub:<this subscription>) rather than stored separately,
// so cancels/refunds stay automatically correct with no extra bookkeeping.
async function getTrialUsedTrainers(subscriptionId) {
  const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
  const relevant = bookingsData.filter(row => row[4] === 'Confirmed' && extractSubTag(row[7]) === subscriptionId.toString());
  if (relevant.length === 0) return new Set();

  const schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
  const trainerByScheduleId = new Map(schedulesData.map(row => [row[0], row[2]]));

  const trainers = new Set();
  relevant.forEach(row => {
    const trainerId = trainerByScheduleId.get(row[1]);
    if (trainerId) trainers.add(trainerId);
  });
  return trainers;
}

// Active subscriptions that can actually cover a booking with the given trainer, soonest-expiring
// first. Trial subscriptions are excluded once already used for that trainer. When trainerId is
// omitted (no specific booking in mind), Trial subscriptions are included unconditionally — used
// for quota display, not for gating an actual booking.
async function getUsableSubscriptions(userId, trainerId) {
  const { activeSubscriptions } = await getUserQuota(userId);
  const usable = [];
  for (const sub of activeSubscriptions) {
    const isTrial = isTrialPackage(sub.packageName);
    // Trial isn't a fixed pool (its total_sessions is just the nominal "1" shown in the
    // catalog) — it's "1 session per coach," unbounded in how many different coaches can be
    // tried, so a Trial subscription never runs out the way a normal package does.
    if (!isTrial && sub.totalSessions - sub.usedSessions <= 0) continue;
    if (trainerId && isTrial) {
      const usedTrainers = await getTrialUsedTrainers(sub.id);
      if (usedTrainers.has(trainerId.toString())) continue;
    }
    usable.push(sub);
  }
  // Soonest-expiring first; no-expiry subscriptions (Trial, Drop In) sort last so a package that's
  // actually about to lapse gets used before one that never does.
  return usable.sort((a, b) => {
    if (!a.endDate && !b.endDate) return 0;
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return a.endDate.localeCompare(b.endDate);
  });
}

// Deducts one session from whichever usable subscription expires soonest (respecting the Trial
// once-per-coach rule when trainerId is given). Returns the subscription id consumed (so a later
// cancel can refund the same one), or null if none available.
async function consumeQuota(userId, trainerId) {
  const usable = await getUsableSubscriptions(userId, trainerId);
  if (usable.length === 0) return null;

  const sub = usable[0];
  await updateSheetsData(`${SUBSCRIPTIONS_SHEET}!G${sub.rowIndex + 2}`, [[sub.usedSessions + 1]]);
  return sub.id;
}

// Gate check shared by every booking path: is there actually a subscription this booking could
// charge? Distinguishes "no quota at all" from "only a Trial left, but already used for this
// coach" so the member gets a message that tells them what to actually do about it.
async function checkBookableQuota(userId, trainerId) {
  const usable = await getUsableSubscriptions(userId, trainerId);
  if (usable.length > 0) return null; // no error

  // Trial subscriptions never get excluded by exhaustion (see getUsableSubscriptions), so if one
  // is active but still ended up filtered out above, it can only be the per-coach check blocking
  // this specific trainer.
  const { activeSubscriptions } = await getUserQuota(userId);
  const hasUnusableTrial = trainerId && activeSubscriptions.some(s => isTrialPackage(s.packageName));

  return hasUnusableTrial
    ? 'Anda sudah menggunakan sesi trial dengan coach ini. Silakan pilih coach lain, atau daftar paket lain untuk melanjutkan.'
    : 'Kuota booking Anda sudah habis. Silakan hubungi admin untuk mendaftarkan paket membership.';
}

async function refundQuota(userId, subscriptionId) {
  if (!subscriptionId) return;
  const subscriptions = await getUserSubscriptions(userId);
  const sub = subscriptions.find(s => s.id === subscriptionId.toString());
  if (!sub) return;
  await updateSheetsData(`${SUBSCRIPTIONS_SHEET}!G${sub.rowIndex + 2}`, [[Math.max(0, sub.usedSessions - 1)]]);
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

// Google Sheets can return time-formatted cells without a leading zero (e.g. "7:00"), so time
// strings must be compared numerically, not lexicographically.
function timeToMinutesServer(timeStr) {
  const [h, m] = (timeStr || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Parses a Schedules row's stime ("YYYY-MM-DD H:MM:SS", possibly without a leading zero on the
// hour) into a real Date. Returns null if it doesn't match the expected shape.
function parseScheduleDateTime(stime) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(stime || '');
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0));
}

// A member's class list is built client-side from Regular/Custom slot templates that don't
// exist as real Schedules rows until someone books into them. `sid` values like
// "REG-2026-08-07-0" or a CustomSchedules row id ("CS-...") won't be found in the Schedules
// sheet on first booking — this resolves what such a virtual sid actually refers to.
async function resolveVirtualSlot(sid) {
  const regMatch = /^REG-(\d{4}-\d{2}-\d{2})-(\d+)$/.exec(sid);
  if (regMatch) {
    const dateStr = regMatch[1];
    const index = parseInt(regMatch[2], 10);
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();

    let slots = [];
    try {
      const rows = await getSheetsData('RegularSchedule!A2:H');
      if (rows.length > 0) {
        slots = rows
          .filter(r => r[0] && (r[7] || 'active') !== 'deleted')
          .map(r => ({ day: parseInt(r[1]), time: r[2], trainer: r[3], classType: r[4], duration: r[5] || '60', capacity: r[6] || '6' }));
      }
    } catch (e) { /* fall through to defaults */ }
    if (slots.length === 0) slots = DEFAULT_REGULAR_SLOTS;

    const slot = slots.filter(s => s.day === dayOfWeek)[index];
    if (!slot) return null;

    return {
      dateStr, time: slot.time, trainerName: slot.trainer, classTypeName: slot.classType,
      notes: `Regular: ${slot.classType} (Coach ${slot.trainer})`
    };
  }

  if (sid.startsWith('CS-')) {
    const rows = await getSheetsData('CustomSchedules!A2:K');
    const row = rows.find(r => r[0] === sid && (r[10] || 'active') !== 'deleted');
    if (!row) return null;
    const [, date, time, trainer, classType, , , notes] = row;
    return {
      dateStr: date, time, trainerName: trainer, classTypeName: classType,
      notes: notes || `Custom: ${classType} (Coach ${trainer})`
    };
  }

  return null;
}

function fuzzyMatchByName(rows, nameIndex, needle) {
  const n = (needle || '').trim().toLowerCase();
  if (!n) return null;
  const exact = rows.find(r => (r[nameIndex] || '').trim().toLowerCase() === n);
  if (exact) return exact;
  return rows.find(r => {
    const name = (r[nameIndex] || '').trim().toLowerCase();
    return name.includes(n) || n.includes(name);
  }) || null;
}

// Finds the real Schedules row a (possibly virtual) sid refers to. If it doesn't exist yet and
// `create` is true, materializes it from its Regular/Custom template first. Returns
// { schedulesData, scheduleIndex } or null.
async function findOrMaterializeSchedule(sid, create) {
  let schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
  let scheduleIndex = schedulesData.findIndex(row => row[0] === sid);
  if (scheduleIndex !== -1) return { schedulesData, scheduleIndex };

  const slotInfo = await resolveVirtualSlot(sid);
  if (!slotInfo) return null;

  // Someone (an admin, or an earlier booking under a different id) may have already
  // materialized this exact date+time — reuse that row instead of creating a duplicate.
  scheduleIndex = schedulesData.findIndex(row => {
    const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/.exec((row[1] || '').trim());
    return !!m && m[1] === slotInfo.dateStr && timeToMinutesServer(m[2]) === timeToMinutesServer(slotInfo.time);
  });
  if (scheduleIndex !== -1) return { schedulesData, scheduleIndex };

  if (!create) return null;

  const [trainersRows, classesRows] = await Promise.all([
    getSheetsData(`${TRAINERS_SHEET}!A2:I`),
    getSheetsData(`${CLASSES_SHEET}!A2:H`)
  ]);
  const trainerRow = fuzzyMatchByName(trainersRows, 1, slotInfo.trainerName);
  const classRow = fuzzyMatchByName(classesRows, 1, slotInfo.classTypeName);
  if (!trainerRow || !classRow) {
    const err = new Error('CLASS_NOT_CONFIGURED');
    err.code = 'CLASS_NOT_CONFIGURED';
    throw err;
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newRow = [
    sid, `${slotInfo.dateStr} ${slotInfo.time}:00`, trainerRow[0], classRow[0], '[]',
    '', '0', slotInfo.notes, '', '0', 'system', '', now, 'system', '', now, 'Active'
  ];
  await appendSheetsData(`${SCHEDULES_SHEET}!A:Q`, [newRow]);

  schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
  scheduleIndex = schedulesData.findIndex(row => row[0] === sid);
  if (scheduleIndex === -1) return null;
  return { schedulesData, scheduleIndex };
}

// Thrown by the booking/cancel primitives below for expected, user-facing failures (already
// booked, class full, etc.) so route handlers can map them to the right HTTP status + message
// instead of falling through to a generic 500.
class BookingError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Looks up (materializing if needed) a schedule slot's trainer and start time, without adding
// anyone to it. Booking routes need this before deciding whether the member has usable quota for
// this specific trainer (the Trial package's once-per-coach rule) or whether it's too close to
// start time — ahead of actually claiming a seat, so a rejected booking never mutates the
// Schedules sheet's members array.
async function resolveScheduleInfo(sid) {
  const resolved = await findOrMaterializeSchedule(sid, true);
  if (!resolved) return null;
  const row = resolved.schedulesData[resolved.scheduleIndex];
  return { trainerId: row[2], stime: row[1] };
}

// Adds a member's seat to a schedule (materializing it from its Regular/Custom template first if
// needed), enforcing the same rules a member booking for themselves would hit: already booked,
// class full. Shared by the member-facing /book route and the admin add/edit-booking routes so
// there's exactly one place that can add a seat — no route can desync the Schedules sheet from
// what admin-created bookings say happened.
async function addMemberToSchedule(sid, userId, actorEmail) {
  let resolved;
  try {
    resolved = await findOrMaterializeSchedule(sid, true);
  } catch (err) {
    if (err.code === 'CLASS_NOT_CONFIGURED') {
      throw new BookingError(400, 'Kelas ini belum dikonfigurasi lengkap (trainer/kelas tidak ditemukan). Hubungi admin.');
    }
    throw err;
  }
  if (!resolved) {
    throw new BookingError(404, 'Schedule not found');
  }
  const { schedulesData, scheduleIndex } = resolved;

  const scheduleRow = schedulesData[scheduleIndex];
  const [scheduleId, stime, strain, sclass, smember, sgender, sallday, snotes, bid, flag, cuser, cpid, ctime, , , , status] = scheduleRow;

  let membersArray = [];
  try { membersArray = JSON.parse(smember || '[]'); } catch (e) { membersArray = []; }

  if (membersArray.includes(userId.toString())) {
    throw new BookingError(400, 'Member ini sudah terdaftar pada kelas tersebut.');
  }

  const classesData = await getSheetsData(`${CLASSES_SHEET}!A2:H`);
  const classInfo = classesData.find(row => row[0] === sclass);
  const capacity = classInfo ? parseInt(classInfo[3]) : 6;

  if (membersArray.length >= capacity) {
    throw new BookingError(400, 'Kelas sudah penuh.');
  }

  membersArray.push(userId.toString());
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedScheduleRow = [
    scheduleId, stime, strain, sclass, JSON.stringify(membersArray), sgender, sallday, snotes, bid, flag,
    cuser, cpid, ctime, actorEmail || userId, 'controller\\api\\scheduleservice::bookapply', now, status
  ];
  await updateSheetsData(`${SCHEDULES_SHEET}!A${scheduleIndex + 2}:Q${scheduleIndex + 2}`, [updatedScheduleRow]);

  return { scheduleId };
}

// Removes a member's seat from an already-materialized schedule row. Best-effort: if the
// schedule row is gone, it silently no-ops (nothing left to free) rather than failing the cancel.
async function removeMemberFromSchedule(scheduleId, userId, actorEmail) {
  const schedulesData = await getSheetsData(`${SCHEDULES_SHEET}!A2:Q`);
  const scheduleIndex = schedulesData.findIndex(row => row[0] === scheduleId);
  if (scheduleIndex === -1) return;

  const scheduleRow = schedulesData[scheduleIndex];
  const [sId, stime, strain, sclass, smember, sgender, sallday, snotes, bid, flag, cuser, cpid, ctime, , , , status] = scheduleRow;
  let membersArray = [];
  try { membersArray = JSON.parse(smember || '[]'); } catch (e) { membersArray = []; }
  membersArray = membersArray.filter(id => id !== userId.toString());

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedScheduleRow = [
    sId, stime, strain, sclass, JSON.stringify(membersArray), sgender, sallday, snotes, bid, flag,
    cuser, cpid, ctime, actorEmail || userId, 'controller\\api\\scheduleservice::bookcancel', now, status
  ];
  await updateSheetsData(`${SCHEDULES_SHEET}!A${scheduleIndex + 2}:Q${scheduleIndex + 2}`, [updatedScheduleRow]);
}

// Cancels an already-fetched booking row by index: frees its schedule seat, marks it Cancelled,
// and refunds the session to whichever subscription it was charged against. Mutates bookingRow
// in place (status/cancelled_time) so a caller building on top of this sees the new values.
async function cancelBookingAt(bookingsData, bookingIndex, actorEmail) {
  const bookingRow = bookingsData[bookingIndex];
  const [, scheduleId, userId] = bookingRow;

  await removeMemberFromSchedule(scheduleId, userId, actorEmail);

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  bookingRow[4] = 'Cancelled';
  bookingRow[6] = now;
  await updateSheetsData(`${BOOKINGS_SHEET}!A${bookingIndex + 2}:J${bookingIndex + 2}`, [bookingRow]);

  const subTag = extractSubTag(bookingRow[7]);
  if (subTag) {
    await refundQuota(userId, subTag);
  }
}

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

    const scheduleInfo = await resolveScheduleInfo(sid);

    // Self-service booking closes 1 hour before the class starts (e.g. a 17:00 class stops
    // taking bookings at 16:00). Admin booking on a member's behalf is exempt — see /admin/book.
    const classStart = scheduleInfo && parseScheduleDateTime(scheduleInfo.stime);
    if (classStart && classStart.getTime() - Date.now() <= 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Booking untuk kelas ini sudah ditutup (1 jam sebelum kelas dimulai).' });
    }

    // Member must have an active membership package with remaining sessions to book — resolved
    // per-trainer since a Trial subscription only covers each coach once.
    const trainerId = scheduleInfo && scheduleInfo.trainerId;
    const quotaError = await checkBookableQuota(userId, trainerId);
    if (quotaError) {
      return res.status(400).json({ success: false, message: quotaError });
    }

    let scheduleId;
    try {
      ({ scheduleId } = await addMemberToSchedule(sid, userId, req.session.user.email));
    } catch (err) {
      if (err instanceof BookingError) {
        return res.status(err.status).json({ success: false, message: err.message });
      }
      throw err;
    }

    // Add booking record — schedule_id must point at the real (materialized) schedule row's
    // id, which can differ from the virtual sid the client sent.
    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const newBookingId = bookingsData.length > 0 ? parseInt(bookingsData[bookingsData.length - 1][0]) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Deduct 1 session from the member's soonest-expiring usable subscription. Record which
    // subscription was charged in the booking's notes field so a later cancel can refund it.
    const subscriptionId = await consumeQuota(userId, trainerId);

    const bookingRow = [
      newBookingId,
      scheduleId,
      userId,
      now,
      'Confirmed',
      '0', // attended
      '', // cancelled_time
      subscriptionId ? `sub:${subscriptionId}` : '', // notes
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
    
    // Get schedule data (resolves a virtual Regular/Custom sid to its real row if one exists)
    const resolved = await findOrMaterializeSchedule(sid, false);
    if (!resolved) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    const { schedulesData, scheduleIndex } = resolved;

    const scheduleRow = schedulesData[scheduleIndex];
    const [scheduleId, , , , smember] = scheduleRow;

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

    // Matched by the real schedule id, which can differ from the virtual sid the client sent
    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const bookingIndex = bookingsData.findIndex(row =>
      row[1] === scheduleId && row[2] === userId.toString() && row[4] === 'Confirmed'
    );

    if (bookingIndex !== -1) {
      await cancelBookingAt(bookingsData, bookingIndex, req.session.user.email);
    } else {
      // No matching booking record — still free the seat so state doesn't stay stuck
      await removeMemberFromSchedule(scheduleId, userId, req.session.user.email);
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
});

/**
 * POST /api/schedule/admin/cancel
 * Cancel a member's booking on their behalf (Admin only) — same effect as the member cancelling
 * it themselves: frees their seat on the schedule, marks the booking Cancelled, and refunds the
 * session to whichever subscription it was charged against.
 */
router.post('/admin/cancel', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const bookingIndex = bookingsData.findIndex(row => row[0] === bookingId.toString());
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (bookingsData[bookingIndex][4] !== 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Booking is not active (already cancelled or completed)' });
    }

    await cancelBookingAt(bookingsData, bookingIndex, req.session.user.email);

    res.json({ success: true, message: 'Booking cancelled by admin' });
  } catch (error) {
    console.error('Error admin-cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
});

// The notes column doubles as a `sub:<id>` tag tracking which subscription a booking charged, so
// cancel/refund and edits know what to reverse. Search for the token rather than requiring an
// exact match, since admin-edited notes may have free text alongside it.
function extractSubTag(notes) {
  const m = /sub:(\S+)/.exec(notes || '');
  return m ? m[1] : null;
}

/**
 * POST /api/schedule/admin/book
 * Book a class on behalf of a member (Admin only) — runs the same rules as a member booking for
 * themselves: checks capacity, deducts a session from their membership quota, adds their seat.
 */
router.post('/admin/book', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { sid, userId } = req.body;
    if (!sid || !userId) {
      return res.status(400).json({ success: false, message: 'sid and userId are required' });
    }

    const adminScheduleInfo = await resolveScheduleInfo(sid);
    const trainerId = adminScheduleInfo && adminScheduleInfo.trainerId;
    const quotaError = await checkBookableQuota(userId, trainerId);
    if (quotaError) {
      return res.status(400).json({ success: false, message: quotaError });
    }

    let scheduleId;
    try {
      ({ scheduleId } = await addMemberToSchedule(sid, userId, req.session.user.email));
    } catch (err) {
      if (err instanceof BookingError) {
        return res.status(err.status).json({ success: false, message: err.message });
      }
      throw err;
    }

    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const newBookingId = bookingsData.length > 0 ? parseInt(bookingsData[bookingsData.length - 1][0]) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const subscriptionId = await consumeQuota(userId, trainerId);

    const bookingRow = [
      newBookingId, scheduleId, userId, now, 'Confirmed',
      '0', '', subscriptionId ? `sub:${subscriptionId}` : '', 'Paid', '1'
    ];
    await appendSheetsData(`${BOOKINGS_SHEET}!A:J`, [bookingRow]);

    res.json({ success: true, message: 'Booking berhasil dibuat', bookingId: newBookingId });
  } catch (error) {
    console.error('Error admin-booking class:', error);
    res.status(500).json({ success: false, message: 'Failed to book class', error: error.message });
  }
});

/**
 * PUT /api/schedule/admin/booking/:id
 * Edit a booking (Admin only). Changing status to/from Cancelled, or moving it to a different
 * schedule/member, routes through the same seat/quota primitives as booking and cancelling so
 * the Schedules sheet and the member's quota never fall out of sync with what this says happened.
 * Editing only attended/payment_status/credits_used/notes is a plain field update.
 */
router.put('/admin/booking/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    const { schedule_id, user_id, status, attended, payment_status, credits_used, notes } = req.body;

    const bookingsData = await getSheetsData(`${BOOKINGS_SHEET}!A2:J`);
    const bookingIndex = bookingsData.findIndex(row => row[0] === id.toString());
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const bookingRow = bookingsData[bookingIndex];
    const oldScheduleId = bookingRow[1];
    const oldUserId = bookingRow[2].toString();
    const oldStatus = bookingRow[4];

    const newScheduleId = schedule_id || oldScheduleId;
    const newUserId = (user_id !== undefined && user_id !== '') ? user_id.toString() : oldUserId;
    const newStatus = status || oldStatus;
    const assignmentChanged = newScheduleId !== oldScheduleId || newUserId !== oldUserId;
    const priorSubTag = extractSubTag(bookingRow[7]);

    // Free the old seat + refund its quota first, if it was an active seat being cancelled or
    // reassigned to a different schedule/member.
    if (oldStatus === 'Confirmed' && (newStatus === 'Cancelled' || assignmentChanged)) {
      await cancelBookingAt(bookingsData, bookingIndex, req.session.user.email);
    }

    // Claim a new seat + quota if the booking should end up Confirmed and doesn't already have
    // one — either the assignment changed, or it's being (re)activated from Cancelled/Completed.
    let freshSubTag; // left undefined unless this branch actually charges a new subscription
    if (newStatus === 'Confirmed' && (assignmentChanged || oldStatus !== 'Confirmed')) {
      const editScheduleInfo = await resolveScheduleInfo(newScheduleId);
      const newTrainerId = editScheduleInfo && editScheduleInfo.trainerId;
      const quotaError = await checkBookableQuota(newUserId, newTrainerId);
      if (quotaError) {
        return res.status(400).json({ success: false, message: quotaError });
      }
      let resolvedScheduleId;
      try {
        ({ scheduleId: resolvedScheduleId } = await addMemberToSchedule(newScheduleId, newUserId, req.session.user.email));
      } catch (err) {
        if (err instanceof BookingError) {
          return res.status(err.status).json({ success: false, message: err.message });
        }
        throw err;
      }
      const subscriptionId = await consumeQuota(newUserId, newTrainerId);
      freshSubTag = subscriptionId || '';
      bookingRow[1] = resolvedScheduleId;
      bookingRow[2] = newUserId;
    }

    // The notes column also carries the sub:<id> tracking tag — preserve whichever one is now
    // correct (fresh charge, or the pre-existing one) rather than letting a free-text edit wipe it.
    const tagToKeep = freshSubTag !== undefined ? freshSubTag : priorSubTag;
    if (notes !== undefined) {
      const cleanText = notes.replace(/sub:\S+/g, '').trim();
      bookingRow[7] = [cleanText, tagToKeep ? `sub:${tagToKeep}` : ''].filter(Boolean).join(' ');
    } else if (freshSubTag !== undefined) {
      bookingRow[7] = freshSubTag ? `sub:${freshSubTag}` : '';
    }

    bookingRow[4] = newStatus;
    if (attended !== undefined) bookingRow[5] = attended;
    if (newStatus === 'Cancelled' && !bookingRow[6]) {
      bookingRow[6] = new Date().toISOString().replace('T', ' ').substring(0, 19);
    } else if (newStatus !== 'Cancelled') {
      bookingRow[6] = ''; // reactivated — clear any prior cancellation timestamp
    }
    if (payment_status !== undefined) bookingRow[8] = payment_status;
    if (credits_used !== undefined) bookingRow[9] = credits_used;

    await updateSheetsData(`${BOOKINGS_SHEET}!A${bookingIndex + 2}:J${bookingIndex + 2}`, [bookingRow]);

    res.json({ success: true, message: 'Booking berhasil diperbarui' });
  } catch (error) {
    console.error('Error admin-editing booking:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
});

/**
 * GET /api/schedule/quota
 * Get the current user's booking quota (derived from their active membership subscriptions)
 */
router.get('/quota', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const quota = await getUserQuota(req.session.user.id);
    res.json({ total: quota.total, used: quota.used, remaining: quota.remaining, expiryDate: quota.expiryDate });
  } catch (error) {
    console.error('Error fetching quota:', error);
    res.status(500).json({ error: 'Failed to fetch quota' });
  }
});

/**
 * GET /api/schedule/coach-week?start=YYYY-MM-DD
 * Weekly calendar for the logged-in coach: their own sessions show full detail (who's
 * booked), every other coach's sessions show only that a slot is occupied — the coach
 * running it is hidden behind "Coach Lain" so trainers can't see each other's rosters.
 */
router.get('/coach-week', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'trainer') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { start } = req.query;
    if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      return res.status(400).json({ error: 'start (YYYY-MM-DD) is required' });
    }

    const [regularRows, customRows, schedulesRows, trainerRows, classRows] = await Promise.all([
      getSheetsData('RegularSchedule!A2:I'),
      getSheetsData('CustomSchedules!A2:K'),
      getSheetsData(`${SCHEDULES_SHEET}!A2:Q`),
      getSheetsData(`${TRAINERS_SHEET}!A2:I`),
      getSheetsData(`${CLASSES_SHEET}!A2:H`),
    ]);

    const classByName = new Map(classRows.map(r => [(r[1] || '').trim().toLowerCase(), r]));
    const myTrainerId = req.session.user.id.toString();

    function resolveTrainer(nameOrId) {
      const direct = trainerRows.find(r => r[0] === nameOrId);
      if (direct) return direct;
      return fuzzyMatchByName(trainerRows, 1, nameOrId);
    }

    const [startY, startM, startD] = start.split('-').map(Number);
    const startDate = new Date(startY, startM - 1, startD);

    const days = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dayOfWeek = d.getDay();

      const templateSlots = [];
      for (const r of regularRows) {
        if (r[0] && parseInt(r[1]) === dayOfWeek && (r[7] || 'active') !== 'deleted') {
          templateSlots.push({ time: r[2], trainerRaw: r[3], classType: r[4], duration: r[5] || '60', capacity: r[6] || '6' });
        }
      }
      for (const r of customRows) {
        if (r[1] === dateStr && (r[10] || 'active') === 'active') {
          templateSlots.push({ time: r[2], trainerRaw: r[3], classType: r[4], duration: r[5] || '60', capacity: r[6] || '6' });
        }
      }

      const slots = templateSlots.map(t => {
        const trainerRow = resolveTrainer(t.trainerRaw);
        const trainerId = trainerRow ? trainerRow[0] : null;
        const isMine = trainerId === myTrainerId;

        const realRow = schedulesRows.find(r => {
          const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/.exec((r[1] || '').trim());
          return !!m && m[1] === dateStr && timeToMinutesServer(m[2]) === timeToMinutesServer(t.time) && (r[16] || 'Active') !== 'Cancelled';
        });
        let bookedCount = 0, members = undefined;
        if (realRow) {
          try {
            const arr = JSON.parse(realRow[4] || '[]');
            bookedCount = arr.length;
            if (isMine) members = arr;
          } catch (e) { /* ignore malformed members json */ }
        }

        const classRow = classByName.get((t.classType || '').trim().toLowerCase());

        return {
          time: t.time,
          classType: t.classType,
          duration: t.duration,
          capacity: classRow ? classRow[3] : t.capacity,
          isMine,
          coachName: isMine ? (trainerRow ? trainerRow[1] : req.session.user.name) : 'Coach Lain',
          bookedCount,
          members,
        };
      }).sort((a, b) => timeToMinutesServer(a.time) - timeToMinutesServer(b.time));

      days.push({ date: dateStr, dayOfWeek, slots });
    }

    // Resolve member ids -> names only for the viewer's own slots (privacy: never done for
    // other coaches' slots, which never populate `members` in the first place).
    const neededIds = new Set();
    for (const day of days) for (const s of day.slots) if (s.members) s.members.forEach(id => neededIds.add(id));
    if (neededIds.size) {
      const usersRows = await getSheetsData(`${USERS_SHEET}!A2:B`);
      const nameById = new Map(usersRows.map(r => [r[0], r[1]]));
      for (const day of days) for (const s of day.slots) if (s.members) s.members = s.members.map(id => nameById.get(id) || `Member ${id}`);
    }

    res.json({ days });
  } catch (error) {
    console.error('Error fetching coach week:', error);
    res.status(500).json({ error: 'Failed to fetch coach schedule' });
  }
});

/**
 * POST /api/schedule/change-password
 * Member changes their own password (self-service, requires current password).
 */
router.post('/change-password', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password saat ini dan password baru wajib diisi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
    }

    const rows = await getSheetsData(`${USERS_SHEET}!A2:I`);
    const rowIndex = rows.findIndex(r => r[0] === req.session.user.id.toString());
    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const storedPassword = rows[rowIndex][7] || '';
    // Same hashed-vs-plaintext check as login, so accounts created before passwords were
    // hashed (or by the admin/import tooling) can still change their password once.
    const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$');
    const isValid = isHashed ? await bcrypt.compare(currentPassword, storedPassword) : currentPassword === storedPassword;
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Password saat ini salah' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateSheetsData(`${USERS_SHEET}!H${rowIndex + 2}`, [[newHash]]);

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah password' });
  }
});

/**
 * GET /api/schedule/custom/all
 * Get ALL custom schedules (admin only)
 */
router.get('/custom/all', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rows = await getSheetsData('CustomSchedules!A2:K');
    const schedules = rows
      .filter(row => row[0] && (row[9] || 'active') !== 'deleted')
      .map(row => ({
        id: row[0],
        date: row[1],
        time: row[2],
        trainer: row[3],
        classType: row[4],
        duration: row[5] || '60',
        capacity: row[6] || '6',
        notes: row[7] || '',
        createdBy: row[8] || '',
        createdAt: row[9] || '',
        status: row[10] || 'active',
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    res.json({ schedules });
  } catch (error) {
    console.error('Error fetching all custom schedules:', error);
    res.status(500).json({ error: 'Failed to fetch custom schedules' });
  }
});

/**
 * GET /api/schedule/custom?date=YYYY-MM-DD
 * Get custom schedules for a specific date (accessible to all logged-in users)
 */
router.get('/custom', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter required' });

    const rows = await getSheetsData('CustomSchedules!A2:J');

    const schedules = rows
      .filter(row => row[1] === date && (row[9] || 'active') === 'active')
      .map(row => ({
        sid: row[0],
        date: row[1],
        time: row[2],
        trainer: row[3],
        classType: row[4],
        duration: row[5] || '60',
        capacity: row[6] || '6',
        notes: row[7] || '',
        stime: `${row[1]} ${row[2]}:00`,
        isCustom: true,
        isLocked: true,
        isBookable: false
      }));

    res.json({ schedules });
  } catch (error) {
    console.error('Error fetching custom schedules:', error);
    res.status(500).json({ error: 'Failed to fetch custom schedules' });
  }
});

/**
 * POST /api/schedule/custom
 * Create a custom schedule (admin only)
 */
router.post('/custom', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { date, time, trainer, classType, duration, capacity, notes } = req.body;
    if (!date || !time || !trainer || !classType) {
      return res.status(400).json({ error: 'date, time, trainer, classType are required' });
    }

    const newId = `CS-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await appendSheetsData('CustomSchedules!A:K', [[
      newId, date, time, trainer, classType,
      duration || '60', capacity || '6', notes || '',
      req.session.user.email, now, 'active'
    ]]);

    res.json({ success: true, message: 'Custom schedule created', id: newId });
  } catch (error) {
    console.error('Error creating custom schedule:', error);
    res.status(500).json({ error: 'Failed to create custom schedule' });
  }
});

/**
 * DELETE /api/schedule/custom/:id
 * Delete a custom schedule (admin only)
 */
router.delete('/custom/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const rows = await getSheetsData('CustomSchedules!A2:K');
    const rowIndex = rows.findIndex(r => r[0] === id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Custom schedule not found' });
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `CustomSchedules!K${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [['deleted']] },
    });

    res.json({ success: true, message: 'Custom schedule deleted' });
  } catch (error) {
    console.error('Error deleting custom schedule:', error);
    res.status(500).json({ error: 'Failed to delete custom schedule' });
  }
});

// Default regular schedule (used as fallback if Google Sheets is empty)
const DEFAULT_REGULAR_SLOTS = [
  { id: 'r1',  day: 1, time: '07:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r2',  day: 1, time: '08:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r3',  day: 1, time: '09:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r4',  day: 1, time: '17:00', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r5',  day: 1, time: '18:15', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r6',  day: 1, time: '19:30', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r7',  day: 2, time: '08:15', trainer: 'Vera',   classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r8',  day: 2, time: '09:30', trainer: 'Vera',   classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r9',  day: 2, time: '17:00', trainer: 'Eko',    classType: 'Tower',    duration: '60', capacity: '6' },
  { id: 'r10', day: 2, time: '18:15', trainer: 'Eko',    classType: 'Tower',    duration: '60', capacity: '6' },
  { id: 'r11', day: 2, time: '19:30', trainer: 'Eko',    classType: 'Tower',    duration: '60', capacity: '6' },
  { id: 'r12', day: 3, time: '07:00', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r13', day: 3, time: '08:15', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r14', day: 3, time: '09:30', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r15', day: 3, time: '17:00', trainer: 'Alma',   classType: 'Tower',    duration: '60', capacity: '6' },
  { id: 'r16', day: 3, time: '18:15', trainer: 'Alma',   classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r17', day: 3, time: '19:30', trainer: 'Alma',   classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r18', day: 4, time: '07:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r19', day: 4, time: '08:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r20', day: 4, time: '09:00', trainer: 'Bunda',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r21', day: 4, time: '17:00', trainer: 'Agung',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r22', day: 4, time: '18:15', trainer: 'Agung',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r23', day: 4, time: '19:30', trainer: 'Agung',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r24', day: 5, time: '07:00', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r25', day: 5, time: '08:15', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r26', day: 5, time: '09:30', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r27', day: 5, time: '17:00', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r28', day: 5, time: '18:15', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r29', day: 5, time: '19:30', trainer: 'Fredy',  classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r30', day: 6, time: '07:00', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r31', day: 6, time: '08:15', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
  { id: 'r32', day: 6, time: '09:30', trainer: 'Martin', classType: 'Reformer', duration: '60', capacity: '6' },
];

/**
 * GET /api/schedule/regular
 * Get regular schedule (all logged-in users)
 */
router.get('/regular', async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    let slots = [];
    try {
      const rows = await getSheetsData('RegularSchedule!A2:I');
      if (rows.length > 0) {
        slots = rows
          .filter(r => r[0] && (r[7] || 'active') !== 'deleted')
          .map(r => ({
            id: r[0],
            day: parseInt(r[1]),
            time: r[2],
            trainer: r[3],
            classType: r[4],
            duration: r[5] || '60',
            capacity: r[6] || '6',
            // Existing slots default to visible so this column's addition never changes what
            // members already see — only newly-added slots are hidden by default.
            visible: (r[8] || 'Yes') !== 'No',
          }));
      }
    } catch (e) { /* sheet not created yet, use defaults */ }

    if (slots.length === 0) slots = DEFAULT_REGULAR_SLOTS.map(s => ({ ...s, visible: true }));

    // Members only ever see slots an admin has marked visible; the admin dashboard's own
    // Regular Schedule table calls this same endpoint but needs every row to manage them,
    // so it opts out of the filter explicitly.
    if (req.session.user.role !== 'admin' || req.query.all !== '1') {
      slots = slots.filter(s => s.visible);
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regular schedule' });
  }
});

/**
 * POST /api/schedule/regular
 * Add a slot to regular schedule (admin only)
 */
router.post('/regular', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { day, time, trainer, classType, duration, capacity, visible } = req.body;
    if (day === undefined || !time || !trainer || !classType) {
      return res.status(400).json({ error: 'day, time, trainer, classType are required' });
    }

    const newId = `RS-${Date.now()}`;
    await appendSheetsData('RegularSchedule!A:I', [[
      newId, day, time, trainer, classType, duration || '60', capacity || '6', 'active', visible === false ? 'No' : 'Yes'
    ]]);

    res.json({ success: true, id: newId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add regular schedule slot' });
  }
});

/**
 * PUT /api/schedule/regular/:id
 * Update a regular schedule slot — used mainly to toggle member visibility without
 * touching the day/time/trainer members already booked against (admin only).
 */
router.put('/regular/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const rows = await getSheetsData('RegularSchedule!A2:I');
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    const existing = rows[rowIndex];
    const { day, time, trainer, classType, duration, capacity, visible } = req.body;
    const updatedRow = [
      id,
      day !== undefined ? day : existing[1],
      time !== undefined ? time : existing[2],
      trainer !== undefined ? trainer : existing[3],
      classType !== undefined ? classType : existing[4],
      duration !== undefined ? duration : existing[5],
      capacity !== undefined ? capacity : existing[6],
      existing[7] || 'active',
      visible !== undefined ? (visible ? 'Yes' : 'No') : (existing[8] || 'Yes'),
    ];

    await updateSheetsData(`RegularSchedule!A${rowIndex + 2}:I${rowIndex + 2}`, [updatedRow]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update regular schedule slot' });
  }
});

/**
 * DELETE /api/schedule/regular/:id
 * Delete a slot from regular schedule (admin only)
 */
router.delete('/regular/:id', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const rows = await getSheetsData('RegularSchedule!A2:H');
    const rowIndex = rows.findIndex(r => r[0] === id);

    if (rowIndex === -1) {
      // Default slot not yet in sheet — write all defaults minus this one
      const remaining = DEFAULT_REGULAR_SLOTS.filter(s => s.id !== id);
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: 'RegularSchedule!A2:H',
      });
      if (remaining.length > 0) {
        await appendSheetsData('RegularSchedule!A:H',
          remaining.map(s => [s.id, s.day, s.time, s.trainer, s.classType, s.duration, s.capacity, 'active'])
        );
      }
      return res.json({ success: true });
    }

    // Soft-delete: update status column (H)
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `RegularSchedule!H${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [['deleted']] },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete regular schedule slot' });
  }
});

module.exports = router;
