const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  console.log('Setting up Connect Cloud product with INR pricing...');

  // Find the connect-cloud product
  let product = await prisma.product.findFirst({
    where: { slug: 'connect-cloud' }
  });

  if (!product) {
    // Create Connect Cloud product
    product = await prisma.product.create({
      data: {
        name: 'Connect Cloud',
        slug: 'connect-cloud',
        shortDescription: 'Cloud video surveillance solution',
        description: 'Complete cloud video surveillance solution with AI features. Connect Cloud Platform + Cloud Gateway + AI Addons.',
        categoryId: (await prisma.category.findFirst({ where: { name: { contains: 'VSAAS' } } }))?.id || null,
        basePrice: 248.40,
        status: 'ACTIVE'
      }
    });
    console.log('Created Connect Cloud product:', product.id);
  } else {
    // Update existing product
    product = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: 'Connect Cloud',
        basePrice: 248.40,
        status: 'ACTIVE',
        shortDescription: 'Cloud video surveillance solution',
        description: 'Complete cloud video surveillance solution with AI features. Connect Cloud Platform + Cloud Gateway + AI Addons.'
      }
    });
    console.log('Updated Connect Cloud product:', product.id);
  }

  // Delete existing variants for this product
  await prisma.productVariant.deleteMany({
    where: { productId: product.id }
  });
  
  // Delete existing addons for this product
  await prisma.productAddon.deleteMany({
    where: { productId: product.id }
  });
  
  // Delete existing recurring prices
  await prisma.productRecurringPrice.deleteMany({
    where: { productId: product.id }
  });

  // Create variants: Connect Cloud and Cloud Gateway (INR pricing)
  const connectCloudVariant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Connect Cloud - Platform Fee',
      attributes: { 
        type: 'cloud',
        billingType: 'recurring',
        description: 'Cloud VMS with Live & Playback, 3 Days Cloud Backup, Admin Panel, Desktop/Mobile/Web access',
        monthlyPrice: 248.40,
        quarterlyPrice: 745.20,
        yearlyPrice: 2980.80
      },
      price: 248.40,  // Monthly price in INR
      minQuantity: 2,
      isDefault: true
    }
  });
  console.log('Created variant: Connect Cloud - ₹248.40/month');

  // Create recurring price for Connect Cloud
  await prisma.productRecurringPrice.create({
    data: {
      productId: product.id,
      variantId: connectCloudVariant.id,
      monthlyPrice: 248.40,
      quarterlyPrice: 745.20,
      yearlyPrice: 2980.80,
      currency: 'INR'
    }
  });

  // Cloud Gateway - One time CAPEX in INR
  const cloudGatewayVariant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Cloud Gateway',
      attributes: { 
        type: 'cloud',
        billingType: 'one_time',
        description: 'Cloud Gateway Edge Device - Creates secured network tunnel with Cloud, Connects up to 16 channels'
      },
      price: 5796,  // One-time price in INR
      minQuantity: 1
    }
  });
  console.log('Created variant: Cloud Gateway - ₹5,796 one-time');

  // Create addons with INR pricing (Customer Rates from Excel)
  const cloudAddons = [
    // Cloud Storage Plans (INR per camera/month)
    { name: 'Cloud Storage - 4 Days (Total 7 Days)', group: '☁️ Cloud - Storage', description: 'Additional cloud storage', price: 138, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Cloud Storage - 27 Days (Total 30 Days)', group: '☁️ Cloud - Storage', description: 'Additional cloud storage', price: 391, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Cloud Storage - 87 Days (Total 90 Days)', group: '☁️ Cloud - Storage', description: 'Additional cloud storage', price: 920, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Cloud Storage - 177 Days (Total 180 Days)', group: '☁️ Cloud - Storage', description: 'Additional cloud storage', price: 1702, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Cloud Storage - 362 Days (Total 365 Days)', group: '☁️ Cloud - Storage', description: 'Additional cloud storage', price: 3312, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    
    // Platform Add-ons (INR)
    { name: 'Core Desktop Application License', group: '☁️ Cloud - Platform', description: 'Desktop application license', price: 6578, pricingType: 'RECURRING_YEARLY', unit: 'per user/year' },
    { name: 'Web User License', group: '☁️ Cloud - Platform', description: 'Web access license', price: 69, pricingType: 'RECURRING_MONTHLY', unit: 'per user/month' },
    { name: 'Mobile User License', group: '☁️ Cloud - Platform', description: 'Mobile app license', price: 69, pricingType: 'RECURRING_MONTHLY', unit: 'per user/month' },

    // Security AI (INR per camera/month)
    { name: 'Intrusion Detection', group: '☁️ Cloud - AI Security', description: 'AI-powered intrusion detection', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Zone Monitoring', group: '☁️ Cloud - AI Security', description: 'AI-powered zone monitoring', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Camera Sabotage', group: '☁️ Cloud - AI Security', description: 'AI-powered camera sabotage detection', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Activity Detection', group: '☁️ Cloud - AI Security', description: 'AI-powered activity detection', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Trespassing Detection', group: '☁️ Cloud - AI Security', description: 'AI-powered trespassing detection', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Perimeter Fence Jumping', group: '☁️ Cloud - AI Security', description: 'AI-powered fence jumping detection', price: 161, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },

    // Business AI (INR per camera/month)
    { name: 'Double Line Crossing', group: '☁️ Cloud - AI Business', description: 'AI-powered line crossing detection', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Loitering Detection', group: '☁️ Cloud - AI Business', description: 'AI-powered loitering detection', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Overcrowding Detection', group: '☁️ Cloud - AI Business', description: 'AI-powered overcrowding detection', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'People Counting', group: '☁️ Cloud - AI Business', description: 'AI-powered people counting', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Missing Staff Detection', group: '☁️ Cloud - AI Business', description: 'AI-powered missing staff detection', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Occupancy Statistics', group: '☁️ Cloud - AI Business', description: 'AI-powered occupancy statistics', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Queue Management', group: '☁️ Cloud - AI Business', description: 'AI-powered queue management', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Heatmap Analysis', group: '☁️ Cloud - AI Business', description: 'AI-powered heatmap analysis', price: 782, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },

    // Safety AI (INR per camera/month)
    { name: 'PPE/Safety Kit Detection', group: '☁️ Cloud - AI Safety', description: 'AI-powered PPE detection', price: 920, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Smoke & Fire Detection', group: '☁️ Cloud - AI Safety', description: 'AI-powered smoke & fire detection', price: 920, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },

    // Investigation AI (INR per camera/month)
    { name: 'Person of Interest (Appearance Search)', group: '☁️ Cloud - AI Investigation', description: 'AI-powered person search', price: 1242, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Vehicle of Interest (Color & Type Search)', group: '☁️ Cloud - AI Investigation', description: 'AI-powered vehicle search', price: 1242, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'ANPR (Automatic Number Plate Recognition)', group: '☁️ Cloud - AI Investigation', description: 'AI-powered ANPR', price: 2231, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },
    { name: 'Facial Recognition (Up to 50 POI)', group: '☁️ Cloud - AI Investigation', description: 'AI-powered facial recognition', price: 3312, pricingType: 'RECURRING_MONTHLY', unit: 'per camera/month' },

    // One-time (INR)
    { name: 'Setup & Implementation', group: '☁️ Cloud - One Time', description: 'One-time setup cost', price: 9999, pricingType: 'ONE_TIME', unit: 'one-time' },
  ];

  for (const addon of cloudAddons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        group: addon.group,
        description: addon.description,
        price: addon.price,
        pricingType: addon.pricingType,
        unit: addon.unit
      }
    });
    console.log(`Created addon: ${addon.name} - ₹${addon.price}`);
  }

  console.log('\n=== Connect Cloud Setup Complete (INR Pricing) ===');
  console.log('Product:', product.name);
  console.log('Variants:');
  console.log('  - Connect Cloud: ₹248.40/month (₹745.20/qtr, ₹2,980.80/yr per camera)');
  console.log('  - Cloud Gateway: ₹5,796 (one-time)');
  console.log('Addons:', cloudAddons.length, 'cloud addons with INR pricing');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
