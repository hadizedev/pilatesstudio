/**
 * Homepage Visual Editor Client-side JavaScript
 */

// Show loading overlay
function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
  
  // Scroll to top to show alert
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load initial data into forms
async function loadHomepageData() {
  try {
    showLoading();
    const response = await fetch('/api/homepage');
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      // Load Banner data
      if (data.banner) {
        Object.keys(data.banner).forEach(key => {
          const input = document.getElementById(`banner_${key}`);
          if (input && data.banner[key]) {
            input.value = data.banner[key];
          }
        });
        
        // Show background image preview
        if (data.banner.background_image) {
          const previewImg = document.getElementById('banner_background_image_preview');
          const previewContainer = document.getElementById('banner_background_image_preview_container');
          if (previewImg && previewContainer) {
            previewImg.src = data.banner.background_image;
            previewContainer.style.display = 'block';
          }
        }
      }
      
      // Load About data
      if (data.about) {
        Object.keys(data.about).forEach(key => {
          const input = document.getElementById(`about_${key}`);
          if (input && data.about[key]) {
            input.value = data.about[key];
          }
        });
        
        // Show logo image preview
        if (data.about.logo_image) {
          const previewImg = document.getElementById('about_logo_image_preview');
          const previewContainer = document.getElementById('about_logo_image_preview_container');
          if (previewImg && previewContainer) {
            previewImg.src = data.about.logo_image;
            previewContainer.style.display = 'block';
          }
        }
      }
      
      // Load Contact data
      if (data.contact) {
        Object.keys(data.contact).forEach(key => {
          const input = document.getElementById(`contact_${key}`);
          if (input && data.contact[key]) {
            input.value = data.contact[key];
          }
        });
      }
      
      // Load Section Settings data
      if (data.sectionSettings) {
        // Teachers section
        if (data.sectionSettings.teachers) {
          const teachersTitle = document.getElementById('teachers_section_title');
          const teachersSubtitle = document.getElementById('teachers_section_subtitle');
          if (teachersTitle) teachersTitle.value = data.sectionSettings.teachers.title || '';
          if (teachersSubtitle) teachersSubtitle.value = data.sectionSettings.teachers.subtitle || '';
        }
        
        // Testimonials section
        if (data.sectionSettings.testimonials) {
          const testimonialsTitle = document.getElementById('testimonials_section_title');
          const testimonialsSubtitle = document.getElementById('testimonials_section_subtitle');
          if (testimonialsTitle) testimonialsTitle.value = data.sectionSettings.testimonials.title || '';
          if (testimonialsSubtitle) testimonialsSubtitle.value = data.sectionSettings.testimonials.subtitle || '';
        }
        
        // Classes section
        if (data.sectionSettings.classes) {
          const classesTitle = document.getElementById('classes_section_title');
          const classesSubtitle = document.getElementById('classes_section_subtitle');
          if (classesTitle) classesTitle.value = data.sectionSettings.classes.title || '';
          if (classesSubtitle) classesSubtitle.value = data.sectionSettings.classes.subtitle || '';
        }
      }
      
      // Load Colors data
      if (data.colors) {
        const sections = ['banner', 'about', 'teachers', 'testimonials', 'classes', 'contact'];
        sections.forEach(section => {
          if (data.colors[section]) {
            const bgInput = document.getElementById(`colors_${section}_bg`);
            const textInput = document.getElementById(`colors_${section}_text`);
            
            if (bgInput && data.colors[section].background_color) {
              bgInput.value = data.colors[section].background_color;
            }
            if (textInput && data.colors[section].text_color) {
              textInput.value = data.colors[section].text_color;
            }
          }
        });
      }
      
      console.log('Homepage data loaded successfully');
    } else {
      showAlert('Failed to load homepage data: ' + result.message, 'warning');
    }
  } catch (error) {
    console.error('Error loading homepage data:', error);
    showAlert('Error loading homepage data. Please refresh the page.', 'danger');
  } finally {
    hideLoading();
  }
}

// Handle Banner form submission
document.getElementById('bannerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Handle image upload if file is selected
    const imageFile = document.getElementById('banner_background_image_file').files[0];
    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, 'banner', 'background');
      data.background_image = imageUrl;
    }
    
    const response = await fetch('/api/homepage/banner', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Banner settings saved successfully!', 'success');
      await loadHomepageData(); // Reload to show new image
    } else {
      showAlert('❌ Failed to save banner settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving banner data:', error);
    showAlert('❌ Error saving banner settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle About form submission
document.getElementById('aboutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Handle image upload if file is selected
    const imageFile = document.getElementById('about_logo_image_file').files[0];
    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, 'about', 'logo');
      data.logo_image = imageUrl;
    }
    
    const response = await fetch('/api/homepage/about', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ About settings saved successfully!', 'success');
      await loadHomepageData(); // Reload to show new image
    } else {
      showAlert('❌ Failed to save about settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving about data:', error);
    showAlert('❌ Error saving about settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle Contact form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/homepage/contact', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Contact settings saved successfully!', 'success');
    } else {
      showAlert('❌ Failed to save contact settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving contact data:', error);
    showAlert('❌ Error saving contact settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle Teachers Section form submission
document.getElementById('teachersSectionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/homepage/section-settings/teachers', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Teachers section settings saved successfully!', 'success');
    } else {
      showAlert('❌ Failed to save teachers settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving teachers section data:', error);
    showAlert('❌ Error saving teachers settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle Testimonials Section form submission
document.getElementById('testimonialsSectionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/homepage/section-settings/testimonials', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Testimonials section settings saved successfully!', 'success');
    } else {
      showAlert('❌ Failed to save testimonials settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving testimonials section data:', error);
    showAlert('❌ Error saving testimonials settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle Classes Section form submission
document.getElementById('classesSectionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/homepage/section-settings/classes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Classes section settings saved successfully!', 'success');
    } else {
      showAlert('❌ Failed to save classes settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving classes section data:', error);
    showAlert('❌ Error saving classes settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Handle Colors form submission
document.getElementById('colorsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    showLoading();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/homepage/colors', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Color settings saved successfully!', 'success');
    } else {
      showAlert('❌ Failed to save color settings: ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving color data:', error);
    showAlert('❌ Error saving color settings. Please try again.', 'danger');
  } finally {
    hideLoading();
  }
});

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadHomepageData();
  
  // Add unsaved changes warning
  let hasUnsavedChanges = false;
  
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('change', () => {
      hasUnsavedChanges = true;
    });
    
    form.addEventListener('submit', () => {
      hasUnsavedChanges = false;
    });
  });
  
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  });
});

// Add keyboard shortcut for save (Ctrl+S)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    
    // Find active tab and submit its form
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
      const form = activeTab.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  }
});

console.log('Homepage Editor initialized');
