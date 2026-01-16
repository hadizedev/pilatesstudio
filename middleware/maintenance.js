// Maintenance Mode Middleware
// Set MAINTENANCE_MODE to true to enable maintenance mode
// Set MAINTENANCE_MODE to false to disable maintenance mode

const MAINTENANCE_MODE = true; // Change to true to enable maintenance mode

function maintenanceMiddleware(req, res, next) {
  // If maintenance mode is disabled, allow all requests
  if (!MAINTENANCE_MODE) {
    return next();
  }

  // Allow access to maintenance page itself
  if (req.path === '/maintenance') {
    return next();
  }

  // Allow access to static files (CSS, JS, images)
  if (req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/images')) {
    return next();
  }

  // Allow access to login page and login API
  if (req.path === '/login' || req.path === '/api/login') {
    return next();
  }

  // Check if user is logged in (has session)
  if (req.session && req.session.user) {
    // Logged-in users can access the site
    return next();
  }

  // Redirect non-logged-in users to maintenance page
  return res.redirect('/maintenance');
}

module.exports = maintenanceMiddleware;
