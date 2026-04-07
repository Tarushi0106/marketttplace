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
    console.log('Checking recurring prices for connect-cloud product...');
    
    // Find the product
    const product = await prisma.product.findFirst({
      where: {
        slug: 'connect-cloud'
      },
      include: {
        variants: true,
        recurringPrices: true,
        addons: true
      }
    });
    
    if (!product) {
      console.log('Product not found!');
      return;
    }
    
    console.log(`\nProduct: ${product.name} (${product.slug})`);
    console.log(`Status: ${product.status}`);
    console.log(`Base Price: ${product.basePrice}`);
    
    console.log(`\nVariants (${product.variants.length}):`);
    product.variants.forEach(v => {
      console.log(`  - ${v.name}: ${v.price}`);
    });
    
    console.log(`\nRecurring Prices (${product.recurringPrices.length}):`);
    product.recurringPrices.forEach(rp => {
      console.log(`  - Monthly: ${rp.monthlyPrice}, Quarterly: ${rp.quarterlyPrice}, Yearly: ${rp.yearlyPrice}`);
    });
    
    console.log(`\nAddons (${product.addons.length}):`);
    console.log('  (showing first 5)');
    product.addons.slice(0, 5).forEach(a => {
      console.log(`  - ${a.name}: ${a.price}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
