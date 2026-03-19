const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching products from LOCAL database...');
    
    const products = await prisma.product.findMany({
      where: { slug: 'connect-cloud' },
      include: {
        variants: true,
        recurringPrices: true,
        addons: true
      }
    });
    
    console.log('Products found:', products.length);
    products.forEach(p => {
      console.log('\n--- Product ---');
      console.log('Name:', p.name);
      console.log('Slug:', p.slug);
      console.log('Description:', p.description?.substring(0, 100));
      console.log('Base Price:', p.basePrice);
      console.log('Variants:', p.variants.length);
      p.variants.forEach(v => {
        console.log('  -', v.name, '-', v.price);
      });
      console.log('Recurring Prices:', p.recurringPrices.length);
      console.log('Addons:', p.addons.length);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
