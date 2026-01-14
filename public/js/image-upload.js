/**
 * Image Upload Helper Functions
 */

/**
 * Upload an image file
 * @param {File} file - The file to upload
 * @param {string} section - Section name (e.g., 'banner', 'teacher')
 * @param {string} field - Field name (e.g., 'background', 'profile')
 * @returns {Promise<string>} - The uploaded image URL
 */
async function uploadImage(file, section, field) {
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('section', section);
  formData.append('field', field);

  for (let pair of formData.entries()) {
    console.log('  -', pair[0] + ':', pair[1]);
  }
  
  try {
    const response = await fetch('/api/homepage/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.imageUrl;
    } else {
      showAlert('❌ Upload failed: ' + result.message, 'danger');
      throw new Error(result.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    if (!error.message.includes('Upload failed')) {
      showAlert('❌ Error uploading image: ' + error.message, 'danger');
    }
    throw error;
  }
}

/**
 * Handle file input change and show preview
 * @param {Event} event - Input change event
 * @param {string} previewId - ID of the preview image element
 */
function handleImagePreview(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);
  
  if (file && preview) {
    // Also show container if exists
    const containerId = previewId + '_container';
    const container = document.getElementById(containerId);
    
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      if (container) {
        container.style.display = 'block';
      } else {
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Create image upload field
 * @param {string} id - Input ID
 * @param {string} label - Field label
 * @param {string} currentUrl - Current image URL (if any)
 * @returns {string} - HTML for image upload field
 */
function createImageUploadField(id, label, currentUrl = '') {
  const previewId = `${id}_preview`;
  const urlInputId = `${id}_url`;
  
  return `
    <div class="mb-3">
      <label for="${id}" class="form-label">${label}</label>
      <input type="file" class="form-control" id="${id}" name="${id}" accept="image/*" onchange="handleImagePreview(event, '${previewId}')">
      <input type="hidden" id="${urlInputId}" name="${id.replace('_file', '')}" value="${currentUrl}">
      <small class="form-text text-muted">Max file size: 5MB. Allowed formats: JPEG, PNG, GIF, WebP</small>
      ${currentUrl ? `
        <div class="mt-2">
          <img src="${currentUrl}" id="${previewId}" class="img-thumbnail" style="max-height: 150px; display: block;">
        </div>
      ` : `
        <div class="mt-2">
          <img id="${previewId}" class="img-thumbnail" style="max-height: 150px; display: none;">
        </div>
      `}
    </div>
  `;
}

console.log('Image upload helper initialized');
