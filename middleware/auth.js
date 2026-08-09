// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated, redirect to login
        res.redirect('/login');
    }
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.user) {
        // Check if user is admin
        if (req.session.user.role === 'admin') {
            next();
        } else {
            // User is not admin
            // Check if this is an API request (JSON response expected)
            if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.'
                });
            }
            // Regular page request, render error page
            res.status(403).render('error', {
                title: 'Akses Ditolak',
                heading: '403 - Akses Ditolak',
                message: 'Anda tidak memiliki akses ke halaman ini. Hanya admin yang dapat mengakses dashboard admin.',
                user: req.session.user,
                layout: false // error.hbs is a full standalone document (own <html>/header/footer)
            });
        }
    } else {
        // User is not authenticated
        // Check if this is an API request
        if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login first.'
            });
        }
        // Regular page request, redirect to login
        res.redirect('/login');
    }
};

// Trainer authentication middleware
const requireTrainer = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'trainer') {
        next();
    } else if (req.session && req.session.user) {
        res.status(403).render('error', {
            title: 'Akses Ditolak',
            heading: '403 - Akses Ditolak',
            message: 'Halaman ini hanya untuk akun coach.',
            user: req.session.user,
            layout: false // error.hbs is a full standalone document (own <html>/header/footer)
        });
    } else {
        res.redirect('/login');
    }
};

// Partners-portal trainer auth — the Partners feature (routes/api/partners.js) keeps its own
// session namespace (req.session.trainer) separate from the Coach dashboard's req.session.user,
// so it needs its own guard rather than reusing requireTrainer above.
const requirePartnerTrainer = (req, res, next) => {
    if (req.session && req.session.trainer) {
        next();
    } else {
        if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login as trainer first.'
            });
        }
        res.redirect('/partners/login');
    }
};

// Check if user is logged in (for conditional rendering)
const checkAuth = (req, res, next) => {
    res.locals.isAuthenticated = !!(req.session && req.session.user);
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    res.locals.isAdmin = req.session && req.session.user && req.session.user.role === 'admin';
    res.locals.isTrainer = req.session && req.session.user && req.session.user.role === 'trainer';
    res.locals.isPartnerTrainer = !!(req.session && req.session.trainer);
    res.locals.partnerTrainer = req.session && req.session.trainer ? req.session.trainer : null;
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireTrainer,
    requirePartnerTrainer,
    checkAuth
};
