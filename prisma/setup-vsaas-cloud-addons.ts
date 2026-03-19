import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up VSAAS Cloud addons linked to variants...');

  // Find VSAAS product
  const vsaasProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
  });

  if (!vsaasProduct) {
    console.error('VSAAS product not found!');
    return;
  }

  console.log(`Found VSAAS product: ${vsaasProduct.id}`);

  // Find the Cloud and On-Premise variants
  const cloudVariant = await prisma.productVariant.findFirst({
    where: {
      productId: vsaasProduct.id,
      OR: [
        { name: { contains: 'Cloud', mode: 'insensitive' } },
        { sku: { contains: 'CLOUD', mode: 'insensitive' } },
      ],
    },
  });

  const onPremiseVariant = await prisma.productVariant.findFirst({
    where: {
      productId: vsaasProduct.id,
      OR: [
        { name: { contains: 'On-Premise', mode: 'insensitive' } },
        { name: { contains: 'On Premise', mode: 'insensitive' } },
        { sku: { contains: 'ONPREM', mode: 'insensitive' } },
      ],
    },
  });

  if (!cloudVariant || !onPremiseVariant) {
    console.error('Cloud or On-Premise variant not found!');
    console.log('Cloud variant:', cloudVariant);
    console.log('On-Premise variant:', onPremiseVariant);
    return;
  }

  console.log(`Cloud variant: ${cloudVariant.id} (${cloudVariant.name})`);
  console.log(`On-Premise variant: ${onPremiseVariant.id} (${onPremiseVariant.name})`);

  // Delete existing addons for VSAAS
  await prisma.productAddon.deleteMany({
    where: { productId: vsaasProduct.id },
  });
  console.log('Deleted existing addons');

  // ===== CLOUD ADDONS (linked to cloudVariant) =====
  
  // Cloud Storage Plans
  const storagePlans = [
    { name: 'Cloud Storage - 4 Days', price: 1.50, unit: 'per camera/month', description: '4 Days Cloud Storage (in addition to 3 days built-in)' },
    { name: 'Cloud Storage - 27 Days', price: 4.25, unit: 'per camera/month', description: '27 Days Total Cloud Storage' },
    { name: 'Cloud Storage - 87 Days', price: 10.00, unit: 'per camera/month', description: '87 Days Total Cloud Storage' },
    { name: 'Cloud Storage - 177 Days', price: 18.50, unit: 'per camera/month', description: '177 Days Total Cloud Storage' },
    { name: 'Cloud Storage - 362 Days', price: 36.00, unit: 'per camera/month', description: '362 Days Total Cloud Storage' },
  ];

  for (let i = 0; i < storagePlans.length; i++) {
    const plan = storagePlans[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: cloudVariant.id, // Link to Cloud variant
        name: plan.name,
        description: plan.description,
        price: plan.price,
        unit: plan.unit,
        pricingType: 'MONTHLY',
        sortOrder: 100 + i,
        isActive: true,
        group: 'Cloud Storage',
      },
    });
  }
  console.log('Created Cloud Storage addons (linked to Cloud variant)');

  // Platform Add-ons
  const platformAddons = [
    { name: 'Core Desktop Application License', price: 71.50, unit: 'per user/month', description: 'Desktop application license for advanced features' },
    { name: 'Web User License', price: 0.75, unit: 'per user/month', description: 'Web browser access license' },
    { name: 'Mobile User License', price: 0.75, unit: 'per user/month', description: 'Mobile app access license (Android & iOS)' },
  ];

  for (let i = 0; i < platformAddons.length; i++) {
    const addon = platformAddons[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: cloudVariant.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        unit: addon.unit,
        pricingType: 'MONTHLY',
        sortOrder: 200 + i,
        isActive: true,
        group: 'Platform Add-ons',
      },
    });
  }
  console.log('Created Platform Add-ons (linked to Cloud variant)');

  // Security AI
  const securityAI = [
    { name: 'AI - Intrusion Detection', price: 1.75, unit: 'per camera/month' },
    { name: 'AI - Zone Monitoring', price: 1.75, unit: 'per camera/month' },
    { name: 'AI - Camera Sabotage', price: 1.75, unit: 'per camera/month' },
    { name: 'AI - Activity Detection', price: 1.75, unit: 'per camera/month' },
    { name: 'AI - Trespassing', price: 1.75, unit: 'per camera/month' },
    { name: 'AI - Perimeter Fence Jumping', price: 1.75, unit: 'per camera/month' },
  ];

  for (let i = 0; i < securityAI.length; i++) {
    const ai = securityAI[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: cloudVariant.id,
        name: ai.name,
        description: `Security Essentials AI - ${ai.name.replace('AI - ', '')}`,
        price: ai.price,
        unit: ai.unit,
        pricingType: 'MONTHLY',
        sortOrder: 300 + i,
        isActive: true,
        group: 'AI Features - Security',
      },
    });
  }
  console.log('Created Security AI addons');

  // Business AI
  const businessAI = [
    { name: 'AI - Double Line Crossing', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Loitering', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Overcrowding', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - People Counting', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Missing Staff', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Occupancy Statistics', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Queue Management', price: 8.50, unit: 'per camera/month' },
    { name: 'AI - Heatmap', price: 8.50, unit: 'per camera/month' },
  ];

  for (let i = 0; i < businessAI.length; i++) {
    const ai = businessAI[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: cloudVariant.id,
        name: ai.name,
        description: `Business Efficiency AI - ${ai.name.replace('AI - ', '')}`,
        price: ai.price,
        unit: ai.unit,
        pricingType: 'MONTHLY',
        sortOrder: 400 + i,
        isActive: true,
        group: 'AI Features - Business',
      },
    });
  }
  console.log('Created Business AI addons');

  // Safety & Investigation AI
  const safetyAI = [
    { name: 'AI - PPE/Safety Kit Detection', price: 10.00, unit: 'per camera/month', group: 'AI Features - Safety' },
    { name: 'AI - Smoke & Fire Detection', price: 10.00, unit: 'per camera/month', group: 'AI Features - Safety' },
    { name: 'AI - Person of Interest', price: 13.50, unit: 'per camera/month', group: 'AI Features - Investigation' },
    { name: 'AI - Vehicle of Interest', price: 13.50, unit: 'per camera/month', group: 'AI Features - Investigation' },
    { name: 'AI - ANPR (Number Plate)', price: 24.25, unit: 'per camera/month', group: 'AI Features - Investigation' },
    { name: 'AI - Facial Recognition', price: 36.00, unit: 'per camera/month', group: 'AI Features - Investigation' },
  ];

  for (let i = 0; i < safetyAI.length; i++) {
    const ai = safetyAI[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: cloudVariant.id,
        name: ai.name,
        description: `${ai.name} - Advanced AI analytics`,
        price: ai.price,
        unit: ai.unit,
        pricingType: 'MONTHLY',
        sortOrder: 500 + i,
        isActive: true,
        group: ai.group,
      },
    });
  }
  console.log('Created Safety & Investigation AI addons');

  // One-time Setup
  await prisma.productAddon.create({
    data: {
      productId: vsaasProduct.id,
      variantId: cloudVariant.id,
      name: 'One-time Setup & Implementation',
      description: 'One-time setup and implementation service',
      price: 9999,
      unit: 'one-time',
      pricingType: 'ONE_TIME',
      sortOrder: 999,
      isActive: true,
      group: 'One-time Costs',
    },
  });
  console.log('Created Setup addon');

  // ===== ON-PREMISE ADDONS =====
  
  // On-Premise specific addons (linked to onPremiseVariant)
  
  // Stream OS Licenses
  const streamOSPlans = [
    { name: 'Stream OS - 32 Channels', price: 40, unit: 'per camera/one-time', description: 'Connects up to 32 channels' },
    { name: 'Stream OS - 64 Channels', price: 40, unit: 'per camera/one-time', description: 'Connects up to 64 channels' },
    { name: 'Stream OS - 128 Channels', price: 40, unit: 'per camera/one-time', description: 'Connects up to 128 channels' },
    { name: 'Stream OS - 256 Channels', price: 40, unit: 'per camera/one-time', description: 'Connects up to 256 channels' },
  ];

  for (let i = 0; i < streamOSPlans.length; i++) {
    const plan = streamOSPlans[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: onPremiseVariant.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        unit: plan.unit,
        pricingType: 'ONE_TIME',
        sortOrder: 1000 + i,
        isActive: true,
        group: 'Stream OS License',
      },
    });
  }
  console.log('Created Stream OS addons (linked to On-Premise variant)');

  // AI-Box
  await prisma.productAddon.create({
    data: {
      productId: vsaasProduct.id,
      variantId: onPremiseVariant.id,
      name: 'AI-Box (16 Credits)',
      description: 'Enables on-prem AI Analytics. 3 year warranty. Zygal Cyber+ Pack for 3 years included.',
      price: 1500,
      unit: 'one-time',
      pricingType: 'ONE_TIME',
      sortOrder: 1010,
      isActive: true,
      group: 'Hardware',
    },
  });

  await prisma.productAddon.create({
    data: {
      productId: vsaasProduct.id,
      variantId: onPremiseVariant.id,
      name: 'AI Licenses (16 Credits)',
      description: 'AI Licenses for on-prem AI-Box. License which can be used to enable any AI alerts/analytics.',
      price: 2499,
      unit: 'one-time',
      pricingType: 'ONE_TIME',
      sortOrder: 1011,
      isActive: true,
      group: 'Hardware',
    },
  });
  console.log('Created AI-Box addons');

  // Annual AMC
  const amcPlans = [
    { name: 'Cyber+ Pack - Stream OS', price: 7, unit: 'per camera/year', description: '1 year Cyber Security Pack for Stream OS' },
    { name: 'Cyber+ Pack - AI-Box (16 Credits)', price: 800, unit: 'per 16 credits/year', description: '1 year Cyber Security Pack for AI-Box' },
  ];

  for (let i = 0; i < amcPlans.length; i++) {
    const plan = amcPlans[i];
    await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        variantId: onPremiseVariant.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        unit: plan.unit,
        pricingType: 'YEARLY',
        sortOrder: 1100 + i,
        isActive: true,
        group: 'Annual Maintenance',
      },
    });
  }
  console.log('Created AMC addons');

  // One-time Setup for On-Prem
  await prisma.productAddon.create({
    data: {
      productId: vsaasProduct.id,
      variantId: onPremiseVariant.id,
      name: 'On-Premise Setup & Implementation',
      description: 'One-time setup and implementation service for On-Premise deployment',
      price: 46000,
      unit: 'one-time',
      pricingType: 'ONE_TIME',
      sortOrder: 1999,
      isActive: true,
      group: 'One-time Costs',
    },
  });
  console.log('Created On-Premise Setup addon');

  // Verify
  const cloudAddons = await prisma.productAddon.findMany({
    where: { variantId: cloudVariant.id },
    orderBy: { sortOrder: 'asc' },
  });

  const onPremiseAddons = await prisma.productAddon.findMany({
    where: { variantId: onPremiseVariant.id },
    orderBy: { sortOrder: 'asc' },
  });

  console.log(`\n=== Summary ===`);
  console.log(`Cloud addons: ${cloudAddons.length}`);
  console.log(`On-Premise addons: ${onPremiseAddons.length}`);
  console.log(`Total addons: ${cloudAddons.length + onPremiseAddons.length}`);

  console.log('\n✅ VSAAS Cloud addons setup complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
