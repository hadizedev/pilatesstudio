require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const indexRoutes = require('./routes/index');
const loginApiRoutes = require('./routes/api/login');
const scheduleApiRoutes = require('./routes/api/schedule');
const adminApiRoutes = require('./routes/api/admin');
const homepageApiRoutes = require('./routes/api/homepage');
const { checkAuth } = require('./middleware/auth');
const maintenanceMiddleware = require('./middleware/maintenance');

// Handlebars middleware with helpers
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    },
    substring: function(str, start, end) {
      return str ? str.substring(start, end).toUpperCase() : '';
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
  secret: 'pilate-studio-secret-key-2025', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Maintenance mode middleware (must be before other routes)
app.use(maintenanceMiddleware);

// Check auth for all routes (makes user data available in templates)
app.use(checkAuth);

// Routes
app.use('/', indexRoutes);
app.use('/api/login', loginApiRoutes);
app.use('/api/schedule', scheduleApiRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/homepage', homepageApiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
