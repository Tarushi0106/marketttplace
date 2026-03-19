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
    console.log('Searching for exact slug match...');
    
    // Search for exact slug match
    const products = await prisma.product.findMany({
      where: {
        slug: {
          in: ['connect-cloud', 'connect-cloud-archived']
        }
      },
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
    
    console.log('\n=== Products with exact slug match ===');
    console.log('Total:', products.length);
    products.forEach(p => {
      console.log(`\n- ${p.name} (${p.slug})`);
      console.log(`  Status: ${p.status}, Price: ${p.basePrice}`);
      console.log(`  Variants: ${p._count.variants}, Addons: ${p._count.addons}`);
    });

    // Also list all products with their full slugs
    console.log('\n=== All Product Slugs ===');
    const allProducts = await prisma.product.findMany({
      select: {
        name: true,
        slug: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    allProducts.forEach(p => {
      console.log(`${p.name} -> ${p.slug} (${p.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
