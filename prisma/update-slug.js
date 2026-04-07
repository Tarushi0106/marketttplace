const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' }
  }
});

async function main() {
  let output = '';
  
  try {
    // Find the connect-cloud product
    const product = await prisma.product.findFirst({ where: { slug: 'connect-cloud' } });
    output += 'Found product: ' + JSON.stringify(product) + '\n';
    
    if (product) {
      // Update slug to 'vsaas' 
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: 'vsaas' }
      });
      output += 'Updated slug from connect-cloud to vsaas\n';
      
      const updated = await prisma.product.findFirst({ where: { slug: 'vsaas' } });
      output += 'Updated product: ' + JSON.stringify(updated) + '\n';
    } else {
      output += 'Product not found\n';
    }
  } catch(e) {
    output += 'Error: ' + e.message + '\n';
  }
  
  fs.writeFileSync('prisma/slug-update.txt', output);
  console.log('Done');
}

main().finally(() => prisma.$disconnect());
