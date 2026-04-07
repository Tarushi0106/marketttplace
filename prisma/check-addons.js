const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' }
  }
});

async function main() {
  let output = '';
  
  const product = await prisma.product.findFirst({ where: { slug: 'vsaas' } });
  if (!product) { 
    output += 'Product not found\n';
  } else {
    output += 'Product: ' + product.name + '\n';
    
    const addons = await prisma.productAddon.findMany({ where: { productId: product.id } });
    output += 'Addons count: ' + addons.length + '\n';
    output += 'Addons:\n';
    addons.forEach(a => {
      output += '- ' + a.name + ' | Group: ' + (a.group || 'none') + ' | Price: ' + a.price + '\n';
    });
  }
  
  fs.writeFileSync('prisma/addons-check.txt', output);
  console.log('Done');
}

main().finally(() => prisma.$disconnect());
