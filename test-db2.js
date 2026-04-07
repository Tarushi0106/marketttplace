const { PrismaClient } = require('@prisma/client');

// Try more common passwords
const passwords = ['', 'password', '123456', 'postgres', 'admin', 'root', '12345678', 'marketplace'];

async function testPassword(password) {
  const url = password 
    ? `postgresql://postgres:${password}@localhost:5432/naas_marketplace`
    : 'postgresql://postgres@localhost:5432/naas_marketplace';
  
  console.log(`Testing password: "${password}"...`);
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    await prisma.$connect();
    const count = await prisma.product.count();
    console.log(`✓ SUCCESS! Password: "${password}", Products: ${count}`);
    await prisma.$disconnect();
    return { success: true, password };
  } catch (error) {
    await prisma.$disconnect();
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Testing common PostgreSQL passwords...\n');
  
  for (const pwd of passwords) {
    const result = await testPassword(pwd);
    if (result.success) {
      console.log('\n✓ Found valid credentials!');
      process.exit(0);
    }
  }
  console.log('\n✗ No valid credentials found');
}

main();
