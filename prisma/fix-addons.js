const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' }
  }
});

async function main() {
  const product = await prisma.product.findFirst({ where: { slug: 'vsaas' } });
  if (!product) { console.log('Product not found'); return; }
  
  console.log('Deleting all existing addons...');
  await prisma.productAddon.deleteMany({ where: { productId: product.id } });
  
  console.log('Adding new Cloud addons (no emojis)...');
  const cloudAddons = [
    { name: 'Cloud Storage - 4 Days (Total 7 Days)', group: 'Cloud - Storage', price: 138, unit: 'per month', sortOrder: 0 },
    { name: 'Cloud Storage - 27 Days (Total 30 Days)', group: 'Cloud - Storage', price: 391, unit: 'per month', sortOrder: 1 },
    { name: 'Cloud Storage - 87 Days (Total 90 Days)', group: 'Cloud - Storage', price: 920, unit: 'per month', sortOrder: 2 },
    { name: 'Cloud Storage - 177 Days (Total 180 Days)', group: 'Cloud - Storage', price: 1702, unit: 'per month', sortOrder: 3 },
    { name: 'Cloud Storage - 362 Days (Total 365 Days)', group: 'Cloud - Storage', price: 3312, unit: 'per month', sortOrder: 4 },
    { name: 'Core Desktop Application License', group: 'Cloud - Platform', price: 6578, unit: 'per license', sortOrder: 5 },
    { name: 'Web User License', group: 'Cloud - Platform', price: 69, unit: 'per user', sortOrder: 6 },
    { name: 'Mobile User License', group: 'Cloud - Platform', price: 69, unit: 'per user', sortOrder: 7 },
    { name: 'Intrusion Detection', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 8 },
    { name: 'Zone Monitoring', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 9 },
    { name: 'Camera Sabotage', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 10 },
    { name: 'Activity Detection', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 11 },
    { name: 'Trespassing Detection', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 12 },
    { name: 'Perimeter Fence Jumping', group: 'Cloud - AI Security', price: 161, unit: 'per month', sortOrder: 13 },
    { name: 'Double Line Crossing', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 14 },
    { name: 'Loitering Detection', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 15 },
    { name: 'Overcrowding Detection', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 16 },
    { name: 'People Counting', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 17 },
    { name: 'Missing Staff Detection', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 18 },
    { name: 'Occupancy Statistics', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 19 },
    { name: 'Queue Management', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 20 },
    { name: 'Heatmap Analysis', group: 'Cloud - AI Business', price: 782, unit: 'per month', sortOrder: 21 },
    { name: 'PPE/Safety Kit Detection', group: 'Cloud - AI Safety', price: 920, unit: 'per month', sortOrder: 22 },
    { name: 'Smoke & Fire Detection', group: 'Cloud - AI Safety', price: 920, unit: 'per month', sortOrder: 23 },
    { name: 'Person of Interest (Appearance Search)', group: 'Cloud - AI Investigation', price: 1242, unit: 'per month', sortOrder: 24 },
    { name: 'Vehicle of Interest (Color & Type Search)', group: 'Cloud - AI Investigation', price: 1242, unit: 'per month', sortOrder: 25 },
    { name: 'ANPR (Automatic Number Plate Recognition)', group: 'Cloud - AI Investigation', price: 2231, unit: 'per month', sortOrder: 26 },
    { name: 'Facial Recognition (Up to 50 POI)', group: 'Cloud - AI Investigation', price: 3312, unit: 'per month', sortOrder: 27 },
    { name: 'Setup & Implementation', group: 'Cloud - One Time', price: 9999, unit: 'one-time', sortOrder: 28 },
  ];
  
  for (const addon of cloudAddons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        group: addon.group,
        price: addon.price,
        unit: addon.unit,
        pricingType: addon.unit === 'one-time' ? 'ONE_TIME' : 'RECURRING_MONTHLY',
        isActive: true,
        sortOrder: addon.sortOrder
      }
    });
    console.log('Added Cloud: ' + addon.name);
  }
  
  console.log('Adding Stream OS On-Premise addon...');
  await prisma.productAddon.create({
    data: {
      productId: product.id,
      name: 'Stream OS',
      group: 'On-Premise',
      price: 3680,
      unit: 'per camera',
      description: 'Stream OS License (32/64/128/256 channels)',
      pricingType: 'ONE_TIME',
      isActive: true,
      sortOrder: 29
    }
  });
  console.log('Added: Stream OS');
  
  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
