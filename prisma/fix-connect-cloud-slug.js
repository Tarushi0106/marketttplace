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
    console.log('Finding and fixing connect-cloud product...');
    
    // Find the archived product
    const product = await prisma.product.findFirst({
      where: {
        slug: 'connect-cloud-archived'
      }
    });
    
    if (!product) {
      console.log('Product not found!');
      return;
    }
    
    console.log(`Found product: ${product.name} (${product.slug})`);
    
    // Update the slug and status
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        slug: 'connect-cloud',
        status: 'ACTIVE'
      }
    });
    
    console.log(`Updated product: ${updated.name} (${updated.slug}) - Status: ${updated.status}`);
    console.log('\nDone! The product should now be accessible at /products/connect-cloud');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
