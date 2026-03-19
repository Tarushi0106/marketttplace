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
    
    console.log('Product ID:', product.id);
    
    // Delete existing Stream OS variants (32, 64, 128)
    const existingVariants = await prisma.productVariant.findMany({
      where: { 
        productId: product.id,
        name: { contains: 'Stream OS' }
      }
    });
    
    console.log('Deleting existing Stream OS variants...');
    for (const v of existingVariants) {
      await prisma.productVariant.delete({ where: { id: v.id } });
      console.log(`Deleted: ${v.name}`);
    }
    
    // Create a single Stream OS variant with all channel options as attributes
    const streamOsVariant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'Stream OS [ 32 | 64 | 128 | 256 ] Capex (One Time)',
        sku: 'VSAAS-ONPREM-STREAM',
        price: 3680, // Base price per camera
        type: 'onprem',
        attributes: {
          channels: [
            { label: '32 Channel', value: '32', maxCameras: 32 },
            { label: '64 Channel', value: '64', maxCameras: 64 },
            { label: '128 Channel', value: '128', maxCameras: 128 },
            { label: '256 Channel', value: '256', maxCameras: 256 }
          ]
        },
        sortOrder: 1,
        isDefault: true
      }
    });
    
    console.log('Created variant:', streamOsVariant.name);
    
    // Verify the variants
    console.log('\n--- All Variants ---');
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    });
    
    variants.forEach(v => {
      console.log(`${v.id.substring(0,8)} | ${v.name} | type:${v.type} | ₹${v.price}`);
    });
    
    console.log('\nDone!');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
