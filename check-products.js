const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count();
    console.log('Total products in database:', count);
    
    // Also check products with different statuses
    const activeCount = await prisma.product.count({ where: { status: 'ACTIVE' } });
    const draftCount = await prisma.product.count({ where: { status: 'DRAFT' } });
    console.log('Active products:', activeCount);
    console.log('Draft products:', draftCount);
    
    // Get first few products to see what data looks like
    const products = await prisma.product.findMany({ take: 5 });
    console.log('\nFirst 5 products:');
    products.forEach(p => console.log(`- ${p.name} (status: ${p.status}, sku: ${p.sku})`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
