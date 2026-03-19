import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  console.log('Product status counts:');
  products.forEach((p) => {
    console.log(`  ${p.status}: ${p._count.id} products`);
  });

  const total = await prisma.product.count();
  console.log(`\nTotal products: ${total}`);

  // Show first 5 products
  const sampleProducts = await prisma.product.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
    },
  });
  console.log('\nSample products:');
  sampleProducts.forEach((p) => {
    console.log(`  - ${p.name} (${p.status})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
