#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Adhigam NGO Website Setup');
console.log('=============================\n');

// Check if .env exists
if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists. Skipping environment setup.');
} else {
    console.log('📝 Setting up environment variables...');
    
    // Create .env file from template
    const envTemplate = `# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=${generateRandomString(32)}
SESSION_SECRET=${generateRandomString(32)}

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Database Configuration
DB_PATH=./database/adhigam.db

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@adhigam.org

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PASSWORD_SALT_ROUNDS=12

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://your-domain.com
`;

    fs.writeFileSync('.env', envTemplate);
    console.log('✅ .env file created with secure defaults');
}

// Create database directory
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Database directory created');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('\n📦 Installing dependencies...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

// Check if public directory exists
if (!fs.existsSync('public')) {
    console.log('❌ Public directory not found. Please ensure all frontend files are in the public/ directory.');
    process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your Razorpay API keys in .env file');
console.log('2. Customize the admin credentials in .env file');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Access the website at http://localhost:3000');
console.log('5. Admin panel: Click the gear icon (⚙️) in bottom-right corner');
console.log('6. Default admin credentials: admin/admin123');

console.log('\n🔒 Security Notes:');
console.log('- Change default admin password in production');
console.log('- Update JWT_SECRET and SESSION_SECRET for production');
console.log('- Configure proper CORS settings for your domain');
console.log('- Set up SSL certificate for production deployment');

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

rl.close(); 