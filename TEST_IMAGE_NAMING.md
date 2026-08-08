# Test Image Naming Convention

## 🧪 Testing Plan

### Expected Behavior
Setiap Teacher/Class harus memiliki nama file yang unik berdasarkan ID:

**Teachers:**
- Teacher ID 1 → `teacher-1.jpg` (atau .png, .gif, dll)
- Teacher ID 2 → `teacher-2.jpg`
- Teacher ID 3 → `teacher-3.jpg`
- dst...

**Classes:**
- Class ID 1 → `class-1.jpg`
- Class ID 2 → `class-2.jpg`
- Class ID 3 → `class-3.jpg`
- dst...

### Test Steps

#### 1. Restart Server
```bash
npm start
# atau
nodemon app.js
```

#### 2. Test Upload Teacher Image

**Test Case 1: Upload New Teacher**
1. Buka Homepage Editor → Tab Teachers
2. Klik "Add New Teacher"
3. Isi form:
   - Name: "Test Teacher 1"
   - Position: "Instructor"
   - Upload image
   - Order: 1
4. Save
5. **Check Browser Console**: Harus muncul log:
   ```
   Uploading image for teacher ID: 1
   Image uploaded successfully: /images/teacher-1.jpg
   ```
6. **Check Server Console**: Harus muncul log:
   ```
   Multer filename generation:
     - Section: teacher
     - Field: 1
     - Extension: .jpg
     - Generated filename: teacher-1.jpg
   ```
7. **Check File System**: File `public/images/teacher-1.jpg` harus ada

**Test Case 2: Upload Another Teacher**
1. Klik "Add New Teacher" lagi
2. Isi form:
   - Name: "Test Teacher 2"
   - Upload image BERBEDA
3. Save
4. **Check Console**: Harus ada log `teacher ID: 2` dan filename `teacher-2.jpg`
5. **Check File System**: 
   - `teacher-1.jpg` harus TETAP ADA
   - `teacher-2.jpg` harus BARU DIBUAT
   - Kedua file harus BERBEDA

**Test Case 3: Update Existing Teacher Image**
1. Edit Teacher 1
2. Upload image baru
3. Save
4. **Expected**: 
   - File `teacher-1.jpg` lama dihapus
   - File `teacher-1.jpg` baru dibuat (replace)
   - File `teacher-2.jpg` TIDAK TERPENGARUH

#### 3. Verify File System

Setelah test, check folder `public/images/`:
```bash
ls public/images/
```

**Expected output:**
```
teacher-1.jpg
teacher-2.jpg
teacher-3.jpg
class-1.jpg
class-2.jpg
banner-background.jpg
about-logo.png
```

Each file should have unique names based on their ID.

### Debug Output Examples

#### Browser Console (Correct):
```javascript
Uploading image for teacher ID: 1
uploadImage called with: teacher, 1
Image uploaded successfully: /images/teacher-1.jpg

Uploading image for teacher ID: 2
uploadImage called with: teacher, 2
Image uploaded successfully: /images/teacher-2.jpg
```

#### Server Console (Correct):
```
Multer filename generation:
  - Section: teacher
  - Field: 1
  - Extension: .jpg
  - Generated filename: teacher-1.jpg

Multer filename generation:
  - Section: teacher
  - Field: 2
  - Extension: .jpg
  - Generated filename: teacher-2.jpg
```

#### Browser Console (WRONG - All Same Name):
```javascript
// ❌ BAD - All using same filename
Uploading image for teacher ID: 1
Image uploaded successfully: /images/teacher-image.jpg  // ❌ Should be teacher-1.jpg

Uploading image for teacher ID: 2
Image uploaded successfully: /images/teacher-image.jpg  // ❌ Should be teacher-2.jpg
  - Deleting old file: teacher-image.jpg  // ❌ This deletes teacher 1's image!
```

### Common Issues

#### Issue 1: All Teachers Use Same Filename
**Symptom**: Semua teacher dapat nama file `teacher-image.jpg` atau `teacher-undefined.jpg`

**Cause**: ID tidak ter-pass dengan benar ke uploadImage

**Fix**: Pastikan `data.id` sudah terisi sebelum memanggil uploadImage

#### Issue 2: ID is Undefined
**Symptom**: Filename menjadi `teacher-undefined.jpg`

**Cause**: `formData.get('id')` return null/undefined

**Fix**: Pastikan input hidden dengan id="teacher_id" ada dan terisi

#### Issue 3: Image Gets Deleted When Uploading New Teacher
**Symptom**: Upload teacher baru menghapus image teacher lama

**Cause**: Semua menggunakan nama file yang sama

**Fix**: Pastikan setiap teacher punya ID unik yang di-pass ke multer

### Verification Checklist

- [ ] Each teacher has unique filename: `teacher-{id}.{ext}`
- [ ] Each class has unique filename: `class-{id}.{ext}`
- [ ] Uploading new teacher doesn't delete other teachers' images
- [ ] Updating existing teacher replaces only that teacher's image
- [ ] Browser console shows correct ID in upload log
- [ ] Server console shows correct section-field combination
- [ ] File system has separate files for each teacher/class

### If Test Fails

1. **Check Browser Console** untuk error messages
2. **Check Server Console** untuk multer logs
3. Verify `data.id` ada nilai nya sebelum upload
4. Verify hidden input `teacher_id` terisi dengan benar
5. Check apakah `req.body.field` di multer menerima ID

### Success Criteria

✅ **PASS jika:**
- File `teacher-1.jpg` dan `teacher-2.jpg` bisa ada bersamaan
- Update teacher 1 tidak affect teacher 2's image
- Console logs menunjukkan ID yang benar
- File system punya unique files per teacher

❌ **FAIL jika:**
- Semua teacher menggunakan nama file yang sama
- Upload teacher baru menghapus image teacher lama
- ID muncul sebagai "undefined" atau "image"
- File dalam folder hanya ada 1 untuk semua teacher
