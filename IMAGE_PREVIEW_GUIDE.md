# Image Preview Feature Guide

## 📸 Overview
Sistem image preview otomatis menampilkan gambar yang sedang aktif untuk memudahkan admin melihat gambar yang sedang digunakan sebelum melakukan perubahan.

## ✨ Features

### 1. **Preview Existing Images**
- Menampilkan gambar yang tersimpan di Google Sheets
- Label "📸 Current Image:" untuk clarity
- Thumbnail dengan max height 200px
- Object-fit: cover untuk proporsi yang baik

### 2. **Preview on File Selection**
- Preview langsung saat memilih file baru
- Tidak perlu save dulu untuk melihat preview
- FileReader API untuk instant preview

### 3. **Auto Hide/Show**
- Preview muncul otomatis saat ada gambar
- Hidden saat tidak ada gambar
- Reset saat membuka form "Add New"

## 📍 Implemented Locations

### Banner Section
```
Field: Background Image
Preview ID: banner_background_image_preview
Container ID: banner_background_image_preview_container
```

### About Section
```
Field: Logo Image
Preview ID: about_logo_image_preview
Container ID: about_logo_image_preview_container
```

### Teachers Modal
```
Field: Profile Image
Preview ID: teacher_image_url_preview
Container ID: teacher_image_url_preview_container
```

### Classes Modal
```
Field: Class Image
Preview ID: class_image_url_preview
Container ID: class_image_url_preview_container
```

## 🔧 Technical Implementation

### HTML Structure
```html
<div class="mb-3">
  <label for="field_name_file" class="form-label">Image Label</label>
  <input type="file" class="form-control" id="field_name_file" 
         accept="image/*" 
         onchange="handleImagePreview(event, 'field_name_preview')">
  <input type="hidden" id="field_name" name="field_name">
  <small class="form-text text-muted">Max 5MB. Formats: JPEG, PNG, GIF, WebP</small>
  
  <!-- Preview Container -->
  <div class="mt-2" id="field_name_preview_container" style="display: none;">
    <label class="form-label text-muted">
      <small>📸 Current Image:</small>
    </label>
    <div>
      <img id="field_name_preview" class="img-thumbnail" 
           style="max-height: 200px; max-width: 100%; object-fit: cover;">
    </div>
  </div>
</div>
```

### JavaScript Handler

#### 1. Load Existing Image (homepage-editor.js)
```javascript
if (data.section.image_field) {
  const previewImg = document.getElementById('field_name_preview');
  const previewContainer = document.getElementById('field_name_preview_container');
  if (previewImg && previewContainer) {
    previewImg.src = data.section.image_field;
    previewContainer.style.display = 'block';
  }
}
```

#### 2. Show Preview on File Selection (image-upload.js)
```javascript
function handleImagePreview(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);
  
  if (file && preview) {
    const containerId = previewId + '_container';
    const container = document.getElementById(containerId);
    
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      if (container) {
        container.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
}
```

#### 3. Hide Preview for New Entry (homepage-crud.js)
```javascript
// When showing "Add New" form
const previewContainer = document.getElementById('field_name_preview_container');
if (previewContainer) {
  previewContainer.style.display = 'none';
}
```

## 🎨 Styling

### Container
- `display: none` by default
- `display: block` when image exists
- Margin top: 2 (mt-2)

### Label
- Text muted color
- Small font size
- Icon: 📸 for visual recognition

### Image
- Bootstrap class: `img-thumbnail`
- Max height: 200px
- Max width: 100%
- Object-fit: cover (maintains aspect ratio)

## 🔄 User Flow

### Editing Existing Entry
1. User clicks "Edit" button
2. Modal/Form opens with existing data
3. **Image preview automatically shown** with "Current Image" label
4. User can see current image
5. User can select new file → preview updates instantly
6. User saves → new image uploaded and replaces old one

### Adding New Entry
1. User clicks "Add New" button
2. Modal/Form opens empty
3. **Preview hidden** (no current image)
4. User selects file → preview appears
5. User saves → image uploaded

## ✅ Benefits

1. **Visual Confirmation**: Admin can see what image is currently active
2. **Better UX**: No guessing what image is being used
3. **Instant Feedback**: Preview updates immediately on file selection
4. **Professional Look**: Consistent preview styling across all forms
5. **Space Efficient**: Preview only shown when relevant

## 🔍 Testing Checklist

- [ ] Banner background image preview loads correctly
- [ ] About logo image preview loads correctly
- [ ] Teacher profile image preview loads in edit modal
- [ ] Class image preview loads in edit modal
- [ ] Preview appears when selecting new file
- [ ] Preview hidden on "Add New" forms
- [ ] Preview container shows/hides properly
- [ ] Image thumbnail maintains aspect ratio
- [ ] "Current Image" label displays correctly

## 📝 Notes

- Preview uses container approach for better control
- FileReader API for instant preview without server upload
- Consistent naming: `{field}_preview` and `{field}_preview_container`
- Bootstrap img-thumbnail class for consistent styling
- Object-fit: cover prevents distortion
