/**
 * Test Google Sheets Connection
 * 
 * Jalankan dengan: node test-sheets.js
 */

const googleSheets = require('./utils/googleSheets');

console.log('🧪 Testing Google Sheets Connection...\n');

async function testConnection() {
  try {
    console.log('📊 Fetching all homepage data...');
    const data = await googleSheets.getAllHomepageData();
    
    console.log('\n✅ Connection successful!\n');
    console.log('📋 Data Summary:');
    console.log('================');
    console.log(`Banner: ${data.banner ? '✓' : '✗'}`);
    console.log(`About: ${data.about ? '✓' : '✗'}`);
    console.log(`Teachers: ${data.teachers ? data.teachers.length + ' items' : '✗'}`);
    console.log(`Testimonials: ${data.testimonials ? data.testimonials.length + ' items' : '✗'}`);
    console.log(`Classes: ${data.classes ? data.classes.length + ' items' : '✗'}`);
    console.log(`Contact: ${data.contact ? '✓' : '✗'}`);
    console.log(`FAQ: ${data.faq ? data.faq.length + ' items' : '✗'}`);
    console.log(`Colors: ${Object.keys(data.colors).length} sections`);
    console.log(`Section Settings: ${Object.keys(data.sectionSettings).length} sections`);
    
    console.log('\n📄 Sample Data:');
    console.log('================');
    
    if (data.banner) {
      console.log('\n🎯 Banner:');
      console.log(`  Title: ${data.banner.title_line1} ${data.banner.title_line2}`);
      console.log(`  Subtitle: ${data.banner.subtitle}`);
    }
    
    if (data.teachers && data.teachers.length > 0) {
      console.log('\n👨‍🏫 Teachers:');
      data.teachers.forEach((teacher, index) => {
        console.log(`  ${index + 1}. ${teacher.name} - ${teacher.position}`);
      });
    }
    
    if (data.classes && data.classes.length > 0) {
      console.log('\n🏋️ Classes:');
      data.classes.forEach((classItem, index) => {
        console.log(`  ${index + 1}. ${classItem.class_name}`);
      });
    }
    
    console.log('\n✨ All tests passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Test API: http://localhost:3001/api/homepage');
    console.log('   3. View homepage: http://localhost:3001/');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if SPREADSHEET_ID is set correctly in utils/googleSheets.js');
    console.error('   2. Verify spreadsheet is shared with service account:');
    console.error('      pilatestudiostella@pilatestudio-stella.iam.gserviceaccount.com');
    console.error('   3. Ensure all required sheets exist with correct names');
    console.error('   4. Check credentials.json file exists');
    console.error('\n📚 See HOMEPAGE_QUICK_START.md for setup guide');
    process.exit(1);
  }
}

testConnection();
