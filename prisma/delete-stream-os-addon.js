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
      where: { slug: 'vsaas' }
    });
    
    // Find all addons with name 'Stream OS'
    const addons = await prisma.productAddon.findMany({
      where: { 
        productId: product.id,
        name: 'Stream OS'
      }
    });
    
    console.log('Found Stream OS addons:', addons.length);
    
    for (const addon of addons) {
      console.log('Deleting:', addon.id, '-', addon.name);
      await prisma.productAddon.delete({ where: { id: addon.id } });
      console.log('Deleted!');
    }
    
    console.log('\nDone!');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
