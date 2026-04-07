const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: 'vsaas' },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        },
        addons: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log('Product:', product?.name);
    console.log('\n--- VARIANTS ---');
    product?.variants.forEach(v => {
      console.log(`${v.id.substring(0,8)} | ${v.name} | type:${v.type} | ₹${v.price}`);
    });
    
    console.log('\n--- ON-PREMISE ADDONS ---');
    product?.addons
      .filter(a => a.group && a.group.includes('On-Premise'))
      .forEach(a => {
        console.log(`${a.id.substring(0,8)} | ${a.name} | ${a.group} | ₹${a.price}`);
      });
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
