# 📋 Homepage Management System - Complete Documentation Index

## 🎯 Quick Links

### For Administrators
- **[Homepage Editor Guide](HOMEPAGE_EDITOR_GUIDE.md)** - How to use visual editor
- **[Quick Start Guide](HOMEPAGE_QUICK_START.md)** - Fast setup instructions

### For Developers
- **[Database Structure](HOMEPAGE_SHEETS_SETUP.md)** - Complete Google Sheets schema
- **[Integration Guide](HOMEPAGE_INTEGRATION.md)** - Technical implementation details

## 📚 Documentation Overview

### 1. Homepage Editor Guide
**File**: [HOMEPAGE_EDITOR_GUIDE.md](HOMEPAGE_EDITOR_GUIDE.md)  
**For**: Admin users  
**Contains**:
- How to access the visual editor
- Step-by-step editing instructions
- Tips & tricks
- Troubleshooting guide

### 2. Homepage Quick Start
**File**: [HOMEPAGE_QUICK_START.md](HOMEPAGE_QUICK_START.md)  
**For**: Setup & configuration  
**Contains**:
- Initial Google Sheets setup
- Sample data for copy-paste
- Testing instructions
- Setup checklist

### 3. Homepage Sheets Setup
**File**: [HOMEPAGE_SHEETS_SETUP.md](HOMEPAGE_SHEETS_SETUP.md)  
**For**: Developers & technical users  
**Contains**:
- Complete database structure
- All 9 sheets detailed specifications
- Column definitions and types
- API testing endpoints

### 4. Homepage Integration Guide
**File**: [HOMEPAGE_INTEGRATION.md](HOMEPAGE_INTEGRATION.md)  
**For**: Developers  
**Contains**:
- Architecture overview
- API documentation
- Code examples
- Customization guide

## 🚀 Getting Started

### First Time Setup (Admins)
1. Read: [Quick Start Guide](HOMEPAGE_QUICK_START.md)
2. Create Google Spreadsheet
3. Setup sheets with sample data
4. Update Spreadsheet ID
5. Test the system

### Using the Editor (Daily Use)
1. Read: [Editor Guide](HOMEPAGE_EDITOR_GUIDE.md)
2. Login as admin
3. Navigate to `/admin/homepage-editor`
4. Edit content
5. Save and preview

### Development (Developers)
1. Read: [Integration Guide](HOMEPAGE_INTEGRATION.md)
2. Read: [Database Structure](HOMEPAGE_SHEETS_SETUP.md)
3. Review API endpoints
4. Customize as needed

## 🎨 Features

### Visual Editor
- ✅ Web-based interface
- ✅ Real-time form validation
- ✅ Direct Google Sheets integration
- ✅ Admin-only access
- ✅ Unsaved changes warning
- ✅ Keyboard shortcuts (Ctrl+S)

### Content Management
- ✅ Banner section (text, images, links)
- ✅ About section (title, colors, bullet points)
- ✅ Contact info (address, hours, maps)
- ✅ Fallback values for safety
- ✅ Preview before publish

### Database (Google Sheets)
- ✅ 9 structured sheets
- ✅ Easy to edit directly
- ✅ No code changes needed
- ✅ Version history via Google
- ✅ Collaborative editing

## 📁 File Structure

```
PilateStudio/
├── views/
│   ├── homepage-editor.hbs       # Visual editor interface
│   └── index.hbs                 # Homepage template
├── routes/
│   ├── index.js                  # Main routes (includes editor route)
│   └── api/
│       └── homepage.js           # API endpoints for CRUD
├── utils/
│   └── googleSheets.js           # Google Sheets integration
├── public/
│   └── js/
│       └── homepage-editor.js    # Client-side editor logic
├── credentials.json              # Google service account
├── .env.example                  # Environment variables template
└── Documentation:
    ├── HOMEPAGE_EDITOR_GUIDE.md      # User guide for editor
    ├── HOMEPAGE_QUICK_START.md       # Quick setup guide
    ├── HOMEPAGE_SHEETS_SETUP.md      # Database schema
    ├── HOMEPAGE_INTEGRATION.md       # Technical guide
    └── HOMEPAGE_DOCS_INDEX.md        # This file
```

## 🔑 Access Control

### Public Access
- Homepage: `http://localhost:3001/`
- API Read: `GET /api/homepage/*`

### Admin Only
- Visual Editor: `http://localhost:3001/admin/homepage-editor`
- API Write: `PUT /api/homepage/*`
- Admin Dashboard: `http://localhost:3001/admin`

### Authentication
- Login required: Yes (for editor)
- Role required: Admin
- Session timeout: 24 hours

## 🛠️ System Requirements

### Server
- Node.js 14+
- Express.js
- Google Sheets API access

### Client (Browser)
- Modern browser (Chrome, Firefox, Edge)
- JavaScript enabled
- Bootstrap 5 support

### External Services
- Google Sheets (database)
- Google Service Account (authentication)

## 📊 Data Flow

```
┌─────────────┐
│   Admin     │
│  (Editor)   │
└──────┬──────┘
       │ Edit Form
       ▼
┌─────────────┐
│  API Route  │  PUT /api/homepage/{section}
└──────┬──────┘
       │ Update Request
       ▼
┌─────────────┐
│   Google    │
│   Sheets    │
│  (Database) │
└──────┬──────┘
       │ Read Data
       ▼
┌─────────────┐
│  Homepage   │
│   (Public)  │
└─────────────┘
```

## 🔧 Troubleshooting

### Common Issues

#### Editor not loading
1. Check if logged in as admin
2. Verify session is active
3. Check server logs

#### Save fails
1. Verify Google Sheets permissions
2. Check Spreadsheet ID
3. Ensure sheets exist
4. Review API logs

#### Changes not showing
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check if save was successful
4. Verify data in Google Sheets

### Debug Mode
Check browser console (F12) for:
- API response errors
- Network issues
- JavaScript errors

Check server console for:
- Google Sheets API errors
- Authentication issues
- Database connection problems

## 📞 Support Resources

### Documentation
- All guides in project root
- Inline code comments
- API documentation in code

### Testing Tools
- `test-sheets.js` - Test Google Sheets connection
- Browser DevTools - Debug frontend
- Postman/curl - Test API endpoints

### Logs
- Server console - Backend errors
- Browser console - Frontend errors
- Google Sheets - Data changes history

## 🔄 Update History

### Version 1.0 (January 2026)
- ✅ Initial release
- ✅ Visual editor for Banner, About, Contact
- ✅ Google Sheets integration
- ✅ API endpoints (GET, PUT)
- ✅ Complete documentation

### Planned Features (Future)
- [ ] Teachers management in editor
- [ ] Testimonials management
- [ ] Classes management
- [ ] FAQ management
- [ ] Image upload functionality
- [ ] Live preview panel
- [ ] Version history viewer
- [ ] Bulk operations
- [ ] Media library

## 🎓 Learning Path

### For New Admins
1. Start with [Quick Start Guide](HOMEPAGE_QUICK_START.md)
2. Read [Editor Guide](HOMEPAGE_EDITOR_GUIDE.md)
3. Practice with test data
4. Edit real content

### For Developers
1. Review [Integration Guide](HOMEPAGE_INTEGRATION.md)
2. Study [Database Structure](HOMEPAGE_SHEETS_SETUP.md)
3. Examine code files
4. Customize & extend

## 📝 Notes

### Important
- Always backup before major changes
- Test in development first
- Preview before publishing
- Keep documentation updated

### Best Practices
- Use descriptive content
- Optimize images
- Test on multiple devices
- Keep data consistent

### Security
- Admin credentials secure
- Service account protected
- API endpoints validated
- Session management proper

---

**Project**: Pilate Studio Homepage Management  
**Version**: 1.0  
**Last Updated**: January 2026  
**Maintained by**: Development Team

For questions or issues, check the relevant guide or contact the development team.
