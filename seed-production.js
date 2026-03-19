/**
 * Script to seed production database via API
 * Run: node seed-production.js
 * 
 * This calls the /api/admin/seed endpoint with products from exported-data.json
 */

const fs = require('fs');
const path = require('path');

// Your production URL
const PRODUCTION_URL = 'https://developer.d28fa2102uro78.amplifyapp.com';

async function seedProduction() {
  console.log('🌱 Starting seed to production...\n');

  // Read exported data
  const exportPath = path.join(__dirname, 'exported-data.json');
  if (!fs.existsSync(exportPath)) {
    console.error('❌ exported-data.json not found!');
    console.log('   Run: node prisma/export-products.js');
    return;
  }

  const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  
  console.log(`📦 Found ${exportData.products.length} products in exported-data.json`);
  console.log(`📂 Found ${exportData.categories.length} categories\n`);

  // First, login to get session cookie
  console.log('🔐 Logging in to production admin...');
  
  const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@shaurryatele.com',
      password: 'admin@123',
    }),
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed!');
    console.log('   Make sure you have admin credentials');
    console.log('   Default: admin@shaurryatele.com / admin@123');
    return;
  }

  // Get cookies from login
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('✅ Logged in successfully\n');

  // Now call the seed endpoint with cookies
  console.log('📥 Importing products to production...');
  
  const seedResponse = await fetch(`${PRODUCTION_URL}/api/admin/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies || '',
    },
    body: JSON.stringify({
      products: exportData.products,
    }),
  });

  const result = await seedResponse.json();
  
  if (seedResponse.ok) {
    console.log('✅ Seed successful!');
    console.log(`   Created: ${result.results?.created || 0} products`);
    console.log(`   Updated: ${result.results?.updated || 0} products`);
  } else {
    console.error('❌ Seed failed:', result.error);
    console.error('   ', result.message);
  }
}

seedProduction().catch(console.error);
