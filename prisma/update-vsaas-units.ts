import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating VSaaS addon units...');

  // Update Connect Cloud addons with "per camera" unit
  const connectCloudAddons = await prisma.productAddon.findMany({
    where: {
      name: { contains: 'Connect Cloud', mode: 'insensitive' }
    }
  });

  for (const addon of connectCloudAddons) {
    await prisma.productAddon.update({
      where: { id: addon.id },
      data: { unit: 'per camera' }
    });
    console.log(`Updated addon ${addon.name} with unit "per camera"`);
  }

  // Update Cloud Gateway addons with "Capex (One Time)" unit
  const gatewayAddons = await prisma.productAddon.findMany({
    where: {
      name: { contains: 'Cloud Gateway', mode: 'insensitive' }
    }
  });

  for (const addon of gatewayAddons) {
    await prisma.productAddon.update({
      where: { id: addon.id },
      data: { unit: 'Capex (One Time)' }
    });
    console.log(`Updated addon ${addon.name} with unit "Capex (One Time)"`);
  }

  // Update AI Features addons with "per camera" unit
  const aiAddons = await prisma.productAddon.findMany({
    where: {
      OR: [
        { name: { contains: 'Intrusion', mode: 'insensitive' } },
        { name: { contains: 'Zone Monitoring', mode: 'insensitive' } },
        { name: { contains: 'Camera Sabotage', mode: 'insensitive' } },
        { name: { contains: 'Activity Detection', mode: 'insensitive' } },
        { name: { contains: 'Trespassing', mode: 'insensitive' } },
        { name: { contains: 'Perimeter Fence', mode: 'insensitive' } },
        { name: { contains: 'Double Line', mode: 'insensitive' } },
        { name: { contains: 'Loitering', mode: 'insensitive' } },
        { name: { contains: 'Overcrowding', mode: 'insensitive' } },
        { name: { contains: 'People Counting', mode: 'insensitive' } },
        { name: { contains: 'Missing Staff', mode: 'insensitive' } },
        { name: { contains: 'Occupancy', mode: 'insensitive' } },
        { name: { contains: 'Queue Management', mode: 'insensitive' } },
        { name: { contains: 'Heatmap', mode: 'insensitive' } },
        { name: { contains: 'PPE', mode: 'insensitive' } },
        { name: { contains: 'Smoke', mode: 'insensitive' } },
        { name: { contains: 'Fire Detection', mode: 'insensitive' } },
        { name: { contains: 'Person of Interest', mode: 'insensitive' } },
        { name: { contains: 'Vehicle of Interest', mode: 'insensitive' } },
        { name: { contains: 'ANPR', mode: 'insensitive' } },
        { name: { contains: 'Facial Recognition', mode: 'insensitive' } }
      ]
    }
  });

  for (const addon of aiAddons) {
    await prisma.productAddon.update({
      where: { id: addon.id },
      data: { unit: 'per camera' }
    });
    console.log(`Updated addon ${addon.name} with unit "per camera"`);
  }

  // Update Platform Add Ons with "per user" unit
  const platformAddons = await prisma.productAddon.findMany({
    where: {
      OR: [
        { name: { contains: 'Core Desktop', mode: 'insensitive' } },
        { name: { contains: 'Web User', mode: 'insensitive' } },
        { name: { contains: 'Mobile User', mode: 'insensitive' } }
      ]
    }
  });

  for (const addon of platformAddons) {
    await prisma.productAddon.update({
      where: { id: addon.id },
      data: { unit: 'per user' }
    });
    console.log(`Updated addon ${addon.name} with unit "per user"`);
  }

  // Update Cloud Storage addons with "per camera" unit
  const storageAddons = await prisma.productAddon.findMany({
    where: {
      OR: [
        { name: { contains: 'Cloud Storage', mode: 'insensitive' } },
        { name: { contains: 'Days', mode: 'insensitive' } }
      ],
      product: {
        slug: { contains: 'vsaas', mode: 'insensitive' }
      }
    }
  });

  for (const addon of storageAddons) {
    await prisma.productAddon.update({
      where: { id: addon.id },
      data: { unit: 'per camera' }
    });
    console.log(`Updated addon ${addon.name} with unit "per camera"`);
  }

  console.log('Done updating VSaaS addon units!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
