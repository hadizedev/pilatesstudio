/**
 * Utility script untuk generate password hash menggunakan bcrypt
 * 
 * Cara menggunakan:
 * node utils/hashPassword.js yourpassword
 */

const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
    console.error('❌ Error: Password harus disediakan');
    console.log('\n📖 Usage: node utils/hashPassword.js yourpassword\n');
    process.exit(1);
}

// Generate hash
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('❌ Error generating hash:', err);
        process.exit(1);
    }
    
    console.log('\n✅ Password berhasil di-hash!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Original Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Hashed Password:');
    console.log(hash);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Copy hash di atas dan paste ke kolom "password" di Google Sheets');
    console.log('\n');
});
