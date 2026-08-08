const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin, requireTrainer, checkAuth } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    heading: 'Selamat Datang di Pilate Studio',
    description: 'Temukan keseimbangan tubuh dan pikiran Anda dengan kelas pilates profesional kami'
  });
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

// Trainer page
router.get('/trainer', (req, res) => {
  res.render('trainer', {
    title: 'Our Coaches',
    heading: 'Meet Our Coaches'
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
  // Redirect to the right dashboard if already logged in
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    return res.redirect(role === 'admin' ? '/admin' : role === 'trainer' ? '/coach' : '/account');
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

// Coach Dashboard (Protected - Trainer Only)
router.get('/coach', requireTrainer, (req, res) => {
  res.render('coach', {
    title: 'Coach Dashboard',
    heading: 'Jadwal Coach',
    user: req.session.user
  });
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
