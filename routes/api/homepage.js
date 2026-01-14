const express = require('express');
const router = express.Router();
const googleSheets = require('../../utils/googleSheets');
const upload = require('../../utils/imageUpload');
const path = require('path');
const fs = require('fs');

/**
 * @route POST /api/homepage/upload-image
 * @desc Upload an image
 * @access Admin only
 */
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log('Upload image request received:');
    console.log('  - req.body:', req.body);
    console.log('  - req.file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    
    const section = req.body.section || 'misc';
    const field = req.body.field || 'image';
    const ext = path.extname(req.file.originalname);
    
    // Generate final filename
    const finalFilename = `${section}-${field}${ext}`;
    const tempPath = req.file.path;
    const finalPath = path.join(path.dirname(tempPath), finalFilename);
    
    console.log('  - Section:', section);
    console.log('  - Field:', field);
    console.log('  - Final filename:', finalFilename);
    
    // Delete old file with same section-field prefix (different extension)
    const dir = path.dirname(tempPath);
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      if (f.startsWith(`${section}-${field}.`) && f !== finalFilename) {
        console.log('  - Deleting old file:', f);
        fs.unlinkSync(path.join(dir, f));
      }
    });
    
    // Rename temp file to final filename
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath); // Delete if exists
    }
    fs.renameSync(tempPath, finalPath);
    
    // Return the image URL
    const imageUrl = `/images/${finalFilename}`;
    
    console.log('  - Generated URL:', imageUrl);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: finalFilename,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage
 * @desc Get all homepage data from Google Sheets
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const data = await googleSheets.getAllHomepageData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/banner
 * @desc Get banner section data
 * @access Public
 */
router.get('/banner', async (req, res) => {
  try {
    const data = await googleSheets.getBannerData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching banner data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/about
 * @desc Get about section data
 * @access Public
 */
router.get('/about', async (req, res) => {
  try {
    const data = await googleSheets.getAboutData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/teachers
 * @desc Get teachers data
 * @access Public
 */
router.get('/teachers', async (req, res) => {
  try {
    const data = await googleSheets.getTeachersData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching teachers data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/testimonials
 * @desc Get testimonials data
 * @access Public
 */
router.get('/testimonials', async (req, res) => {
  try {
    const data = await googleSheets.getTestimonialsData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching testimonials data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/classes
 * @desc Get classes data
 * @access Public
 */
router.get('/classes', async (req, res) => {
  try {
    const data = await googleSheets.getClassesData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching classes data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/contact
 * @desc Get contact info data
 * @access Public
 */
router.get('/contact', async (req, res) => {
  try {
    const data = await googleSheets.getContactData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching contact data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/faq
 * @desc Get FAQ data
 * @access Public
 */
router.get('/faq', async (req, res) => {
  try {
    const data = await googleSheets.getFAQData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ data',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/homepage/colors
 * @desc Get colors & styles data
 * @access Public
 */
router.get('/colors', async (req, res) => {
  try {
    const data = await googleSheets.getColorsData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching colors data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colors data',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/banner
 * @desc Update banner section data
 * @access Admin only
 */
router.put('/banner', async (req, res) => {
  try {
    await googleSheets.updateBannerData(req.body);
    res.json({
      success: true,
      message: 'Banner data updated successfully',
    });
  } catch (error) {
    console.error('Error updating banner data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner data',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/about
 * @desc Update about section data
 * @access Admin only
 */
router.put('/about', async (req, res) => {
  try {
    await googleSheets.updateAboutData(req.body);
    res.json({
      success: true,
      message: 'About data updated successfully',
    });
  } catch (error) {
    console.error('Error updating about data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update about data',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/contact
 * @desc Update contact section data
 * @access Admin only
 */
router.put('/contact', async (req, res) => {
  try {
    await googleSheets.updateContactData(req.body);
    res.json({
      success: true,
      message: 'Contact data updated successfully',
    });
  } catch (error) {
    console.error('Error updating contact data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact data',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/section-settings/:sectionName
 * @desc Update section settings (title, subtitle, etc.)
 * @access Admin only
 */
router.put('/section-settings/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    await googleSheets.updateSectionSettings(sectionName, req.body);
    res.json({
      success: true,
      message: `Section settings for ${sectionName} updated successfully`,
    });
  } catch (error) {
    console.error('Error updating section settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section settings',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/colors
 * @desc Update all color settings
 * @access Admin only
 */
router.put('/colors', async (req, res) => {
  try {
    await googleSheets.updateAllColors(req.body);
    res.json({
      success: true,
      message: 'Color settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating colors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update color settings',
      error: error.message,
    });
  }
});

// ==================== TEACHERS CRUD ====================

/**
 * @route POST /api/homepage/teachers
 * @desc Add a new teacher
 * @access Admin only
 */
router.post('/teachers', async (req, res) => {
  try {
    await googleSheets.addTeacher(req.body);
    res.json({
      success: true,
      message: 'Teacher added successfully',
    });
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add teacher',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/teachers/:id
 * @desc Update a teacher
 * @access Admin only
 */
router.put('/teachers/:id', async (req, res) => {
  try {
    
    await googleSheets.updateTeacher(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Teacher updated successfully',
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/homepage/teachers/:id
 * @desc Delete a teacher
 * @access Admin only
 */
router.delete('/teachers/:id', async (req, res) => {
  try {
    await googleSheets.deleteTeacher(req.params.id);
    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher',
      error: error.message,
    });
  }
});

// ==================== TESTIMONIALS CRUD ====================

/**
 * @route POST /api/homepage/testimonials
 * @desc Add a new testimonial
 * @access Admin only
 */
router.post('/testimonials', async (req, res) => {
  try {
    await googleSheets.addTestimonial(req.body);
    res.json({
      success: true,
      message: 'Testimonial added successfully',
    });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add testimonial',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/testimonials/:id
 * @desc Update a testimonial
 * @access Admin only
 */
router.put('/testimonials/:id', async (req, res) => {
  try {
    await googleSheets.updateTestimonial(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Testimonial updated successfully',
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/homepage/testimonials/:id
 * @desc Delete a testimonial
 * @access Admin only
 */
router.delete('/testimonials/:id', async (req, res) => {
  try {
    await googleSheets.deleteTestimonial(req.params.id);
    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message,
    });
  }
});

// ==================== CLASSES CRUD ====================

/**
 * @route POST /api/homepage/classes
 * @desc Add a new class
 * @access Admin only
 */
router.post('/classes', async (req, res) => {
  try {
    await googleSheets.addClass(req.body);
    res.json({
      success: true,
      message: 'Class added successfully',
    });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add class',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/classes/:id
 * @desc Update a class
 * @access Admin only
 */
router.put('/classes/:id', async (req, res) => {
  try {
    await googleSheets.updateClass(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Class updated successfully',
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/homepage/classes/:id
 * @desc Delete a class
 * @access Admin only
 */
router.delete('/classes/:id', async (req, res) => {
  try {
    await googleSheets.deleteClass(req.params.id);
    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message,
    });
  }
});

// ==================== FAQ CRUD ====================

/**
 * @route POST /api/homepage/faq
 * @desc Add a new FAQ
 * @access Admin only
 */
router.post('/faq', async (req, res) => {
  try {
    await googleSheets.addFAQ(req.body);
    res.json({
      success: true,
      message: 'FAQ added successfully',
    });
  } catch (error) {
    console.error('Error adding FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add FAQ',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/homepage/faq/:id
 * @desc Update a FAQ
 * @access Admin only
 */
router.put('/faq/:id', async (req, res) => {
  try {
    await googleSheets.updateFAQ(req.params.id, req.body);
    res.json({
      success: true,
      message: 'FAQ updated successfully',
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FAQ',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/homepage/faq/:id
 * @desc Delete a FAQ
 * @access Admin only
 */
router.delete('/faq/:id', async (req, res) => {
  try {
    await googleSheets.deleteFAQ(req.params.id);
    res.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete FAQ',
      error: error.message,
    });
  }
});

module.exports = router;
