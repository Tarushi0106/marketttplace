const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const v = await prisma.productVariant.findFirst({
    where: { sku: 'VSAAS-CONNECT-CLOUD' },
    include: {
      recurringPrices: true,
      product: {
        include: {
          recurringPrices: true,
        }
      }
    }
  });
  console.log('Variant data:');
  console.log(JSON.stringify(v, null, 2));
  console.log('\nRecurring Prices for variant:');
  console.log(JSON.stringify(v?.recurringPrices, null, 2));
  console.log('\nProduct Recurring Prices:');
  console.log(JSON.stringify(v?.product?.recurringPrices, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
