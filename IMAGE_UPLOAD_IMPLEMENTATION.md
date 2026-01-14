# Image Upload Implementation

## Overview
Sistem upload file image telah diimplementasikan untuk semua section di Homepage Editor. File akan disimpan di folder `public/images` dengan penamaan yang konsisten berdasarkan section, dan file lama akan otomatis di-replace saat upload file baru.

## File Naming Convention

### Single Entry Sections (Fixed Names)
- **Banner Background**: `banner-background.{ext}`
- **About Logo**: `about-logo.{ext}`

Upload baru akan replace file dengan nama yang sama (extension bisa berbeda)

### Multiple Entry Sections (ID-Based)
- **Teacher Profile**: `teacher-{id}.{ext}` (e.g., teacher-1.jpg, teacher-2.png)
- **Class Image**: `class-{id}.{ext}` (e.g., class-1.jpg, class-2.png)

Setiap entry punya file sendiri berdasarkan ID unik. Upload baru untuk ID yang sama akan replace file lama.

**Contoh:**
```
public/images/
  ├── banner-background.jpg     # Banner section
  ├── about-logo.png            # About section  
  ├── teacher-1.jpg             # Teacher ID 1
  ├── teacher-2.png             # Teacher ID 2
  ├── class-1.jpg               # Class ID 1
  └── class-2.png               # Class ID 2
```

Detail lengkap: [IMAGE_NAMING_CONVENTION.md](IMAGE_NAMING_CONVENTION.md)

## Features

### 1. Auto-Replace Mechanism
- Saat upload file baru untuk section yang sama, file lama otomatis terhapus
- Naming convention: `{section}-{field}.{ext}` (contoh: `banner-background.jpg`, `teacher-1.png`)
- Mendukung format: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 5MB

### 2. Image Preview
- Preview otomatis muncul saat memilih file
- Existing image juga ditampilkan saat edit
- Preview berbentuk thumbnail dengan max-width 200px

### 3. Upload Endpoints

**POST /api/homepage/upload-image**
- Upload single image file
- Request: `multipart/form-data` dengan field `image`
- Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "/images/banner-background.jpg",
  "filename": "banner-background.jpg"
}
```

## File Structure

### Backend Files

#### 1. utils/imageUpload.js
Konfigurasi Multer untuk handle upload:
```javascript
const storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => {
    // Delete old files with same section-field prefix
    // Save with naming: {section}-{field}.{ext}
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});
```

#### 2. routes/api/homepage.js
Endpoint untuk upload:
```javascript
router.post('/upload-image', 
  upload.single('image'),
  async (req, res) => {
    // Return image URL
  }
);
```

### Frontend Files

#### 1. public/js/image-upload.js
Helper functions untuk upload:
```javascript
// Upload image and return URL
async function uploadImage(file, section, field)

// Show preview when file selected
function handleImagePreview(event, previewId)
```

#### 2. public/js/homepage-editor.js
Form submission dengan upload integration:
- Banner form: Upload `background_image` jika file dipilih
- About form: Upload `logo_image` jika file dipilih

#### 3. public/js/homepage-crud.js
CRUD operations dengan upload integration:
- Teacher form: Upload `image_url` jika file dipilih
- Class form: Upload `image_url` jika file dipilih

## Implementation Details

### Converted Fields

#### Banner Section
- **Field**: `background_image`
- **Input ID**: `banner_background_image_file`
- **Preview ID**: `banner_background_image_preview`
- **File naming**: `banner-background.{ext}`

#### About Section
- **Field**: `logo_image`
- **Input ID**: `about_logo_image_file`
- **Preview ID**: `about_logo_image_preview`
- **File naming**: `about-logo.{ext}`

#### Teachers Section
- **Field**: `image_url`
- **Input ID**: `teacher_image_url_file`
- **Preview ID**: `teacher_image_url_preview`
- **File naming**: `teacher-{id}.{ext}` (contoh: `teacher-1.jpg`, `teacher-2.png`)

#### Classes Section
- **Field**: `image_url`
- **Input ID**: `class_image_url_file`
- **Preview ID**: `class_image_url_preview`
- **File naming**: `class-{id}.{ext}` (contoh: `class-1.jpg`, `class-2.png`)

## Usage Flow

### 1. Upload New Image
```javascript
// User selects file
<input type="file" id="banner_background_image_file" 
       onchange="handleImagePreview(event, 'banner_background_image_preview')">

// Preview shows immediately
<img id="banner_background_image_preview" style="display:none">

// On form submit
const imageFile = document.getElementById('banner_background_image_file').files[0];
if (imageFile) {
  const imageUrl = await uploadImage(imageFile, 'banner', 'background');
  data.background_image = imageUrl; // Update data dengan URL baru
}
```

### 2. Edit Existing Image
```javascript
// Load existing image into preview
if (data.banner.background_image) {
  const previewImg = document.getElementById('banner_background_image_preview');
  previewImg.src = data.banner.background_image;
  previewImg.style.display = 'block';
}

// User can choose to keep existing or upload new
// If no new file selected, old URL remains unchanged
```

## File Management

### Storage Location
```
public/
  images/
    banner-background.jpg
    about-logo.png
    teacher-1.jpg
    teacher-2.jpg
    teacher-3.png
    class-1.jpg
    class-2.png
    ...
```

### Auto-Replace Logic
```javascript
// Check for existing files with same prefix
const existingFiles = fs.readdirSync('public/images')
  .filter(f => f.startsWith(`${section}-${field}.`));

// Delete all matching files
existingFiles.forEach(f => {
  fs.unlinkSync(path.join('public/images', f));
});
```

## Benefits

1. **Better UX**: User tidak perlu manual upload ke hosting dan copy URL
2. **Consistency**: Semua file tersimpan di satu lokasi dengan naming yang konsisten
3. **Auto-cleanup**: File lama otomatis terhapus saat upload baru
4. **Preview**: User dapat melihat preview sebelum save
5. **Fallback**: URL input masih ada (hidden) untuk advanced users yang ingin custom URL

## Testing Checklist

- [x] Upload image untuk Banner background
- [x] Upload image untuk About logo
- [x] Upload image untuk Teacher profile
- [x] Upload image untuk Class image
- [x] Preview muncul saat select file
- [x] Existing image muncul saat edit
- [x] File lama terhapus saat upload baru
- [x] URL tersimpan ke Google Sheets
- [x] Image muncul di homepage setelah save

## Security Notes

- File size limited to 5MB
- Only image formats allowed (JPEG, PNG, GIF, WebP)
- Files stored in public directory (accessible via URL)
- No authentication required for viewing images
- Consider adding image optimization/compression in production

## Future Enhancements

1. Image optimization (resize, compress)
2. Multiple image upload
3. Image gallery/library
4. Crop/edit functionality
5. CDN integration
6. Drag & drop upload
