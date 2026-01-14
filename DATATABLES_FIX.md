<!-- Troubleshooting Guide for DataTables Error -->

# DataTables Error Fix

## Error: "DataTable is not a function"

### Quick Fix:

1. **Clear Browser Cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Firefox: Ctrl+Shift+Delete → Clear cache
   - Or use Incognito/Private mode

2. **Hard Refresh:**
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Check Console for CDN Errors:**
   - Press F12 → Console tab
   - Look for red errors about loading scripts

### Already Fixed in Code:

✅ Added error checking before initializing DataTables
✅ Added try-catch blocks
✅ Proper script loading order
✅ Better error messages

### If Still Not Working:

**Option 1: Use Alternative CDN**
Replace DataTables CDN links in admin.hbs with:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.7/css/dataTables.bootstrap5.min.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/datatables.net@1.13.7/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/datatables.net-bs5@1.13.7/js/dataTables.bootstrap5.min.js"></script>
```

**Option 2: Download Libraries Locally**
1. Download jQuery, DataTables, and Bootstrap
2. Place in `/public/js/` folder
3. Update script src paths in admin.hbs

**Option 3: Check Network Connection**
- Ensure stable internet connection
- Check if CDN is accessible (try opening CDN URL directly)
- Check firewall/proxy settings

### Test DataTables Loading:

Open browser console and run:
```javascript
console.log('jQuery:', typeof jQuery);
console.log('DataTable:', typeof $.fn.DataTable);
```

Should show:
```
jQuery: function
DataTable: function
```

### Current Script Order (Correct):
1. jQuery (3.7.1)
2. Bootstrap (5.3.0)
3. DataTables Core (1.13.7)
4. DataTables Bootstrap 5 integration (1.13.7)

This order is CORRECT and should work.
