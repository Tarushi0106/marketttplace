const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: {
      name: { contains: 'Gateway', mode: 'insensitive' }
    },
    include: {
      recurringPrices: true
    }
  });
  console.log(JSON.stringify(variants, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
