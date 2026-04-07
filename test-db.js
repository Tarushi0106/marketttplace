const { PrismaClient } = require('@prisma/client');

// Try different connection strings
const connectionStrings = [
  'postgresql://postgres:postgres@localhost:5432/naas_marketplace',
  'postgresql://postgres@localhost:5432/naas_marketplace',
  'postgresql://postgres:password@localhost:5432/naas_marketplace',
  'postgresql://postgres:12345678@localhost:5432/naas_marketplace',
];

async function testConnection(url, label) {
  console.log(`\n--- Testing: ${label} ---`);
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    await prisma.$connect();
    const count = await prisma.product.count();
    console.log(`✓ Connected! Products: ${count}`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('Testing database connections...');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], `Option ${i+1}`);
    if (success) {
      console.log('\n✓ Found working connection!');
      break;
    }
  }
}

main();
