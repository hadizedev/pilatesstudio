# Image Naming Convention

## 📋 Overview
Setiap section memiliki pattern penamaan file yang berbeda sesuai dengan karakteristik data:
- **Single entry sections**: Fixed filename (akan di-replace saat upload baru)
- **Multiple entry sections**: Dynamic filename berdasarkan ID

## 🗂️ File Naming Structure

### Banner Section (Single Entry)
```
Format: banner-{field}.{ext}
Contoh: banner-background.jpg
```
- **Section**: `banner`
- **Field**: `background`
- **Result**: `banner-background.jpg`
- Upload baru akan replace file yang sama

### About Section (Single Entry)
```
Format: about-{field}.{ext}
Contoh: about-logo.png
```
- **Section**: `about`
- **Field**: `logo`
- **Result**: `about-logo.png`
- Upload baru akan replace file yang sama

### Teachers Section (Multiple Entries)
```
Format: teacher-{id}.{ext}
Contoh: teacher-1.jpg, teacher-2.jpg, teacher-3.png
```
- **Section**: `teacher`
- **Field**: `{teacher_id}` (1, 2, 3, dst)
- **Result**: `teacher-1.jpg`, `teacher-2.jpg`, etc.
- Setiap teacher punya file sendiri berdasarkan ID
- Upload baru untuk teacher ID yang sama akan replace file lama

### Classes Section (Multiple Entries)
```
Format: class-{id}.{ext}
Contoh: class-1.jpg, class-2.jpg, class-3.png
```
- **Section**: `class`
- **Field**: `{class_id}` (1, 2, 3, dst)
- **Result**: `class-1.jpg`, `class-2.jpg`, etc.
- Setiap class punya file sendiri berdasarkan ID
- Upload baru untuk class ID yang sama akan replace file lama

## 🔄 Auto-Replace Logic

### Storage Configuration (utils/imageUpload.js)
```javascript
filename: function (req, file, cb) {
  const section = req.body.section || 'misc';
  const field = req.body.field || 'image';
  const ext = path.extname(file.originalname);
  
  // Generate filename: section-field.ext
  const filename = `${section}-${field}${ext}`;
  
  // Delete old file with same section-field prefix (any extension)
  const dir = path.join(__dirname, '../public/images');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      if (f.startsWith(`${section}-${field}.`)) {
        fs.unlinkSync(path.join(dir, f));
      }
    });
  }
  
  cb(null, filename);
}
```

## 📍 Implementation Examples

### Banner Background Upload
```javascript
// Client-side
const imageUrl = await uploadImage(imageFile, 'banner', 'background');
// Result: /images/banner-background.jpg
```

### About Logo Upload
```javascript
// Client-side
const imageUrl = await uploadImage(imageFile, 'about', 'logo');
// Result: /images/about-logo.png
```

### Teacher Profile Upload
```javascript
// Client-side (data.id = 3)
const imageUrl = await uploadImage(imageFile, 'teacher', data.id);
// Result: /images/teacher-3.jpg
```

### Class Image Upload
```javascript
// Client-side (data.id = 5)
const imageUrl = await uploadImage(imageFile, 'class', data.id);
// Result: /images/class-5.jpg
```

## 🎯 Benefits

### 1. **Predictable Naming**
- Easy to identify which section an image belongs to
- Consistent pattern across all sections

### 2. **Auto-Replace**
- Old files automatically deleted when uploading new one
- No orphaned files
- Disk space efficient

### 3. **Unique Identifiers**
- Multiple entries (teachers, classes) use ID for uniqueness
- No filename conflicts
- Easy to track which image belongs to which entry

### 4. **Extension Flexibility**
- Supports any image format (jpg, png, gif, webp)
- Extension preserved from original file
- Auto-delete works regardless of extension

## 🗄️ File Storage Location

```
public/
  images/
    banner-background.jpg        # Banner section
    about-logo.png               # About section
    teacher-1.jpg                # Teacher ID 1
    teacher-2.png                # Teacher ID 2
    teacher-3.jpg                # Teacher ID 3
    class-1.jpg                  # Class ID 1
    class-2.png                  # Class ID 2
    class-3.jpg                  # Class ID 3
```

## ⚠️ Important Notes

### ID Management
- **Teachers & Classes**: ID harus konsisten dan unique
- Jangan reuse ID yang sudah dihapus untuk menghindari image confusion
- New entry menggunakan `Math.max(...ids) + 1`

### File Size & Format
- **Max size**: 5MB
- **Allowed formats**: JPEG, JPG, PNG, GIF, WebP
- Filter applied di multer configuration

### Error Handling
- Upload error tidak akan block form submission
- User tetap bisa save data meskipun upload gagal
- Error message ditampilkan via alert
- Console.error untuk debugging

## 🔍 URL Structure

Semua image accessible via browser:
```
http://localhost:3000/images/banner-background.jpg
http://localhost:3000/images/teacher-1.jpg
http://localhost:3000/images/class-5.jpg
```

URL disimpan di Google Sheets dalam format:
```
/images/banner-background.jpg
/images/teacher-1.jpg
/images/class-5.jpg
```

## 📝 Example Scenarios

### Scenario 1: Update Banner Background
1. Current file: `banner-background.jpg`
2. User uploads new image: `my-new-banner.png`
3. System deletes: `banner-background.jpg`
4. System saves: `banner-background.png` (extension from new file)
5. URL updated in Sheets: `/images/banner-background.png`

### Scenario 2: Add New Teacher
1. Current teachers: ID 1, 2, 3
2. New teacher ID: 4
3. User uploads: `profile-photo.jpg`
4. System saves: `teacher-4.jpg`
5. No file deletion (new entry)

### Scenario 3: Update Teacher Profile
1. Current file: `teacher-2.jpg`
2. User uploads new image: `updated-photo.png`
3. System deletes: `teacher-2.jpg`
4. System saves: `teacher-2.png`
5. URL updated in Sheets: `/images/teacher-2.png`

### Scenario 4: Delete Teacher
1. Teacher ID 2 deleted from Google Sheets
2. Image file `teacher-2.jpg` remains in folder
3. **Manual cleanup recommended** for deleted entries
4. Or implement auto-cleanup on delete API

## 🛠️ Future Enhancements

1. **Auto-cleanup on delete**: Remove image file when deleting teacher/class
2. **Image optimization**: Auto-resize/compress images on upload
3. **Thumbnail generation**: Create thumbnails for faster loading
4. **CDN integration**: Upload to cloud storage (S3, Cloudinary)
