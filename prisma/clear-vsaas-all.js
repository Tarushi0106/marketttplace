const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { slug: 'vsaas' },
    data: {
      shortDescription: null,
      description: null
    }
  });
  console.log('VSAAS description cleared!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
