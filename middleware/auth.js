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
        // Debug logging
        console.log('=== ADMIN CHECK ===');
        console.log('User email:', req.session.user.email);
        console.log('User role:', req.session.user.role);
        console.log('Role type:', typeof req.session.user.role);
        console.log('Is admin?:', req.session.user.role === 'admin');
        console.log('==================');
        
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
                user: req.session.user
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

// Check if user is logged in (for conditional rendering)
const checkAuth = (req, res, next) => {
    res.locals.isAuthenticated = !!(req.session && req.session.user);
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    res.locals.isAdmin = req.session && req.session.user && req.session.user.role === 'admin';
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    checkAuth
};
