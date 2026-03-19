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
    
    const addons = await prisma.productAddon.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('All addons:');
    addons.forEach(a => console.log(`${a.id} | ${a.name} | ${a.group || 'null'}`));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
