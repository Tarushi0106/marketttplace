const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  let output = '';
  
  try {
    const count = await prisma.product.count();
    output += 'Product count: ' + count + '\n';
    
    const products = await prisma.product.findMany({
      take: 20,
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
      
      const addons = await prisma.productAddon.findMany({
        where: { productId: product.id }
      });
      output += 'Addons count: ' + addons.length + '\n';
    }
  } catch(e) {
    output += 'Error: ' + e.message + '\n';
  }
  
  fs.writeFileSync('prisma/local-db-check.txt', output);
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
