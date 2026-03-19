const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  console.log('Exporting all products from production database...');
  
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      addons: true,
      category: true,
      subCategory: true
    }
  });
  
  console.log(`Found ${products.length} products`);
  
  // Save to file
  fs.writeFileSync('prisma/exported-all-products.json', JSON.stringify(products, null, 2));
  console.log('Exported to prisma/exported-all-products.json');
  
  // Also list just product names and slugs
  const summary = products.map(p => ({
    name: p.name,
    slug: p.slug,
    variantsCount: p.variants.length,
    addonsCount: p.addons.length
  }));
  
  fs.writeFileSync('prisma/products-summary.json', JSON.stringify(summary, null, 2));
  console.log('Summary saved to prisma/products-summary.json');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
