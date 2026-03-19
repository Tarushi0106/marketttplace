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
  let output = '';
  
  try {
    const count = await prisma.product.count();
    output += 'Product count: ' + count + '\n';
    
    const products = await prisma.product.findMany({
      take: 10,
      select: { id: true, name: true, slug: true }
    });
    output += 'Products: ' + JSON.stringify(products, null, 2) + '\n';
    
    // Find connect-cloud product
    const product = await prisma.product.findFirst({
      where: { slug: 'connect-cloud' }
    });
    output += 'Connect Cloud product: ' + JSON.stringify(product, null, 2) + '\n';
    
    if (product) {
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
        orderBy: { sortOrder: 'asc' }
      });
      output += 'Variants count: ' + variants.length + '\n';
      output += 'Variants: ' + JSON.stringify(variants, null, 2) + '\n';
    }
  } catch(e) {
    output += 'Error: ' + e.message + '\n';
    output += e.stack + '\n';
  }
  
  fs.writeFileSync('prisma/db-check-output.txt', output);
  console.log('Done');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
