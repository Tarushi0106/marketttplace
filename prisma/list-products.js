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
    console.log('Fetching all products from production database...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        basePrice: true,
        _count: {
          select: {
            variants: true,
            addons: true
          }
        }
      }
    });
    
    console.log('\n=== Products in Production Database ===');
    console.log('Total:', products.length);
    products.forEach(p => {
      console.log(`\n- ${p.name} (${p.slug})`);
      console.log(`  Status: ${p.status}, Price: ${p.basePrice}`);
      console.log(`  Variants: ${p._count.variants}, Addons: ${p._count.addons}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
