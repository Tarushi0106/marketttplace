const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

// Correct prices from Excel (Monthly prices in INR)
const CORRECT_PRICES = {
  'Cloud Storage - 4 Days (Total 7 Days)': 138,
  'Cloud Storage - 27 Days (Total 30 Days)': 391,
  'Cloud Storage - 87 Days (Total 90 Days)': 782,
  'Cloud Storage - 177 Days (Total 180 Days)': 1702,
  'Cloud Storage - 362 Days (Total 365 Days)': 3312,
  'Core Desktop Application License': 6578,
  'Web User License': 69,
  'Mobile User License': 69,
  'Intrusion Detection': 161,
  'Zone Monitoring': 161,
  'Camera Sabotage': 161,
  'Activity Detection': 161,
  'Trespassing Detection': 161,
  'Perimeter Fence Jumping': 161,
  'Double Line Crossing': 782,
  'Loitering Detection': 782,
  'Overcrowding Detection': 782,
  'People Counting': 782,
  'Missing Staff Detection': 782,
  'Occupancy Statistics': 782,
  'Queue Management': 782,
  'Heatmap Analysis': 782,
  'PPE/Safety Kit Detection': 920,
  'Smoke & Fire Detection': 920,
  'Person of Interest (Appearance Search)': 1242,
  'Vehicle of Interest (Color & Type Search)': 1242,
  'ANPR (Automatic Number Plate Recognition)': 2231,
  'Facial Recognition (Up to 50 POI)': 3312,
  'Setup & Implementation': 9999,
};

async function main() {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: 'vsaas' }
    });
    
    if (!product) {
      console.log('Product not found');
      return;
    }
    
    console.log('Found product:', product.name);
    
    const addons = await prisma.productAddon.findMany({
      where: { productId: product.id }
    });
    
    console.log('Found', addons.length, 'addons');
    
    // Update prices
    let updated = 0;
    for (const addon of addons) {
      const correctPrice = CORRECT_PRICES[addon.name];
      if (correctPrice !== undefined && addon.price !== correctPrice) {
        await prisma.productAddon.update({
          where: { id: addon.id },
          data: { price: correctPrice }
        });
        console.log(`Updated: ${addon.name} - ${addon.price} -> ${correctPrice}`);
        updated++;
      }
    }
    
    console.log('\nTotal updated:', updated);
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
