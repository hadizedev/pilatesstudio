const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin, checkAuth } = require('../middleware/auth');
const googleSheets = require('../utils/googleSheets');

// Home page
router.get('/', async (req, res) => {
  try {
    // Get all homepage data from Google Sheets
    const homepageData = await googleSheets.getAllHomepageData();
    
    res.render('index', {
      title: 'Home - Pilate Studio',
      ...homepageData
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    // Fallback to default data if Google Sheets fails
    res.render('index', {
      title: 'Home - Pilate Studio',
      banner: null,
      about: null,
      teachers: [],
      testimonials: [],
      classes: [],
      contact: null,
      faq: [],
      colors: {},
      sectionSettings: {}
    });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'Tentang Kami',
    heading: 'Tentang Pilate Studio',
    description: 'Kami adalah studio pilates terpercaya dengan instruktur bersertifikat internasional'
  });
});

// Classes page
router.get('/classes', (req, res) => {
  const classes = [
    {
      name: 'Beginner Pilates',
      description: 'Kelas untuk pemula yang ingin memulai perjalanan pilates',
      duration: '60 menit',
      level: 'Pemula'
    },
    {
      name: 'Intermediate Pilates',
      description: 'Kelas menengah untuk meningkatkan teknik dan kekuatan',
      duration: '75 menit',
      level: 'Menengah'
    },
    {
      name: 'Advanced Pilates',
      description: 'Kelas lanjutan dengan gerakan kompleks dan menantang',
      duration: '90 menit',
      level: 'Lanjutan'
    }
  ];

  res.render('classes', {
    title: 'Kelas',
    heading: 'Kelas Pilates Kami',
    classes: classes
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Kontak',
    heading: 'Hubungi Kami',
    description: 'Kami siap menjawab pertanyaan dan membantu Anda memulai'
  });
});

// Login page
router.get('/login', (req, res) => {
  // Redirect to account if already logged in
  if (req.session && req.session.user) {
    return res.redirect('/account');
  }
  
  res.render('login', {
    title: 'Login',
    heading: 'Login',
    description: 'Sign in to your account'
  });
});

// Account page (Protected)
router.get('/account', requireAuth, (req, res) => {
  res.render('account', {
    title: 'My Account',
    heading: 'My Account',
    user: req.session.user
  });
});

// Admin Dashboard (Protected - Admin Only)
router.get('/admin', requireAdmin, (req, res) => {
  res.render('admin', {
    title: 'Admin Dashboard',
    heading: 'Admin Dashboard',
    user: req.session.user
  });
});

// Homepage Visual Editor (Protected - Admin Only)
router.get('/admin/homepage-editor', requireAdmin, async (req, res) => {
  try {
    const homepageData = await googleSheets.getAllHomepageData();
    res.render('homepage-editor', {
      title: 'Homepage Editor',
      user: req.session.user,
      layout: 'main',
      hideHeaderFooter: true,
      ...homepageData
    });
  } catch (error) {
    console.error('Error loading homepage editor:', error);
    res.render('homepage-editor', {
      title: 'Homepage Editor',
      user: req.session.user,
      layout: 'main',
      hideHeaderFooter: true,
      error: 'Failed to load homepage data'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
