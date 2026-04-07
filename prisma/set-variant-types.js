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
    
    if (!product) {
      console.log('VSAAS product not found!');
      return;
    }
    
    // Get all variants
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id }
    });
    
    console.log('Setting variant types...');
    
    for (const variant of variants) {
      let type = 'cloud'; // default
      
      if (variant.name.includes('Stream OS - 32') || 
          variant.name.includes('Stream OS - 64') || 
          variant.name.includes('Stream OS - 128')) {
        type = 'onprem';
      }
      
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { type: type }
      });
      
      console.log(`Updated: ${variant.name} → ${type}`);
    }
    
    console.log('\nDone!');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
