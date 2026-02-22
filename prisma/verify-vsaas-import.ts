/**
 * Verify VSaaS Cloud Products Import
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying VSaaS Cloud Products import...\n');

  // Count products
  const products = await prisma.product.findMany({
    where: {
      slug: { contains: 'vsaas-' }
    },
    include: {
      category: true,
      subCategory: true,
    }
  });

  console.log(`Found ${products.length} VSaaS products:\n`);
  
  for (const product of products) {
    console.log(`- ${product.name}`);
    console.log(`  Category: ${product.category?.name || 'N/A'}`);
    console.log(`  Subcategory: ${product.subCategory?.name || 'N/A'}`);
    console.log(`  Monthly: ₹${product.monthlyPrice}`);
    console.log(`  Status: ${product.status}`);
    console.log('');
  }

  // Count categories
  const category = await prisma.category.findFirst({
    where: { slug: 'vsaas-cloud' },
    include: {
      subCategories: true,
    }
  });

  if (category) {
    console.log(`\nCategory: ${category.name}`);
    console.log(`Subcategories: ${category.subCategories.length}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
