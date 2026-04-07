import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking variants...');
  
  const products = await prisma.product.findMany({ 
    where: { name: { contains: 'VSaaS' } } 
  });
  console.log('Products with VSaaS:', products.length);
  
  if (products.length > 0) {
    const productId = products[0].id;
    console.log('Product ID:', productId);
    
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: { recurringPrices: true },
      orderBy: { name: 'asc' }
    });
    
    console.log('Variants:');
    for (const v of variants) {
      console.log(`  - ${v.name} | price: ₹${v.price} | recurringPrices: ${v.recurringPrices.length}`);
      for (const rp of v.recurringPrices) {
        console.log(`      monthly: ₹${rp.monthlyPrice}, quarterly: ₹${rp.quarterlyPrice}, semiAnnual: ₹${rp.semiAnnualPrice}, yearly: ₹${rp.yearlyPrice}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
