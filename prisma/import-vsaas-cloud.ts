/**
 * Import VSaaS Cloud Calculator from Excel
 *
 * Creates ONE Product "VSaaS Cloud" with:
 * - Basic tab: Short description, Long description, Features
 * - Variants tab: Different service tiers (Platform, Storage, AI features)
 * - Each variant has recurring monthly pricing
 * - Hardware as separate variants
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// VSaaS Cloud Service Plans from Excel - these will be VARIANTS
const servicePlans = [
  {
    name: 'Connect Cloud Platform',
    slug: 'connect-cloud-platform',
    shortDesc: 'Cloud VMS Platform with Live & Playback',
    category: 'PLATFORM',
    unit: 'per camera',
    priceUSD: 2.7,
    priceINR: 248.4,
    features: [
      'Cloud VMS with Live & Playback',
      '3 Days Cloud Backup (8 fps, SD- 640*480P, H.265)',
      'Admin Panel for device/user management',
      '1x Core - Desktop application',
      '5 x Web View access',
      '5 x Mobile App access (Android & iOS)',
      'Device Health Check (Cameras/NVRs/HDD/SD Card etc.)',
      'Reports & Dashboard',
      'Logs & Audit Trail'
    ],
  },
  {
    name: 'Cloud Storage - 4 Days',
    slug: 'cloud-storage-4-days',
    shortDesc: 'Extended Cloud Storage - Total 7 Days',
    category: 'STORAGE',
    unit: 'per camera',
    priceUSD: 1.5,
    priceINR: 138,
    features: [
      'Extended cloud backup storage',
      'Total 7 days retention',
      '8 fps, SD- 640*480P, H.265'
    ],
  },
  {
    name: 'Cloud Storage - 27 Days',
    slug: 'cloud-storage-27-days',
    shortDesc: 'Extended Cloud Storage - Total 30 Days',
    category: 'STORAGE',
    unit: 'per camera',
    priceUSD: 4.25,
    priceINR: 391,
    features: [
      'Extended cloud backup storage',
      'Total 30 days retention',
      '8 fps, SD- 640*480P, H.265'
    ],
  },
  {
    name: 'Cloud Storage - 87 Days',
    slug: 'cloud-storage-87-days',
    shortDesc: 'Extended Cloud Storage - Total 90 Days',
    category: 'STORAGE',
    unit: 'per camera',
    priceUSD: 10,
    priceINR: 920,
    features: [
      'Extended cloud backup storage',
      'Total 90 days retention',
      '8 fps, SD- 640*480P, H.265'
    ],
  },
  {
    name: 'Cloud Storage - 177 Days',
    slug: 'cloud-storage-177-days',
    shortDesc: 'Extended Cloud Storage - Total 180 Days',
    category: 'STORAGE',
    unit: 'per camera',
    priceUSD: 18.5,
    priceINR: 1702,
    features: [
      'Extended cloud backup storage',
      'Total 180 days retention',
      '8 fps, SD- 640*480P, H.265'
    ],
  },
  {
    name: 'Cloud Storage - 362 Days',
    slug: 'cloud-storage-362-days',
    shortDesc: 'Extended Cloud Storage - Total 365 Days',
    category: 'STORAGE',
    unit: 'per camera',
    priceUSD: 36,
    priceINR: 3312,
    features: [
      'Extended cloud backup storage',
      'Total 365 days retention',
      '8 fps, SD- 640*480P, H.265'
    ],
  },
];

// AI Features from Excel
const aiFeatures = [
  {
    name: 'Intrusion Detection',
    slug: 'intrusion-detection',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Zone Monitoring',
    slug: 'zone-monitoring',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Camera Sabotage',
    slug: 'camera-sabotage',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Activity Detection',
    slug: 'activity-detection',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Trespassing',
    slug: 'trespassing',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Perimeter Fence Jumping',
    slug: 'perimeter-fence-jumping',
    category: 'AI_SECURITY',
    unit: 'per camera',
    priceUSD: 1.75,
    priceINR: 161,
    credits: 1,
  },
  {
    name: 'Double Line Crossing',
    slug: 'double-line-crossing',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Loitering',
    slug: 'loitering',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Overcrowding',
    slug: 'overcrowding',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'People Counting',
    slug: 'people-counting',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Missing Staff',
    slug: 'missing-staff',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Occupancy Statistics',
    slug: 'occupancy-statistics',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Queue Management',
    slug: 'queue-management',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'Heatmap',
    slug: 'heatmap',
    category: 'AI_BUSINESS',
    unit: 'per camera',
    priceUSD: 8.5,
    priceINR: 782,
    credits: 1,
  },
  {
    name: 'PPE/Safety Kit Detection',
    slug: 'ppe-safety-detection',
    category: 'AI_SAFETY',
    unit: 'per camera',
    priceUSD: 10,
    priceINR: 920,
    credits: 1,
  },
  {
    name: 'Smoke & Fire Detection',
    slug: 'smoke-fire-detection',
    category: 'AI_SAFETY',
    unit: 'per camera',
    priceUSD: 10,
    priceINR: 920,
    credits: 1,
  },
  {
    name: 'Person of Interest (Appearance Search)',
    slug: 'person-interest-search',
    category: 'AI_INVESTIGATION',
    unit: 'per camera',
    priceUSD: 13.5,
    priceINR: 1242,
    credits: 1,
  },
  {
    name: 'Vehicle of Interest (Color & Type Search)',
    slug: 'vehicle-interest-search',
    category: 'AI_INVESTIGATION',
    unit: 'per camera',
    priceUSD: 13.5,
    priceINR: 1242,
    credits: 1,
  },
  {
    name: 'Automatic Number Plate Recognition',
    slug: 'anpr',
    category: 'AI_ANPR',
    unit: 'per camera',
    priceUSD: 24.25,
    priceINR: 2231,
    credits: 4,
  },
  {
    name: 'Facial Recognition (with Up to 50 POI registration)',
    slug: 'facial-recognition',
    category: 'AI_FACIAL',
    unit: 'per camera',
    priceUSD: 36,
    priceINR: 3312,
    credits: 8,
  },
];

// Hardware from Excel
const hardware = [
  {
    name: 'Cloud Gateway Link Device',
    slug: 'cloud-gateway-device',
    shortDesc: 'Cloud Gateway Edge Device for secure connection',
    category: 'HARDWARE',
    unit: 'per device',
    priceUSD: 63,
    priceINR: 5796,
    features: [
      'Cloud Gateway Edge Device',
      'Creates secured network tunnel with Cloud',
      'Connects 8/16 channels in local network',
      '3 year warranty'
    ],
  },
];

async function main() {
  console.log('🚀 Starting VSaaS Cloud import...\n');

  // 1. Find or create category
  let category = await prisma.category.findFirst({
    where: { slug: 'vsaas-cloud' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'VSaaS Cloud',
        slug: 'vsaas-cloud',
        description: 'Video Surveillance as a Service - Cloud Solution',
        icon: 'cloud',
        isActive: true,
        sortOrder: 2,
      },
    });
    console.log('✅ Created category:', category.name);
  } else {
    console.log('✅ Found existing category:', category.name);
  }

  // 2. Delete existing product if exists
  const existingProduct = await prisma.product.findFirst({
    where: { slug: 'vsaas-cloud-service' },
  });

  if (existingProduct) {
    console.log(`⚠️ Deleting existing product...`);
    await prisma.product.delete({ where: { id: existingProduct.id } });
  }

  // 3. Create ONE product with all services as variants
  console.log('\n📦 Creating VSaaS Cloud product with variants...\n');

  // Combine all services into variants
  const allVariants = [
    ...servicePlans,
    ...aiFeatures,
    ...hardware,
  ];

  // Create the main product
  const product = await prisma.product.create({
    data: {
      name: 'VSaaS Cloud',
      slug: 'vsaas-cloud-service',
      categoryId: category.id,

      // Basic Tab - Short Description
      shortDescription: 'XcellCamCloud | Video Surveillance as a Service (VSaaS) Cloud. Complete cloud-based surveillance solution with AI analytics.',

      // Basic Tab - Long Description
      description: `**XcellCamCloud VSaaS Cloud** - Complete Video Surveillance as a Service

Choose from our comprehensive cloud-based surveillance solutions with advanced AI analytics. All plans include enterprise-grade security and 24/7 monitoring.

**Platform Features:**
- Cloud VMS with Live & Playback
- Admin Panel for device/user management
- Multi-platform access (Desktop, Web, Mobile)
- Device Health Monitoring
- Reports & Dashboard
- Enterprise Security

**AI Analytics Available:**
- Security Essentials AI (Intrusion, Zone Monitoring, etc.)
- Business Efficiency AI (People Counting, Heatmaps, etc.)
- Safety & Hazard AI (PPE Detection, Fire Detection)
- Investigation AI (Person/Vehicle Search)
- ANPR (Automatic Number Plate Recognition)
- Facial Recognition

**Storage Options:**
- Base: 3 Days Cloud Backup
- Extended: 7, 30, 90, 180, 365 Days

**Hardware:**
- Cloud Gateway for secure connectivity

**Hosting:** India Cloud Data Center
**Uptime SLA:** 98%
**Currency:** USD (Exchange Rate: 1 USD = 92 INR)`,

      // Basic Tab - Features
      features: [
        'Cloud VMS Platform',
        'AI Analytics Suite',
        'Flexible Storage Plans',
        'Multi-platform Access',
        'Device Health Monitoring',
        'Enterprise Security',
        '98% Uptime SLA',
        'India Cloud Hosting',
      ],

      // Specifications
      specifications: {
        platform: 'Cloud VMS',
        storage: '3-365 Days Backup',
        ai: 'Multiple AI Analytics',
        access: 'Desktop, Web, Mobile',
        security: 'Enterprise Grade',
        uptime: '98%',
        location: 'India Cloud',
        currency: 'USD/INR',
      },

      // Pricing - base price is lowest monthly
      basePrice: 138, // Lowest storage plan
      monthlyPrice: 138,
      isRecurring: true,
      productType: 'CONFIGURABLE',
      status: 'ACTIVE',
      isFeatured: true,
      isDigital: true,
      requiresShipping: false,
      trackInventory: false,
      stockQuantity: 999,
    },
  });

  console.log(`✅ Created product: ${product.name}`);
  console.log(`   Short Desc: ${product.shortDescription}`);

  // 4. Create variants - ONE per service/feature
  console.log('\n📦 Creating variants (services and features)...\n');

  for (let i = 0; i < allVariants.length; i++) {
    const variant = allVariants[i];

    const variantData = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        sku: `VSAAS-${variant.slug.toUpperCase()}`,
        price: variant.priceINR, // INR price
        compareAtPrice: variant.priceINR,

        // Store all details in attributes
        attributes: {
          // Service details
          category: variant.category,
          unit: variant.unit,
          priceUSD: variant.priceUSD,
          priceINR: variant.priceINR,
          credits: variant.credits || 0,

          // Description
          shortDesc: variant.shortDesc || `${variant.name} - ${variant.unit}`,
          description: variant.name,
          features: variant.features || [],

          // Technical specs
          ...(variant.category === 'PLATFORM' && {
            backup: '3 Days (8 fps, SD-640*480P, H.265)',
            access: '1 Desktop + 5 Web + 5 Mobile',
            reports: 'Dashboard & Audit Trail',
          }),

          ...(variant.category?.startsWith('AI_') && {
            aiCategory: variant.category.replace('AI_', ''),
            creditsRequired: variant.credits,
          }),

          ...(variant.category === 'HARDWARE' && {
            warranty: '3 Years',
            connectivity: '8/16 Channels',
          }),
        },

        isDefault: i === 0, // First variant is default
        isActive: true,
        sortOrder: i,
      },
    });

    console.log(`✅ Variant: ${variant.name}`);
    console.log(`   Category: ${variant.category}`);
    console.log(`   Unit: ${variant.unit}`);
    console.log(`   Price: ₹${variant.priceINR.toLocaleString()} (${variant.priceUSD} USD)`);

    // Create recurring price record for this variant (monthly billing)
    await prisma.productRecurringPrice.create({
      data: {
        productId: product.id,
        variantId: variantData.id,
        monthlyPrice: variant.priceINR,
        currency: 'INR',
        isActive: true,
      },
    });

    console.log(`   └─ Created recurring price record`);
    console.log('');
  }

  // 5. Create product configs
  const configs = [
    { name: 'Service Type', value: 'Cloud Platform, Storage, AI, Hardware', type: 'SERVICE_TYPE' },
    { name: 'AI Categories', value: 'Security, Business, Safety, Investigation', type: 'AI_TYPE' },
    { name: 'Storage Options', value: '3-365 Days', type: 'STORAGE' },
    { name: 'Access Platforms', value: 'Desktop, Web, Mobile', type: 'ACCESS' },
    { name: 'Hardware', value: 'Cloud Gateway', type: 'HARDWARE' },
    { name: 'Uptime SLA', value: '98%', type: 'SLA' },
    { name: 'Data Center', value: 'India Cloud', type: 'LOCATION' },
    { name: 'Currency', value: 'USD/INR (92)', type: 'CURRENCY' },
  ];

  for (const config of configs) {
    await prisma.productConfig.create({
      data: {
        productId: product.id,
        name: config.name,
        displayName: config.name,
        configType: config.type,
        configGroup: 'Service Configuration',
        inputType: 'SELECT',
        isRequired: false,
        sortOrder: configs.indexOf(config),
      },
    });
  }

  console.log('\n✨ VSaaS Cloud import completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - 1 Product: VSaaS Cloud`);
  console.log(`  - ${allVariants.length} Variants (${servicePlans.length} Services + ${aiFeatures.length} AI Features + ${hardware.length} Hardware)`);
  console.log(`  - ${allVariants.length} Recurring Price Records`);
  console.log(`  - ${configs.length} Product Configurations`);
  console.log(`  - 0 Product Addons (as requested)`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
