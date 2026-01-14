/**
 * Homepage CRUD Operations for Teachers, Testimonials, Classes, and FAQ
 */

// Global data storage
let teachersData = [];
let testimonialsData = [];
let classesData = [];
let faqData = [];

// ==================== TEACHERS MANAGEMENT ====================

function renderTeachersList() {
  const container = document.getElementById('teachersList');
  if (!container) return;
  
  if (teachersData.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No teachers found. Click "Add New Teacher" to get started.</p>';
    return;
  }
  
  container.innerHTML = teachersData.map(teacher => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-2 text-center">
            ${teacher.image_url ? `<img src="${teacher.image_url}?t=${Date.now()}" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover;">` : '<div class="rounded-circle bg-secondary d-inline-block" style="width: 80px; height: 80px;"></div>'}
          </div>
          <div class="col-md-7">
            <h5 class="mb-1">${teacher.name || 'N/A'}</h5>
            <p class="mb-1 text-muted">${teacher.position || 'N/A'}</p>
            <small class="text-muted">Order: ${teacher.order || 'N/A'} | Active: ${teacher.active || 'TRUE'}</small>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-sm btn-primary" onclick="editTeacher(${teacher.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteTeacher(${teacher.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function showTeacherForm(teacher = null) {
  const isEdit = teacher !== null;
  const modalElement = document.getElementById('teacherModal');
  
  document.getElementById('teacherModalLabel').textContent = isEdit ? 'Edit Teacher' : 'Add New Teacher';
  document.getElementById('teacherForm').reset();
  
  if (isEdit) {
    document.getElementById('teacher_id').value = teacher.id;
    document.getElementById('teacher_name').value = teacher.name || '';
    document.getElementById('teacher_position').value = teacher.position || '';
    document.getElementById('teacher_image_url').value = teacher.image_url || '';
    document.getElementById('teacher_order').value = teacher.order || '';
    document.getElementById('teacher_active').checked = teacher.active === 'TRUE';
    // Show image preview if exists
    if (teacher.image_url) {
      const previewImg = document.getElementById('teacher_image_url_preview');
      const previewContainer = document.getElementById('teacher_image_url_preview_container');
      if (previewImg && previewContainer) {
        previewImg.src = teacher.image_url + '?t=' + Date.now();
        previewContainer.style.display = 'block';
      }
    }
  } else {
    // Generate new ID
    const maxId = teachersData.length > 0 ? Math.max(...teachersData.map(t => parseInt(t.id) || 0)) : 0;
    document.getElementById('teacher_id').value = maxId + 1;
    document.getElementById('teacher_order').value = teachersData.length + 1;
    document.getElementById('teacher_active').checked = true;
    
    // Hide preview for new entry
    const previewContainer = document.getElementById('teacher_image_url_preview_container');
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
  }
  
  // Show modal using jQuery
  $('#teacherModal').modal('show');
}

function editTeacher(id) {
  const teacher = teachersData.find(t => t.id == id);
  if (teacher) {
    showTeacherForm(teacher);
  }
}

async function saveTeacher(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  
  // Get existing image URL from hidden input
  const existingImageUrl = formData.get('image_url') || '';
  
  const data = {
    id: formData.get('id'),
    name: formData.get('name'),
    position: formData.get('position'),
    image_url: existingImageUrl, // Use existing URL first
    order: formData.get('order'),
    active: formData.get('active') === 'on', // Convert to boolean
  };
  
  // Handle image upload if file is selected
  const imageFile = document.getElementById('teacher_image_url_file').files[0];
  if (imageFile) {
    try {
      console.log('Uploading image for teacher ID:', data.id);
      // Upload with teacher ID as field name (e.g., teacher-1.jpg, teacher-2.jpg)
      const imageUrl = await uploadImage(imageFile, 'teacher', data.id);
      console.log('Image uploaded successfully:', imageUrl);
      data.image_url = imageUrl; // Override with new URL
    } catch (error) {
      console.error('Image upload failed:', error);
      // Continue with save using existing image_url
    }
  }
  
  const isEdit = teachersData.some(t => t.id == data.id);
  
  try {
    showLoading();
    
    const url = isEdit ? `/api/homepage/teachers/${data.id}` : '/api/homepage/teachers';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert(`✅ Teacher ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
      // Close modal using jQuery
      $('#teacherModal').modal('hide');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving teacher:', error);
    showAlert('❌ Error saving teacher', 'danger');
  } finally {
    hideLoading();
  }
}

async function confirmDeleteTeacher(id) {
  if (!confirm('Are you sure you want to delete this teacher?')) return;
  
  try {
    showLoading();
    
    const response = await fetch(`/api/homepage/teachers/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Teacher deleted successfully!', 'success');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error deleting teacher:', error);
    showAlert('❌ Error deleting teacher', 'danger');
  } finally {
    hideLoading();
  }
}

// ==================== TESTIMONIALS MANAGEMENT ====================

function renderTestimonialsList() {
  const container = document.getElementById('testimonialsList');
  if (!container) return;
  
  if (testimonialsData.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No testimonials found. Click "Add New Testimonial" to get started.</p>';
    return;
  }
  
  container.innerHTML = testimonialsData.map(testimonial => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-md-9">
            <h5 class="mb-1">${testimonial.client_name || 'N/A'}</h5>
            <div class="mb-2">
              ${'⭐'.repeat(parseInt(testimonial.rating) || 0)}
              <small class="text-muted">(${testimonial.rating || 0}/5)</small>
            </div>
            <p class="mb-1">${testimonial.testimonial ? testimonial.testimonial.substring(0, 150) + '...' : 'N/A'}</p>
            <small class="text-muted">Date: ${testimonial.date || 'N/A'} | Order: ${testimonial.order || 'N/A'}</small>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-sm btn-primary mb-1" onclick="editTestimonial(${testimonial.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteTestimonial(${testimonial.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function showTestimonialForm(testimonial = null) {
  const isEdit = testimonial !== null;
  const modalElement = document.getElementById('testimonialModal');
  
  document.getElementById('testimonialModalLabel').textContent = isEdit ? 'Edit Testimonial' : 'Add New Testimonial';
  document.getElementById('testimonialForm').reset();
  
  if (isEdit) {
    document.getElementById('testimonial_id').value = testimonial.id;
    document.getElementById('testimonial_client_name').value = testimonial.client_name || '';
    document.getElementById('testimonial_rating').value = testimonial.rating || '';
    document.getElementById('testimonial_testimonial').value = testimonial.testimonial || '';
    document.getElementById('testimonial_date').value = testimonial.date || '';
    document.getElementById('testimonial_order').value = testimonial.order || '';
    document.getElementById('testimonial_active').checked = testimonial.active === 'TRUE';
  } else {
    const maxId = testimonialsData.length > 0 ? Math.max(...testimonialsData.map(t => parseInt(t.id) || 0)) : 0;
    document.getElementById('testimonial_id').value = maxId + 1;
    document.getElementById('testimonial_order').value = testimonialsData.length + 1;
    document.getElementById('testimonial_active').checked = true;
    document.getElementById('testimonial_date').value = new Date().toISOString().split('T')[0];
  }
  
  // Show modal using jQuery
  $('#testimonialModal').modal('show');
}

function editTestimonial(id) {
  const testimonial = testimonialsData.find(t => t.id == id);
  if (testimonial) {
    showTestimonialForm(testimonial);
  }
}

async function saveTestimonial(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    id: formData.get('id'),
    client_name: formData.get('client_name'),
    rating: formData.get('rating'),
    testimonial: formData.get('testimonial'),
    date: formData.get('date'),
    order: formData.get('order'),
    active: formData.get('active') === 'on',
  };
  
  const isEdit = testimonialsData.some(t => t.id == data.id);
  
  try {
    showLoading();
    
    const url = isEdit ? `/api/homepage/testimonials/${data.id}` : '/api/homepage/testimonials';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert(`✅ Testimonial ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
      // Close modal using jQuery
      $('#testimonialModal').modal('hide');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving testimonial:', error);
    showAlert('❌ Error saving testimonial', 'danger');
  } finally {
    hideLoading();
  }
}

async function confirmDeleteTestimonial(id) {
  if (!confirm('Are you sure you want to delete this testimonial?')) return;
  
  try {
    showLoading();
    
    const response = await fetch(`/api/homepage/testimonials/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Testimonial deleted successfully!', 'success');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    showAlert('❌ Error deleting testimonial', 'danger');
  } finally {
    hideLoading();
  }
}

// ==================== CLASSES MANAGEMENT ====================

function renderClassesList() {
  const container = document.getElementById('classesList');
  if (!container) return;
  
  if (classesData.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No classes found. Click "Add New Class" to get started.</p>';
    return;
  }
  
  container.innerHTML = classesData.map(cls => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-2 text-center">
            ${cls.image_url ? `<img src="${cls.image_url}?t=${Date.now()}" class="img-fluid rounded" style="max-height: 100px;">` : '<div class="bg-secondary rounded" style="width: 100px; height: 100px;"></div>'}
          </div>
          <div class="col-md-7">
            <h5 class="mb-1">${cls.class_name || 'N/A'}</h5>
            <p class="mb-1 text-muted">${cls.description ? cls.description.substring(0, 100) + '...' : 'N/A'}</p>
            <small class="text-muted">Duration: ${cls.duration || 'N/A'} | Difficulty: ${cls.difficulty || 'N/A'} | Order: ${cls.order || 'N/A'}</small>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-sm btn-primary mb-1" onclick="editClass(${cls.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteClass(${cls.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function showClassForm(cls = null) {
  const isEdit = cls !== null;
  const modalElement = document.getElementById('classModal');
  
  document.getElementById('classModalLabel').textContent = isEdit ? 'Edit Class' : 'Add New Class';
  document.getElementById('classForm').reset();
  
  if (isEdit) {
    document.getElementById('class_id').value = cls.id;
    document.getElementById('class_name').value = cls.class_name || '';
    document.getElementById('class_description').value = cls.description || '';
    document.getElementById('class_image_url').value = cls.image_url || '';
    document.getElementById('class_duration').value = cls.duration || '';
    document.getElementById('class_difficulty').value = cls.difficulty || '';
    document.getElementById('class_anchor_link').value = cls.anchor_link || '';
    document.getElementById('class_order').value = cls.order || '';
    document.getElementById('class_active').checked = cls.active === 'TRUE';
    
    // Show image preview if exists
    if (cls.image_url) {
      const previewImg = document.getElementById('class_image_url_preview');
      const previewContainer = document.getElementById('class_image_url_preview_container');
      if (previewImg && previewContainer) {
        previewImg.src = cls.image_url + '?t=' + Date.now();
        previewContainer.style.display = 'block';
      }
    }
  } else {
    const maxId = classesData.length > 0 ? Math.max(...classesData.map(c => parseInt(c.id) || 0)) : 0;
    document.getElementById('class_id').value = maxId + 1;
    document.getElementById('class_order').value = classesData.length + 1;
    document.getElementById('class_active').checked = true;
    
    // Hide preview for new entry
    const previewContainer = document.getElementById('class_image_url_preview_container');
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
  }
  
  // Show modal using jQuery
  $('#classModal').modal('show');
}

function editClass(id) {
  const cls = classesData.find(c => c.id == id);
  if (cls) {
    showClassForm(cls);
  }
}

async function saveClass(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  
  // Get existing image URL from hidden input
  const existingImageUrl = formData.get('image_url') || '';
  
  const data = {
    id: formData.get('id'),
    class_name: formData.get('class_name'),
    description: formData.get('description'),
    image_url: existingImageUrl, // Use existing URL first
    duration: formData.get('duration'),
    difficulty: formData.get('difficulty'),
    anchor_link: formData.get('anchor_link'),
    order: formData.get('order'),
    active: formData.get('active') === 'on', // Convert to boolean
  };
  
  // Handle image upload if file is selected
  const imageFile = document.getElementById('class_image_url_file').files[0];
  if (imageFile) {
    try {
      console.log('Uploading image for class ID:', data.id);
      // Upload with class ID as field name (e.g., class-1.jpg, class-2.jpg)
      const imageUrl = await uploadImage(imageFile, 'class', data.id);
      console.log('Image uploaded successfully:', imageUrl);
      data.image_url = imageUrl; // Override with new URL
    } catch (error) {
      console.error('Image upload failed:', error);
      // Continue with save using existing image_url
    }
  }
  
  const isEdit = classesData.some(c => c.id == data.id);
  
  try {
    showLoading();
    
    const url = isEdit ? `/api/homepage/classes/${data.id}` : '/api/homepage/classes';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert(`✅ Class ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
      // Close modal using jQuery
      $('#classModal').modal('hide');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving class:', error);
    showAlert('❌ Error saving class', 'danger');
  } finally {
    hideLoading();
  }
}

async function confirmDeleteClass(id) {
  if (!confirm('Are you sure you want to delete this class?')) return;
  
  try {
    showLoading();
    
    const response = await fetch(`/api/homepage/classes/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ Class deleted successfully!', 'success');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error deleting class:', error);
    showAlert('❌ Error deleting class', 'danger');
  } finally {
    hideLoading();
  }
}

// ==================== FAQ MANAGEMENT ====================

function renderFAQList() {
  const container = document.getElementById('faqList');
  if (!container) return;
  
  if (faqData.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4">No FAQs found. Click "Add New FAQ" to get started.</p>';
    return;
  }
  
  container.innerHTML = faqData.map(faq => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-md-9">
            <h6 class="mb-2"><strong>Q:</strong> ${faq.question || 'N/A'}</h6>
            <p class="mb-1 text-muted"><strong>A:</strong> ${faq.answer ? faq.answer.substring(0, 150) + '...' : 'N/A'}</p>
            <small class="text-muted">Order: ${faq.order || 'N/A'} | Active: ${faq.active || 'TRUE'}</small>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-sm btn-primary mb-1" onclick="editFAQ(${faq.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteFAQ(${faq.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function showFAQForm(faq = null) {
  const isEdit = faq !== null;
  const modalElement = document.getElementById('faqModal');
  
  document.getElementById('faqModalLabel').textContent = isEdit ? 'Edit FAQ' : 'Add New FAQ';
  document.getElementById('faqForm').reset();
  
  if (isEdit) {
    document.getElementById('faq_id').value = faq.id;
    document.getElementById('faq_question').value = faq.question || '';
    document.getElementById('faq_answer').value = faq.answer || '';
    document.getElementById('faq_order').value = faq.order || '';
    document.getElementById('faq_active').checked = faq.active === 'TRUE';
  } else {
    const maxId = faqData.length > 0 ? Math.max(...faqData.map(f => parseInt(f.id) || 0)) : 0;
    document.getElementById('faq_id').value = maxId + 1;
    document.getElementById('faq_order').value = faqData.length + 1;
    document.getElementById('faq_active').checked = true;
  }
  
  // Show modal using jQuery
  $('#faqModal').modal('show');
}

function editFAQ(id) {
  const faq = faqData.find(f => f.id == id);
  if (faq) {
    showFAQForm(faq);
  }
}

async function saveFAQ(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = {
    id: formData.get('id'),
    question: formData.get('question'),
    answer: formData.get('answer'),
    order: formData.get('order'),
    active: formData.get('active') === 'on',
  };
  
  const isEdit = faqData.some(f => f.id == data.id);
  
  try {
    showLoading();
    
    const url = isEdit ? `/api/homepage/faq/${data.id}` : '/api/homepage/faq';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert(`✅ FAQ ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
      // Close modal using jQuery
      $('#faqModal').modal('hide');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error saving FAQ:', error);
    showAlert('❌ Error saving FAQ', 'danger');
  } finally {
    hideLoading();
  }
}

async function confirmDeleteFAQ(id) {
  if (!confirm('Are you sure you want to delete this FAQ?')) return;
  
  try {
    showLoading();
    
    const response = await fetch(`/api/homepage/faq/${id}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (result.success) {
      showAlert('✅ FAQ deleted successfully!', 'success');
      await loadHomepageData();
    } else {
      showAlert('❌ ' + result.message, 'danger');
    }
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    showAlert('❌ Error deleting FAQ', 'danger');
  } finally {
    hideLoading();
  }
}

// ==================== INITIALIZATION ====================

// Override loadHomepageData to also populate CRUD lists
const originalLoadHomepageData = window.loadHomepageData;
window.loadHomepageData = async function() {
  await originalLoadHomepageData();
  
  try {
    const response = await fetch('/api/homepage');
    const result = await response.json();
    
    if (result.success) {
      teachersData = result.data.teachers || [];
      testimonialsData = result.data.testimonials || [];
      classesData = result.data.classes || [];
      faqData = result.data.faq || [];
      
      renderTeachersList();
      renderTestimonialsList();
      renderClassesList();
      renderFAQList();
    }
  } catch (error) {
    console.error('Error loading CRUD data:', error);
  }
};

console.log('Homepage CRUD initialized');
