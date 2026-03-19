const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    }
  });

  try {
    console.log('Adding minQuantity and maxQuantity columns to products table...');
    
    await prisma.$queryRaw`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "minQuantity" INTEGER NOT NULL DEFAULT 1
    `;
    console.log('✓ Added minQuantity to products table');
    
    await prisma.$queryRaw`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER
    `;
    console.log('✓ Added maxQuantity to products table');
    
    console.log('Adding minQuantity and maxQuantity columns to product_variants table...');
    
    await prisma.$queryRaw`
      ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "minQuantity" INTEGER NOT NULL DEFAULT 1
    `;
    console.log('✓ Added minQuantity to product_variants table');
    
    await prisma.$queryRaw`
      ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER
    `;
    console.log('✓ Added maxQuantity to product_variants table');
    
    console.log('\nAll columns added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
