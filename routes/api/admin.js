const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
const { requireAdmin } = require('../../middleware/auth');

const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1TQCQYvenGeGQUT7pQe9osdX5dXO00piDMXEV6GzOQ98';

// Setup Google Sheets authentication — credentials.json is gitignored and never committed.
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// RAW (not USER_ENTERED) so Sheets stores schedule_time as the literal "YYYY-MM-DD HH:MM:SS"
// text the app expects — USER_ENTERED auto-detects it as a date/number and corrupts the column.
async function appendRow(range, values) {
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
    });
}

async function updateRange(range, values) {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
    });
}

function normalizeScheduleTime(v) {
    if (!v) return null;
    let s = String(v).replace('T', ' ');
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) s += ':00';
    return s;
}

function membersFromAssignedUsers(assignedUsers) {
    if (assignedUsers === undefined || assignedUsers === null || assignedUsers === '') return '[]';
    return JSON.stringify(String(assignedUsers).split(',').map(v => v.trim()).filter(Boolean));
}

// Get all dashboard data (Admin only)
router.get('/data', requireAdmin, async (req, res) => {
    try {
        // Fetch all data in parallel
        const [usersResponse, bookingsResponse, classesResponse, schedulesResponse, trainersResponse, membershipResponse, subscriptionsResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Users!A:Z'
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
                range: 'Schedules!A:R'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Trainers!A:I'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Membership!A:E'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Subscriptions!A:J'
            })
        ]);

        // Process Users data — looked up by header name (not fixed column position) since
        // the Users sheet's columns have been reordered/extended by hand over time.
        const usersRows = usersResponse.data.values || [];
        const usersHeaders = usersRows[0] || [];
        const uCol = name => usersHeaders.findIndex(h => (h || '').toString().trim().toLowerCase() === name);
        const uIdx = {
            id: uCol('id'), email: uCol('email'), password: uCol('password'),
            name: uCol('name'), phone: uCol('phone'), gender: uCol('gender'),
            address: uCol('address'), instagram: uCol('instagram'),
            role: uCol('role'), membership_type: uCol('membership_type'),
            membership_status: uCol('membership_status'), registered_date: uCol('registered_date'),
            total_credits: uCol('credits')
        };
        const users = usersRows.slice(1).map(row => {
            return {
                id: row[uIdx.id] || '',
                name: row[uIdx.name] || '',
                email: row[uIdx.email] || '',
                phone: row[uIdx.phone] || '',
                password: row[uIdx.password] || '',
                gender: uIdx.gender !== -1 ? (row[uIdx.gender] || '') : '',
                address: uIdx.address !== -1 ? (row[uIdx.address] || '') : '',
                instagram: uIdx.instagram !== -1 ? (row[uIdx.instagram] || '') : '',
                role: uIdx.role !== -1 ? (row[uIdx.role] || 'member') : 'member',
                membership_type: row[uIdx.membership_type] || '',
                membership_status: row[uIdx.membership_status] || '',
                registered_date: row[uIdx.registered_date] || '',
                total_credits: row[uIdx.total_credits] || '0'
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

        // Process Classes data — the real sheet has no price column (id, name, duration,
        // capacity, description, credits_required, status), unlike the aspirational schema doc.
        const classesRows = classesResponse.data.values || [];
        const classes = classesRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                name: row[1] || '',
                duration: row[2] || '',
                capacity: row[3] || '',
                description: row[4] || '',
                credits_required: row[5] || '',
                status: row[6] || ''
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

        // Process Trainers data — real sheet is id, name, email, password, phone,
        // specialization, image, bio, status (9 columns; there is no joined_date column).
        const trainersRows = trainersResponse.data.values || [];
        const trainers = trainersRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                name: row[1] || '',
                email: row[2] || '',
                phone: row[4] || '',
                specialization: row[5] || '',
                image: row[6] || '',
                bio: row[7] || '',
                status: row[8] || ''
            };
        });

        // Process Membership package catalog (packages a member can be registered for)
        const membershipRows = membershipResponse.data.values || [];
        const membershipPackages = membershipRows.slice(1).map(row => {
            return {
                id: row[0] || '',
                name: row[1] || '',
                price: row[2] || '',
                credit: row[3] || '',
                valid_days: row[4] || ''
            };
        });

        // Process Subscriptions (per-member membership registration history — this is what
        // drives each member's booking quota: remaining = total_sessions - used_sessions)
        const today = new Date().toISOString().split('T')[0];
        const subscriptionsRows = subscriptionsResponse.data.values || [];
        const subscriptions = subscriptionsRows.slice(1).filter(row => row[0]).map(row => {
            const totalSessions = parseInt(row[5], 10) || 0;
            const usedSessions = parseInt(row[6], 10) || 0;
            const endDate = row[4] || '';
            return {
                id: row[0] || '',
                member_id: row[1] || '',
                package_name: row[2] || '',
                start_date: row[3] || '',
                end_date: endDate,
                total_sessions: totalSessions,
                used_sessions: usedSessions,
                remaining_sessions: Math.max(0, totalSessions - usedSessions),
                buddy_member_id: row[7] || '',
                buddy_name: row[8] || '',
                payment_name: row[9] || '',
                is_expired: !!endDate && endDate < today
            };
        });

        res.json({
            success: true,
            data: {
                users,
                bookings,
                classes,
                schedules,
                trainers,
                membershipPackages,
                subscriptions,
                stats: {
                    totalUsers: users.length,
                    totalBookings: bookings.length,
                    totalClasses: classes.length,
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

// Create a schedule row (Admin only) — e.g. assigning a member to a Regular/Custom schedule slot
router.post('/schedule', requireAdmin, async (req, res) => {
    try {
        const { schedule_time, trainer_id, class_id, assigned_users, gender_restriction, status, notes } = req.body;
        if (!schedule_time || !trainer_id || !class_id) {
            return res.status(400).json({ success: false, message: 'schedule_time, trainer_id, dan class_id wajib diisi' });
        }

        const id = `SCH-${Date.now()}`;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await appendRow('Schedules!A:Q', [[
            id,
            normalizeScheduleTime(schedule_time),
            trainer_id,
            class_id,
            membersFromAssignedUsers(assigned_users),
            gender_restriction || '',
            '0',
            notes || '',
            '',
            '0',
            req.session.user.email,
            '',
            now,
            req.session.user.email,
            '',
            now,
            status || 'Active'
        ]]);

        res.json({ success: true, id });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat schedule' });
    }
});

// Update a schedule row (Admin only)
router.put('/schedule/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule_time, trainer_id, class_id, assigned_users, gender_restriction, status, notes } = req.body;

        const rowsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Schedules!A2:Q' });
        const rows = rowsResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Schedule tidak ditemukan' });
        }

        const existing = rows[rowIndex];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const updatedRow = [
            id,
            schedule_time ? normalizeScheduleTime(schedule_time) : (existing[1] || ''),
            trainer_id || existing[2] || '',
            class_id || existing[3] || '',
            assigned_users !== undefined ? membersFromAssignedUsers(assigned_users) : (existing[4] || '[]'),
            gender_restriction !== undefined ? gender_restriction : (existing[5] || ''),
            existing[6] || '0',
            notes !== undefined ? notes : (existing[7] || ''),
            existing[8] || '',
            existing[9] || '0',
            existing[10] || '',
            existing[11] || '',
            existing[12] || '',
            req.session.user.email,
            '',
            now,
            status || existing[16] || 'Active'
        ];

        await updateRange(`Schedules!A${rowIndex + 2}:Q${rowIndex + 2}`, [updatedRow]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: 'Gagal mengupdate schedule' });
    }
});

// Cancel a schedule row (Admin only) — soft delete via status column
router.delete('/schedule/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rowsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Schedules!A2:Q' });
        const rows = rowsResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Schedule tidak ditemukan' });
        }

        await updateRange(`Schedules!Q${rowIndex + 2}`, [['Cancelled']]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus schedule' });
    }
});

// Register a membership package for a member (Admin only) — creates a Subscriptions row, which
// is what grants the member a booking quota (total_sessions - used_sessions on the account page).
// Looks up a Membership catalog row by id. Returns null if not found.
async function resolvePackage(packageId) {
    const packagesResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Membership!A2:E' });
    const pkgRow = (packagesResp.data.values || []).find(r => r[0] === packageId.toString());
    if (!pkgRow) return null;
    const [, name, price, credit, validDays] = pkgRow;
    return { name, price, credit, validDays, isTrial: (name || '').trim().toLowerCase() === 'trial' };
}

// Resolves a buddy member's display name for the Subscriptions row. Throws if the id doesn't
// match a real user, so callers can turn that into a 400 response.
async function resolveBuddyName(buddyMemberId) {
    if (!buddyMemberId) return '';
    const usersResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A:Z' });
    const usersRows = usersResp.data.values || [];
    const uHeaders = usersRows[0] || [];
    const uCol = name => uHeaders.findIndex(h => (h || '').toString().trim().toLowerCase() === name);
    const idIdx = uCol('id'), nameIdx = uCol('name');
    const buddyRow = usersRows.slice(1).find(r => r[idIdx] === buddyMemberId.toString());
    if (!buddyRow) throw new Error('BUDDY_NOT_FOUND');
    return buddyRow[nameIdx] || '';
}

// A member can only ever be registered for Trial once — Drop In (or any other package) covers
// them after that. excludeSubId lets an edit ignore the row being edited when checking itself.
async function hasExistingTrial(memberId, excludeSubId) {
    const subsCheckResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Subscriptions!A2:C' });
    return (subsCheckResp.data.values || []).some(r =>
        (!excludeSubId || r[0] !== excludeSubId.toString()) &&
        r[1] === memberId.toString() && (r[2] || '').trim().toLowerCase() === 'trial'
    );
}

function todayLocalStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayLocalStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// A member may only have one real (non-Trial) active membership at a time — no stacking. An
// active Trial is the one exception: registering a real package while a Trial is still active is
// allowed, but forfeits (expires) that Trial immediately, since it exists only to lead into a
// real package, not to run alongside one. excludeSubId lets an edit ignore the row being edited.
// Returns an error message string if the new registration should be blocked, otherwise null.
async function checkActiveMembershipAndForfeitTrial(memberId, newPackageIsTrial, excludeSubId) {
    const subsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Subscriptions!A2:J' });
    const rows = subsResp.data.values || [];
    const today = todayLocalStr();

    // A buddy on someone else's active Couple package already has membership access through it
    // (same shared quota pool — see getUserSubscriptions in schedule.js), so they count as
    // "having an active membership" too, not just the primary member_id.
    const activeForMember = rows
        .map((row, idx) => ({ row, sheetRowIndex: idx }))
        .filter(({ row }) => row[0] && (row[1] === memberId.toString() || row[7] === memberId.toString()))
        .filter(({ row }) => !excludeSubId || row[0] !== excludeSubId.toString())
        .filter(({ row }) => {
            const endDate = row[4] || '';
            const notExpired = !endDate || endDate >= today;
            const remaining = (parseInt(row[5], 10) || 0) - (parseInt(row[6], 10) || 0);
            return notExpired && remaining > 0;
        });

    const activeNonTrial = activeForMember.filter(({ row }) => (row[2] || '').trim().toLowerCase() !== 'trial');
    if (activeNonTrial.length > 0) {
        return 'Member ini masih memiliki membership aktif. Tidak bisa mendaftarkan paket baru sampai membership yang sekarang habis atau expired.';
    }

    if (newPackageIsTrial) return null; // registering Trial itself — hasExistingTrial covers that separately

    const activeTrials = activeForMember.filter(({ row }) => (row[2] || '').trim().toLowerCase() === 'trial');
    for (const { sheetRowIndex } of activeTrials) {
        await updateRange(`Subscriptions!E${sheetRowIndex + 2}`, [[yesterdayLocalStr()]]);
    }
    return null;
}

// A blank Valid-days column means the package never expires (Trial, Drop In, etc.).
function computeEndDate(startDateStr, validDays) {
    const days = parseInt(validDays, 10);
    if (isNaN(days) || days <= 0) return '';

    // Pure local-calendar arithmetic (year/month/day components + setDate overflow), not
    // millisecond math through toISOString() — that path silently drops a day whenever the
    // server's local timezone is ahead of UTC.
    const [y, m, d] = startDateStr.split('-').map(Number);
    const end = new Date(y, m - 1, d + days);
    const yyyy = end.getFullYear();
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    const dd = String(end.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

router.post('/membership', requireAdmin, async (req, res) => {
    try {
        const { member_id, package_id, start_date, payment_name, buddy_member_id } = req.body;
        if (!member_id || !package_id || !start_date) {
            return res.status(400).json({ success: false, message: 'member_id, package_id, dan start_date wajib diisi' });
        }
        if (buddy_member_id && buddy_member_id.toString() === member_id.toString()) {
            return res.status(400).json({ success: false, message: 'Buddy harus member yang berbeda' });
        }

        const pkg = await resolvePackage(package_id);
        if (!pkg) {
            return res.status(400).json({ success: false, message: 'Paket membership tidak ditemukan' });
        }

        if (pkg.isTrial && await hasExistingTrial(member_id)) {
            return res.status(400).json({ success: false, message: 'Member ini sudah pernah menggunakan Trial sebelumnya dan tidak bisa mendaftar Trial lagi. Gunakan paket Drop In atau lainnya.' });
        }

        const activeMembershipError = await checkActiveMembershipAndForfeitTrial(member_id, pkg.isTrial);
        if (activeMembershipError) {
            return res.status(400).json({ success: false, message: activeMembershipError });
        }

        let buddyName;
        try {
            buddyName = await resolveBuddyName(buddy_member_id);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Buddy member tidak ditemukan' });
        }

        const endDateStr = computeEndDate(start_date, pkg.validDays);

        const subsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Subscriptions!A2:A' });
        const existingIds = (subsResp.data.values || []).map(r => parseInt(r[0], 10)).filter(n => !isNaN(n));
        const newId = (existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1).toString();

        await appendRow('Subscriptions!A:J', [[
            newId, member_id, pkg.name, start_date, endDateStr,
            pkg.credit || '0', '0', buddy_member_id || '', buddyName, payment_name || ''
        ]]);

        res.json({ success: true, id: newId });
    } catch (error) {
        console.error('Error registering membership:', error);
        res.status(500).json({ success: false, message: 'Gagal mendaftarkan membership' });
    }
});

// Update an existing membership registration (Admin only). Changing the start date, or the
// package itself, recomputes the end date from the (possibly new) package's validity days —
// used_sessions is left untouched so editing never resets a member's usage history.
router.put('/membership/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { member_id, package_id, start_date, payment_name, buddy_member_id } = req.body;

        const subsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Subscriptions!A2:J' });
        const rows = subsResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id.toString());
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Membership tidak ditemukan' });
        }
        const existing = rows[rowIndex];

        const finalMemberId = member_id || existing[1];
        if (buddy_member_id && buddy_member_id.toString() === finalMemberId.toString()) {
            return res.status(400).json({ success: false, message: 'Buddy harus member yang berbeda' });
        }

        let packageName = existing[2];
        let credit = existing[5];
        let validDays = null;

        if (package_id) {
            const pkg = await resolvePackage(package_id);
            if (!pkg) {
                return res.status(400).json({ success: false, message: 'Paket membership tidak ditemukan' });
            }
            if (pkg.isTrial && await hasExistingTrial(finalMemberId, id)) {
                return res.status(400).json({ success: false, message: 'Member ini sudah pernah menggunakan Trial sebelumnya dan tidak bisa mendaftar Trial lagi.' });
            }
            const activeMembershipError = await checkActiveMembershipAndForfeitTrial(finalMemberId, pkg.isTrial, id);
            if (activeMembershipError) {
                return res.status(400).json({ success: false, message: activeMembershipError });
            }
            packageName = pkg.name;
            credit = pkg.credit;
            validDays = pkg.validDays;
        } else {
            // Package unchanged — still need its Valid-days to recompute end_date if the start
            // date moved. The row only stores the package's name, so match it back to the catalog.
            const packagesResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Membership!A2:E' });
            const pkgRow = (packagesResp.data.values || []).find(r => (r[1] || '').trim().toLowerCase() === (packageName || '').trim().toLowerCase());
            validDays = pkgRow ? pkgRow[4] : null;
        }

        const finalStartDate = start_date || existing[3];
        const endDateStr = (start_date || package_id) ? computeEndDate(finalStartDate, validDays) : existing[4];

        let buddyId = buddy_member_id !== undefined ? buddy_member_id : existing[7];
        let buddyName = existing[8];
        if (buddy_member_id !== undefined) {
            try {
                buddyName = await resolveBuddyName(buddy_member_id);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Buddy member tidak ditemukan' });
            }
        }

        const updatedRow = [
            id, finalMemberId, packageName, finalStartDate, endDateStr,
            credit || '0', existing[6], buddyId || '', buddyName,
            payment_name !== undefined ? payment_name : existing[9]
        ];

        await updateRange(`Subscriptions!A${rowIndex + 2}:J${rowIndex + 2}`, [updatedRow]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating membership:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui membership' });
    }
});

// Delete a membership registration (Admin only). Removes the row outright — this only ever
// deletes the registration record itself; it doesn't touch bookings already charged against it
// (their sub:<id> tag just stops resolving to anything, same as any other removed subscription).
router.delete('/membership/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const subsResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Subscriptions!A2:J' });
        const rows = subsResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id.toString());
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Membership tidak ditemukan' });
        }

        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `Subscriptions!A${rowIndex + 2}:J${rowIndex + 2}`,
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting membership:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus membership' });
    }
});

// Users sheet ID format is "RES" + 6-digit sequential (e.g. RES000308). New IDs are generated
// by reading the highest existing numeric suffix and adding 1 — not a stored counter — so it
// self-heals if rows are ever deleted or re-ordered.
async function getNextUserId() {
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:A' });
    const rows = resp.data.values || [];
    let max = 0;
    for (const [id] of rows) {
        const m = /^RES(\d{6})$/.exec((id || '').trim());
        if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return 'RES' + String(max + 1).padStart(6, '0');
}

// Create a new member/admin account (Admin only).
router.post('/user', requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, address, instagram, password, gender, role } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi' });
        }

        const usersResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:I' });
        const rows = usersResp.data.values || [];
        if (rows.some(r => (r[3] || '').trim().toLowerCase() === email.trim().toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const newId = await getNextUserId();
        await appendRow('Users!A:I', [[
            newId, name, gender || '', email, phone || '', address || '', instagram || '', password || '', role || 'member'
        ]]);
        res.json({ success: true, id: newId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat user' });
    }
});

// Update an existing account (Admin only).
router.put('/user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, instagram, password, gender, role } = req.body;

        const usersResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:I' });
        const rows = usersResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const existing = rows[rowIndex];
        if (email && email.trim().toLowerCase() !== (existing[3] || '').trim().toLowerCase() &&
            rows.some((r, i) => i !== rowIndex && (r[3] || '').trim().toLowerCase() === email.trim().toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const updatedRow = [
            id,
            name !== undefined && name !== '' ? name : existing[1],
            gender !== undefined ? gender : existing[2],
            email !== undefined && email !== '' ? email : existing[3],
            phone !== undefined ? phone : existing[4],
            address !== undefined ? address : existing[5],
            instagram !== undefined ? instagram : existing[6],
            password !== undefined && password !== '' ? password : existing[7],
            role !== undefined && role !== '' ? role : existing[8],
        ];
        await updateRange(`Users!A${rowIndex + 2}:I${rowIndex + 2}`, [updatedRow]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui user' });
    }
});

// Delete an account (Admin only).
router.delete('/user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usersResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:A' });
        const rows = usersResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const meta = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetId = meta.data.sheets.find(s => s.properties.title === 'Users').properties.sheetId;
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } }
                }]
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus user' });
    }
});

// Soft-delete a class (Admin only) — marks it Inactive rather than removing the row, since
// Schedules/RegularSchedule/CustomSchedules reference classes by id and losing the row entirely
// would break their capacity lookups.
router.delete('/class/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const classesResp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Classes!A2:G' });
        const rows = classesResp.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id.toString());
        if (rowIndex === -1) {
            return res.status(404).json({ success: false, message: 'Class tidak ditemukan' });
        }

        await updateRange(`Classes!G${rowIndex + 2}`, [['Inactive']]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus class' });
    }
});

module.exports = router;
