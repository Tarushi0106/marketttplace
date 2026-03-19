const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding minQuantity and maxQuantity columns to local database...');

  try {
    // Add minQuantity column to products table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "minQuantity" INTEGER DEFAULT 1;
    `;
    console.log('Added minQuantity column');

    // Add maxQuantity column to products table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER;
    `;
    console.log('Added maxQuantity column');
    
    // Also add to product_variants table
    await prisma.$executeRaw`
      ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS "minQuantity" INTEGER DEFAULT 1;
    `;
    console.log('Added minQuantity column to product_variants');
    
    await prisma.$executeRaw`
      ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER;
    `;
    console.log('Added maxQuantity column to product_variants');

    console.log('\nDone! Columns added successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
