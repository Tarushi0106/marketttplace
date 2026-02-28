const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        isFeatured: true
      }
    });
    console.log('Products found:', JSON.stringify(products, null, 2));
    
    const totalCount = await prisma.product.count();
    console.log('\nTotal products in database:', totalCount);
    
    const activeCount = await prisma.product.count({
      where: { status: 'ACTIVE' }
    });
    console.log('Active products:', activeCount);
  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
