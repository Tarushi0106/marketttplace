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
  const variants = await prisma.productVariant.findMany({ 
    where: { productId: product.id },
    orderBy: { name: 'asc' }
  });
  
  output += 'Total variants: ' + variants.length + '\n\n';
  variants.forEach(v => {
    output += v.id + ' | ' + v.name + ' | type: ' + v.type + ' | attrs.type: ' + (v.attributes?.type || 'none') + '\n';
  });
  
  fs.writeFileSync('prisma/variants-check.txt', output);
  console.log('Done');
}

main().finally(() => prisma.$disconnect());
