const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

// Load credentials from environment variables
const credentials = {
  type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
};

// Initialize Google Sheets API with write permissions
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Your Google Sheets ID - UPDATE THIS WITH YOUR ACTUAL SPREADSHEET ID
const SPREADSHEET_ID = process.env.HOMEPAGE_SPREADSHEET_ID || '1TWRs_Ml-LSqIZpvRDB9klwF_JC9HjWig00iCw1GWnXs';

/**
 * Get data from a specific sheet
 * @param {string} sheetName - Name of the sheet to read
 * @param {string} range - Range to read (e.g., 'A1:Z100')
 * @returns {Promise<Array>} - Array of rows
 */
async function getSheetData(sheetName, range = '') {
  try {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
    });

    return response.data.values || [];
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Convert sheet data to array of objects
 * @param {Array} rows - Raw sheet data
 * @returns {Array<Object>} - Array of objects with header keys
 */
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

/**
 * Get banner section data
 */
async function getBannerData() {
  try {
    const rows = await getSheetData('Banner');
    const data = rowsToObjects(rows);
    return data[0] || null; // Return first row
  } catch (error) {
    console.error('Error getting banner data:', error.message);
    return null;
  }
}

/**
 * Get about section data
 */
async function getAboutData() {
  try {
    const rows = await getSheetData('About');
    const data = rowsToObjects(rows);
    return data[0] || null; // Return first row
  } catch (error) {
    console.error('Error getting about data:', error.message);
    return null;
  }
}

/**
 * Get teachers data
 */
async function getTeachersData() {
  try {
    const rows = await getSheetData('Teachers');
    const data = rowsToObjects(rows);
    // Filter only active teachers and sort by order
    return data
      .filter(teacher => teacher.active === 'TRUE' || teacher.active === true)
      .sort((a, b) => parseInt(a.order || 0) - parseInt(b.order || 0));
  } catch (error) {
    console.error('Error getting teachers data:', error.message);
    return [];
  }
}

/**
 * Get testimonials data
 */
async function getTestimonialsData() {
  try {
    const rows = await getSheetData('Testimonials');
    const data = rowsToObjects(rows);
    // Filter only active testimonials and sort by order
    return data
      .filter(testimonial => testimonial.active === 'TRUE' || testimonial.active === true)
      .sort((a, b) => parseInt(a.order || 0) - parseInt(b.order || 0));
  } catch (error) {
    console.error('Error getting testimonials data:', error.message);
    return [];
  }
}

/**
 * Get classes data
 */
async function getClassesData() {
  try {
    const rows = await getSheetData('Classes');
    const data = rowsToObjects(rows);
    // Filter only active classes and sort by order
    return data
      .filter(classItem => classItem.active === 'TRUE' || classItem.active === true)
      .sort((a, b) => parseInt(a.order || 0) - parseInt(b.order || 0));
  } catch (error) {
    console.error('Error getting classes data:', error.message);
    return [];
  }
}

/**
 * Get contact info data
 */
async function getContactData() {
  try {
    const rows = await getSheetData('Contact');
    const data = rowsToObjects(rows);
    return data[0] || null; // Return first row
  } catch (error) {
    console.error('Error getting contact data:', error.message);
    return null;
  }
}

/**
 * Get FAQ data
 */
async function getFAQData() {
  try {
    const rows = await getSheetData('FAQ');
    const data = rowsToObjects(rows);
    // Filter only active FAQs and sort by order
    return data
      .filter(faq => faq.active === 'TRUE' || faq.active === true)
      .sort((a, b) => parseInt(a.order || 0) - parseInt(b.order || 0));
  } catch (error) {
    console.error('Error getting FAQ data:', error.message);
    return [];
  }
}

/**
 * Get colors & styles data
 */
async function getColorsData() {
  try {
    const rows = await getSheetData('Colors');
    const data = rowsToObjects(rows);
    // Convert to object with section_name as key
    const colorsObj = {};
    data.forEach(item => {
      colorsObj[item.section_name] = {
        primary_color: item.primary_color,
        secondary_color: item.secondary_color,
        background_color: item.background_color,
        text_color: item.text_color,
      };
    });
    return colorsObj;
  } catch (error) {
    console.error('Error getting colors data:', error.message);
    return {};
  }
}

/**
 * Get section settings data
 */
async function getSectionSettingsData() {
  try {
    const rows = await getSheetData('SectionSettings');
    const data = rowsToObjects(rows);
    // Convert to object with section_name as key
    const settingsObj = {};
    data.forEach(item => {
      settingsObj[item.section_name] = {
        title: item.title,
        subtitle: item.subtitle,
        enabled: item.active === 'TRUE' || item.active === true,
        active: item.active === 'TRUE' || item.active === true, // Keep for backward compatibility
        order: parseInt(item.order || 0),
      };
    });
    return settingsObj;
  } catch (error) {
    console.error('Error getting section settings data:', error.message);
    return {};
  }
}

/**
 * Get all homepage data at once
 */
async function getAllHomepageData() {
  try {
    const [
      banner,
      about,
      teachers,
      testimonials,
      classes,
      contact,
      faq,
      colors,
      sectionSettings,
    ] = await Promise.all([
      getBannerData(),
      getAboutData(),
      getTeachersData(),
      getTestimonialsData(),
      getClassesData(),
      getContactData(),
      getFAQData(),
      getColorsData(),
      getSectionSettingsData(),
    ]);

    return {
      banner,
      about,
      teachers,
      testimonials,
      classes,
      contact,
      faq,
      colors,
      sectionSettings,
    };
  } catch (error) {
    console.error('Error getting all homepage data:', error.message);
    throw error;
  }
}

/**
 * Update data in a specific sheet row
 * @param {string} sheetName - Name of the sheet
 * @param {string} range - Range to update (e.g., 'A2:Z2')
 * @param {Array} values - Array of values to update
 * @returns {Promise<Object>} - Update result
 */
async function updateSheetData(sheetName, range, values) {
  try {
    const fullRange = `${sheetName}!${range}`;
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
      valueInputOption: 'RAW',
      resource: {
        values: [values],
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating sheet ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Update banner data
 * @param {Object} data - Banner data object
 * @returns {Promise<Object>} - Update result
 */
async function updateBannerData(data) {
  try {
    const values = [
      data.id || 1,
      data.title_line1 || '',
      data.title_line2 || '',
      data.subtitle || '',
      data.tagline || '',
      data.background_image || '',
      data.overlay_opacity || '',
      data.instagram_url || '',
      data.location_url || '',
      data.whatsapp_number || '',
      data.whatsapp_text || '',
    ];
    
    return await updateSheetData('Banner', 'A2:K2', values);
  } catch (error) {
    console.error('Error updating banner data:', error.message);
    throw error;
  }
}

/**
 * Update about data
 * @param {Object} data - About data object
 * @returns {Promise<Object>} - Update result
 */
async function updateAboutData(data) {
  try {
    const values = [
      data.id || 1,
      data.title || '',
      data.title_highlight || '',
      data.title_color || '',
      data.title_color_highlight || '',
      data.subtitle || '',
      data.logo_image || '',
      data.reason_1 || '',
      data.reason_2 || '',
      data.reason_3 || '',
      data.reason_4 || '',
    ];
    
    return await updateSheetData('About', 'A2:K2', values);
  } catch (error) {
    console.error('Error updating about data:', error.message);
    throw error;
  }
}

/**
 * Update contact data
 * @param {Object} data - Contact data object
 * @returns {Promise<Object>} - Update result
 */
async function updateContactData(data) {
  try {
    const values = [
      data.id || 1,
      data.address || '',
      data.phone || '',
      data.mon_fri_hours || '',
      data.sat_hours || '',
      data.sun_hours || '',
      data.map_embed_url || '',
      data.whatsapp_number || '',
    ];
    
    return await updateSheetData('Contact', 'A2:H2', values);
  } catch (error) {
    console.error('Error updating contact data:', error.message);
    throw error;
  }
}

/**
 * Update section settings
 * @param {string} sectionName - Section name (e.g., 'teachers', 'testimonials', 'classes')
 * @param {Object} data - Section settings data
 * @returns {Promise<Object>} - Update result
 */
async function updateSectionSettings(sectionName, data) {
  try {
    // First, get all section settings to find the row
    const rows = await getSheetData('SectionSettings');
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    // Find the row for this section
    const rowIndex = dataRows.findIndex(row => row[0] === sectionName);
    
    if (rowIndex === -1) {
      throw new Error(`Section ${sectionName} not found in SectionSettings sheet`);
    }
    
    // Get existing row data
    const existingRow = dataRows[rowIndex];
    
    // Row number in sheet (header + 1 + rowIndex)
    const sheetRow = rowIndex + 2;
    
    const values = [
      sectionName,
      data.title !== undefined ? data.title : (existingRow[1] || ''),
      data.subtitle !== undefined ? data.subtitle : (existingRow[2] || ''),
      data.active !== undefined ? (data.active === 'TRUE' || data.active === true ? 'TRUE' : 'FALSE') : (existingRow[3] || 'TRUE'),
      data.order !== undefined ? data.order : (existingRow[4] || (rowIndex + 1)),
    ];
    
    return await updateSheetData('SectionSettings', `A${sheetRow}:E${sheetRow}`, values);
  } catch (error) {
    console.error(`Error updating section settings for ${sectionName}:`, error.message);
    throw error;
  }
}

/**
 * Update colors for a specific section
 * @param {string} sectionName - Section name (e.g., 'banner', 'about', etc.)
 * @param {Object} data - Color data object
 * @returns {Promise<Object>} - Update result
 */
async function updateSectionColors(sectionName, data) {
  try {
    // First, get all colors to find the row
    const rows = await getSheetData('Colors');
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    // Find the row for this section
    const rowIndex = dataRows.findIndex(row => row[0] === sectionName);
    
    const values = [
      sectionName,
      data.primary_color || '#514f34',
      data.secondary_color || '#a05a3f',
      data.background_color || '#ffffff',
      data.text_color || '#333333',
    ];
    
    if (rowIndex === -1) {
      // Section doesn't exist, create new row
      console.log(`Section ${sectionName} not found, creating new row in Colors sheet`);
      return await appendSheetData('Colors', values);
    }
    
    // Row number in sheet (header + 1 + rowIndex)
    const sheetRow = rowIndex + 2;
    
    return await updateSheetData('Colors', `A${sheetRow}:E${sheetRow}`, values);
  } catch (error) {
    console.error(`Error updating colors for ${sectionName}:`, error.message);
    throw error;
  }
}

/**
 * Update all colors at once
 * @param {Object} colorData - Object with section names as keys
 * @returns {Promise<Array>} - Array of update results
 */
async function updateAllColors(colorData) {
  try {
    const sections = ['banner', 'about', 'teachers', 'testimonials', 'classes', 'contact'];
    const results = [];
    
    for (const section of sections) {
      if (colorData[`${section}_background_color`]) {
        try {
          const result = await updateSectionColors(section, {
            background_color: colorData[`${section}_background_color`],
            text_color: colorData[`${section}_text_color`],
          });
          results.push({ section, success: true, result });
        } catch (error) {
          console.error(`Failed to update colors for ${section}:`, error.message);
          results.push({ section, success: false, error: error.message });
        }
      }
    }
    
    // Check if any updates succeeded
    const successCount = results.filter(r => r.success).length;
    if (successCount === 0 && results.length > 0) {
      throw new Error('All color updates failed');
    }
    
    return results;
  } catch (error) {
    console.error('Error updating all colors:', error.message);
    throw error;
  }
}

/**
 * Add a new row to a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {Array} values - Array of values to add
 * @returns {Promise<Object>} - Append result
 */
async function appendSheetData(sheetName, values) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values],
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Delete a row from a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowIndex - Row number to delete (1-based, including header)
 * @returns {Promise<Object>} - Delete result
 */
async function deleteSheetRow(sheetName, rowIndex) {
  try {
    // Get sheet ID first
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    
    const sheetId = sheet.properties.sheetId;
    
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        }],
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error deleting row from sheet ${sheetName}:`, error.message);
    throw error;
  }
}

/**
 * Add a new teacher
 * @param {Object} data - Teacher data
 * @returns {Promise<Object>} - Add result
 */
async function addTeacher(data) {
  try {
    const values = [
      data.id || '',
      data.name || '',
      data.position || '',
      data.image_url || '',
      data.order || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE'
    ];
    
    return await appendSheetData('Teachers', values);
  } catch (error) {
    console.error('Error adding teacher:', error.message);
    throw error;
  }
}

/**
 * Update a teacher by ID
 * @param {string|number} id - Teacher ID
 * @param {Object} data - Teacher data
 * @returns {Promise<Object>} - Update result
 */
async function updateTeacher(id, data) {
  try {
    const rows = await getSheetData('Teachers');
    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Teacher with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    
    const values = [
      id,
      data.name || '',
      data.position || '',
      data.image_url || '',
      data.order || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE'
    ];
    
    return await updateSheetData('Teachers', `A${sheetRow}:F${sheetRow}`, values);
  } catch (error) {
    console.error('Error updating teacher:', error.message);
    throw error;
  }
}

/**
 * Delete a teacher by ID
 * @param {string|number} id - Teacher ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteTeacher(id) {
  try {
    const rows = await getSheetData('Teachers');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Teacher with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    return await deleteSheetRow('Teachers', sheetRow);
  } catch (error) {
    console.error('Error deleting teacher:', error.message);
    throw error;
  }
}

/**
 * Add a new testimonial
 */
async function addTestimonial(data) {
  try {
    const values = [
      data.id || '',
      data.client_name || '',
      data.rating || '',
      data.testimonial || '',
      data.date || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
      data.order || '',
    ];
    
    return await appendSheetData('Testimonials', values);
  } catch (error) {
    console.error('Error adding testimonial:', error.message);
    throw error;
  }
}

/**
 * Update a testimonial by ID
 */
async function updateTestimonial(id, data) {
  try {
    const rows = await getSheetData('Testimonials');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Testimonial with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    
    const values = [
      id,
      data.client_name || '',
      data.rating || '',
      data.testimonial || '',
      data.date || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
      data.order || '',
    ];
    
    return await updateSheetData('Testimonials', `A${sheetRow}:G${sheetRow}`, values);
  } catch (error) {
    console.error('Error updating testimonial:', error.message);
    throw error;
  }
}

/**
 * Delete a testimonial by ID
 */
async function deleteTestimonial(id) {
  try {
    const rows = await getSheetData('Testimonials');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Testimonial with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    return await deleteSheetRow('Testimonials', sheetRow);
  } catch (error) {
    console.error('Error deleting testimonial:', error.message);
    throw error;
  }
}

/**
 * Add a new class
 */
async function addClass(data) {
  try {
    const values = [
      data.id || '',
      data.class_name || '',
      data.description || '',
      data.image_url || '',
      data.duration || '',
      data.difficulty || '',
      data.anchor_link || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
      data.order || '',
    ];
    
    return await appendSheetData('Classes', values);
  } catch (error) {
    console.error('Error adding class:', error.message);
    throw error;
  }
}

/**
 * Update a class by ID
 */
async function updateClass(id, data) {
  try {
    const rows = await getSheetData('Classes');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    
    const values = [
      id,
      data.class_name || '',
      data.description || '',
      data.image_url || '',
      data.duration || '',
      data.difficulty || '',
      data.anchor_link || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
      data.order || '',
    ];
    
    return await updateSheetData('Classes', `A${sheetRow}:I${sheetRow}`, values);
  } catch (error) {
    console.error('Error updating class:', error.message);
    throw error;
  }
}

/**
 * Delete a class by ID
 */
async function deleteClass(id) {
  try {
    const rows = await getSheetData('Classes');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    return await deleteSheetRow('Classes', sheetRow);
  } catch (error) {
    console.error('Error deleting class:', error.message);
    throw error;
  }
}

/**
 * Add a new FAQ
 */
async function addFAQ(data) {
  try {
    const values = [
      data.id || '',
      data.question || '',
      data.answer || '',
      data.order || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
    ];
    
    return await appendSheetData('FAQ', values);
  } catch (error) {
    console.error('Error adding FAQ:', error.message);
    throw error;
  }
}

/**
 * Update a FAQ by ID
 */
async function updateFAQ(id, data) {
  try {
    const rows = await getSheetData('FAQ');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`FAQ with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    
    const values = [
      id,
      data.question || '',
      data.answer || '',
      data.order || '',
      data.active !== undefined ? (data.active ? 'TRUE' : 'FALSE') : 'TRUE',
    ];
    
    return await updateSheetData('FAQ', `A${sheetRow}:E${sheetRow}`, values);
  } catch (error) {
    console.error('Error updating FAQ:', error.message);
    throw error;
  }
}

/**
 * Delete a FAQ by ID
 */
async function deleteFAQ(id) {
  try {
    const rows = await getSheetData('FAQ');
    const dataRows = rows.slice(1);
    
    const rowIndex = dataRows.findIndex(row => row[0] == id);
    if (rowIndex === -1) {
      throw new Error(`FAQ with ID ${id} not found`);
    }
    
    const sheetRow = rowIndex + 2;
    return await deleteSheetRow('FAQ', sheetRow);
  } catch (error) {
    console.error('Error deleting FAQ:', error.message);
    throw error;
  }
}

module.exports = {
  getSheetData,
  rowsToObjects,
  getBannerData,
  getAboutData,
  getTeachersData,
  getTestimonialsData,
  getClassesData,
  getContactData,
  getFAQData,
  getColorsData,
  getSectionSettingsData,
  getAllHomepageData,
  updateSheetData,
  updateBannerData,
  updateAboutData,
  updateContactData,
  updateSectionSettings,
  updateSectionColors,
  updateAllColors,
  appendSheetData,
  deleteSheetRow,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  addClass,
  updateClass,
  deleteClass,
  addFAQ,
  updateFAQ,
  deleteFAQ,
};
