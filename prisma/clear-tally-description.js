const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { slug: 'tally-on-cloud' },
    data: {
      shortDescription: null,
      description: null
    }
  });
  console.log('Tally on Cloud description cleared!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
