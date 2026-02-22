/**
 * Import VSaaS Cloud Products from Excel
 * 
 * Creates ONE Product "VSaaS Cloud" with multiple variants
 * All variants use ONE_TIME billing type with prices in the one-time price field
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// VSaaS Cloud Variants from Excel - All as variants of ONE product
const vsaasVariants = [
  // Cloud VMS Platform
  {
    name: 'Connect Cloud Platform',
    sku: 'VSAAS-CONNECT-CLOUD',
    shortDesc: 'Cloud VMS Platform - Base License (per camera)',
    description: `**Connect Cloud Platform** - Video Surveillance as a Service (VSaaS) Cloud

**Features Included:**
- Cloud VMS with Live & Playback
- 3 Days Cloud Backup (8 fps, SD- 640*480P, H.265)
- Admin Panel for device/user management
- 1x Core - Desktop application
- 5 x Web View access
- 5 x Mobile App access (Android & iOS)
- Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
- Reports & Dashboard
- Logs & Audit Trail`,
    price: 248.4,
    unit: 'per camera',
    sortOrder: 0,
  },
  // Cloud Storage Plans
  {
    name: 'Cloud Storage - 7 Days',
    sku: 'VSAAS-STORAGE-7D',
    shortDesc: '4 Days additional - Total 7 Days Cloud Storage (per camera)',
    description: `**Cloud Storage Plan - 7 Days Total**

Cloud Backup – 3 days built in the base package + 4 additional days
(8 fps, SD- 640*480P, H.265)`,
    price: 138,
    unit: 'per camera',
    sortOrder: 1,
  },
  {
    name: 'Cloud Storage - 30 Days',
    sku: 'VSAAS-STORAGE-30D',
    shortDesc: '27 Days additional - Total 30 Days Cloud Storage (per camera)',
    description: `**Cloud Storage Plan - 30 Days Total**

Cloud Backup – 3 days built in the base package + 27 additional days
(8 fps, SD- 640*480P, H.265)`,
    price: 391,
    unit: 'per camera',
    sortOrder: 2,
  },
  {
    name: 'Cloud Storage - 90 Days',
    sku: 'VSAAS-STORAGE-90D',
    shortDesc: '87 Days additional - Total 90 Days Cloud Storage (per camera)',
    description: `**Cloud Storage Plan - 90 Days Total**

Cloud Backup – 3 days built in the base package + 87 additional days
(8 fps, SD- 640*480P, H.265)`,
    price: 920,
    unit: 'per camera',
    sortOrder: 3,
  },
  {
    name: 'Cloud Storage - 180 Days',
    sku: 'VSAAS-STORAGE-180D',
    shortDesc: '177 Days additional - Total 180 Days Cloud Storage (per camera)',
    description: `**Cloud Storage Plan - 180 Days Total**

Cloud Backup – 3 days built in the base package + 177 additional days
(8 fps, SD- 640*480P, H.265)`,
    price: 1702,
    unit: 'per camera',
    sortOrder: 4,
  },
  {
    name: 'Cloud Storage - 365 Days',
    sku: 'VSAAS-STORAGE-365D',
    shortDesc: '362 Days additional - Total 365 Days Cloud Storage (per camera)',
    description: `**Cloud Storage Plan - 365 Days Total**

Cloud Backup – 3 days built in the base package + 362 additional days
(8 fps, SD- 640*480P, H.265)`,
    price: 3312,
    unit: 'per camera',
    sortOrder: 5,
  },
  // Platform Add Ons
  {
    name: 'Core Desktop Application License',
    sku: 'VSAAS-DESKTOP-LICENSE',
    shortDesc: 'Core Desktop Application License (per user)',
    description: `**Core Desktop Application License**

Additional desktop application license for the VSaaS Cloud platform.`,
    price: 6578,
    unit: 'per user',
    sortOrder: 6,
  },
  {
    name: 'Web User License',
    sku: 'VSAAS-WEB-LICENSE',
    shortDesc: 'Web User License (per user)',
    description: `**Web User License**

Additional web user license for browser-based access to the VSaaS Cloud platform.`,
    price: 69,
    unit: 'per user',
    sortOrder: 7,
  },
  {
    name: 'Mobile User License',
    sku: 'VSAAS-MOBILE-LICENSE',
    shortDesc: 'Mobile User License (per user)',
    description: `**Mobile User License**

Additional mobile user license for Android & iOS app access to the VSaaS Cloud platform.`,
    price: 69,
    unit: 'per user',
    sortOrder: 8,
  },
  // Hardware Devices
  {
    name: 'Cloud Gateway Link Device',
    sku: 'VSAAS-GATEWAY',
    shortDesc: 'Cloud Gateway Edge Device - One Time (per device)',
    description: `**Cloud Gateway Link Device**

- Cloud Gateway Edge Device
- Creates secured network tunnel with Cloud
- Connects 8/16 channels in local network
- 3 year warranty`,
    price: 5796,
    unit: 'per device',
    sortOrder: 9,
  },
  // Security Essentials AI
  {
    name: 'AI - Intrusion Detection',
    sku: 'VSAAS-AI-INTRUSION',
    shortDesc: 'AI-powered Intrusion Detection (per camera)',
    description: `**AI Intrusion Detection**

Detect unauthorized entry into protected areas using advanced AI algorithms.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 10,
  },
  {
    name: 'AI - Zone Monitoring',
    sku: 'VSAAS-AI-ZONE',
    shortDesc: 'AI-powered Zone Monitoring (per camera)',
    description: `**AI Zone Monitoring**

Monitor specific zones with intelligent detection and alerts.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 11,
  },
  {
    name: 'AI - Camera Sabotage',
    sku: 'VSAAS-AI-SABOTAGE',
    shortDesc: 'AI-powered Camera Sabotage Detection (per camera)',
    description: `**AI Camera Sabotage Detection**

Detect camera tampering, covering, or redirection attempts.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 12,
  },
  {
    name: 'AI - Activity Detection',
    sku: 'VSAAS-AI-ACTIVITY',
    shortDesc: 'AI-powered Activity Detection (per camera)',
    description: `**AI Activity Detection**

Detect and alert on any suspicious activity in monitored areas.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 13,
  },
  {
    name: 'AI - Trespassing',
    sku: 'VSAAS-AI-TRESPASS',
    shortDesc: 'AI-powered Trespassing Detection (per camera)',
    description: `**AI Trespassing Detection**

Detect unauthorized entry into restricted areas.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 14,
  },
  {
    name: 'AI - Perimeter Fence Jumping',
    sku: 'VSAAS-AI-PERIMETER',
    shortDesc: 'AI-powered Perimeter Fence Jumping Detection (per camera)',
    description: `**AI Perimeter Fence Jumping Detection**

Detect attempts to climb or jump over perimeter fences.`,
    price: 161,
    unit: 'per camera',
    sortOrder: 15,
  },
  // Business Efficiency & Security Advanced AI
  {
    name: 'AI - Double Line Crossing',
    sku: 'VSAAS-AI-DOUBLE-LINE',
    shortDesc: 'AI-powered Double Line Crossing Detection (per camera)',
    description: `**AI Double Line Crossing Detection**

Detect when objects or people cross a defined line in both directions.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 16,
  },
  {
    name: 'AI - Loitering',
    sku: 'VSAAS-AI-LOITERING',
    shortDesc: 'AI-powered Loitering Detection (per camera)',
    description: `**AI Loitering Detection**

Detect people lingering in areas longer than expected.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 17,
  },
  {
    name: 'AI - Overcrowding',
    sku: 'VSAAS-AI-OVERCROWD',
    shortDesc: 'AI-powered Overcrowding Detection (per camera)',
    description: `**AI Overcrowding Detection**

Alert when too many people are in a defined area.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 18,
  },
  {
    name: 'AI - People Counting',
    sku: 'VSAAS-AI-PEOPLE-COUNT',
    shortDesc: 'AI-powered People Counting (per camera)',
    description: `**AI People Counting**

Count people entering and exiting areas for traffic analysis.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 19,
  },
  {
    name: 'AI - Missing Staff',
    sku: 'VSAAS-AI-MISSING-STAFF',
    shortDesc: 'AI-powered Missing Staff Detection (per camera)',
    description: `**AI Missing Staff Detection**

Alert when staff members are absent from their designated positions.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 20,
  },
  {
    name: 'AI - Occupancy Statistics',
    sku: 'VSAAS-AI-OCCUPANCY',
    shortDesc: 'AI-powered Occupancy Statistics (per camera)',
    description: `**AI Occupancy Statistics**

Track and analyze occupancy levels in real-time.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 21,
  },
  {
    name: 'AI - Queue Management',
    sku: 'VSAAS-AI-QUEUE',
    shortDesc: 'AI-powered Queue Management (per camera)',
    description: `**AI Queue Management**

Monitor queue lengths and waiting times for better customer service.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 22,
  },
  {
    name: 'AI - Heatmap',
    sku: 'VSAAS-AI-HEATMAP',
    shortDesc: 'AI-powered Heatmap Analysis (per camera)',
    description: `**AI Heatmap Analysis**

Visualize high-traffic areas and customer movement patterns.`,
    price: 782,
    unit: 'per camera',
    sortOrder: 23,
  },
  // Safety & Hazard Advanced AI
  {
    name: 'AI - PPE/Safety Kit Detection',
    sku: 'VSAAS-AI-PPE',
    shortDesc: 'AI-powered PPE/Safety Kit Detection (per camera)',
    description: `**AI PPE/Safety Kit Detection**

Detect if personnel are wearing required safety equipment.`,
    price: 920,
    unit: 'per camera',
    sortOrder: 24,
  },
  {
    name: 'AI - Smoke & Fire Detection',
    sku: 'VSAAS-AI-SMOKE-FIRE',
    shortDesc: 'AI-powered Smoke & Fire Detection (per camera)',
    description: `**AI Smoke & Fire Detection**

Early detection of smoke and fire using visual AI analysis.`,
    price: 920,
    unit: 'per camera',
    sortOrder: 25,
  },
  // Investigation Advanced AI
  {
    name: 'AI - Person of Interest Search',
    sku: 'VSAAS-AI-PERSON-SEARCH',
    shortDesc: 'AI-powered Person of Interest Search (per camera)',
    description: `**AI Person of Interest Search**

Search for specific individuals across all cameras using appearance attributes.`,
    price: 1242,
    unit: 'per camera',
    sortOrder: 26,
  },
  {
    name: 'AI - Vehicle of Interest Search',
    sku: 'VSAAS-AI-VEHICLE-SEARCH',
    shortDesc: 'AI-powered Vehicle of Interest Search (per camera)',
    description: `**AI Vehicle of Interest Search**

Search for vehicles by color and type across all cameras.`,
    price: 1242,
    unit: 'per camera',
    sortOrder: 27,
  },
  // ANPR
  {
    name: 'AI - Automatic Number Plate Recognition',
    sku: 'VSAAS-AI-ANPR',
    shortDesc: 'AI-powered ANPR (per camera)',
    description: `**AI Automatic Number Plate Recognition (ANPR)**

Automatically recognize and log vehicle license plates.`,
    price: 2231,
    unit: 'per camera',
    sortOrder: 28,
  },
  // Facial Recognition
  {
    name: 'AI - Facial Recognition',
    sku: 'VSAAS-AI-FACIAL',
    shortDesc: 'AI-powered Facial Recognition - Up to 50 POI (per camera)',
    description: `**AI Facial Recognition**

Facial recognition with up to 50 Persons of Interest registration.`,
    price: 3312,
    unit: 'per camera',
    sortOrder: 29,
  },
];

async function main() {
  console.log('🚀 Starting VSaaS Cloud Product import...\n');

  // 1. Create main category
  let category = await prisma.category.findFirst({
    where: { slug: 'vsaas-cloud' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'VSaaS Cloud',
        slug: 'vsaas-cloud',
        description: 'XcellCamCloud - Video Surveillance as a Service (VSaaS) Cloud',
        icon: 'video',
        isActive: true,
        sortOrder: 10,
      },
    });
    console.log('✅ Created category:', category.name);
  } else {
    console.log('✅ Found existing category:', category.name);
  }

  // 2. Delete existing product if exists
  const existingProduct = await prisma.product.findFirst({
    where: { slug: 'vsaas-cloud-services' },
    include: { variants: true },
  });
  
  if (existingProduct) {
    console.log(`⚠️ Deleting existing product with ${existingProduct.variants.length} variants...`);
    // Delete variants first
    await prisma.productVariant.deleteMany({
      where: { productId: existingProduct.id },
    });
    // Delete the product
    await prisma.product.delete({ where: { id: existingProduct.id } });
  }

  // Also delete any old standalone VSaaS products
  const oldProducts = await prisma.product.findMany({
    where: { slug: { contains: 'vsaas-' } },
  });
  
  if (oldProducts.length > 0) {
    console.log(`⚠️ Deleting ${oldProducts.length} old standalone products...`);
    for (const old of oldProducts) {
      await prisma.productVariant.deleteMany({
        where: { productId: old.id },
      });
      await prisma.product.delete({ where: { id: old.id } });
    }
  }

  // 3. Create ONE product with all variants
  console.log('\n📦 Creating VSaaS Cloud product with variants...\n');
  
  // Create the main product
  const product = await prisma.product.create({
    data: {
      name: 'VSaaS Cloud',
      slug: 'vsaas-cloud-services',
      categoryId: category.id,
      
      // Basic Tab - Short Description
      shortDescription: 'XcellCamCloud - Video Surveillance as a Service (VSaaS) Cloud. Complete cloud-based video surveillance solution with AI-powered features.',
      
      // Basic Tab - Long Description
      description: `**XcellCamCloud - Video Surveillance as a Service (VSaaS) Cloud**

Complete cloud-based video surveillance solution with AI-powered analytics and enterprise-grade security.

**Platform Features:**
- Cloud VMS with Live & Playback
- Cloud Backup with multiple retention options
- Admin Panel for device/user management
- Desktop, Web, and Mobile App access
- Device Health Check & Monitoring
- Reports & Dashboard
- Logs & Audit Trail

**AI Features Available:**
- Security Essentials: Intrusion Detection, Zone Monitoring, Camera Sabotage, Activity Detection, Trespassing, Perimeter Fence
- Business Advanced: Double Line Crossing, Loitering, Overcrowding, People Counting, Missing Staff, Occupancy Statistics, Queue Management, Heatmap
- Safety & Hazard: PPE/Safety Kit Detection, Smoke & Fire Detection
- Investigation: Person of Interest Search, Vehicle of Interest Search
- ANPR: Automatic Number Plate Recognition
- Facial Recognition: Up to 50 POI registration

**Technical Specifications:**
- Platform Uptime Assurance: 98%
- TLS1.3 Secured Connection
- Bandwidth: Min 512 Kbps per camera for cloud backup
- Storage: ~5GB Per Day Per Camera (VGA/10fps/H.265)

**Contract Terms:**
- Minimum contract period: 12 Months
- Payment: Yearly in advance
- Prices are exclusive of applicable taxes`,
      
      // Basic Tab - Features
      features: [
        'Cloud VMS with Live & Playback',
        'Multiple Cloud Storage Options (7-365 Days)',
        'Desktop, Web & Mobile Access',
        'AI-Powered Analytics',
        'Device Health Monitoring',
        'Reports & Dashboard',
        'TLS1.3 Secured Connection',
        '98% Platform Uptime',
      ],
      
      // Specifications
      specifications: {
        platformUptime: '98%',
        security: 'TLS1.3',
        bandwidth: 'Min 512 Kbps per camera',
        storagePerCamera: '~5GB Per Day',
        compression: 'H.265',
        resolution: 'SD- 640*480P',
        frameRate: '8 fps',
        contractPeriod: '12 Months',
      },
      
      // Pricing - base price is lowest variant price
      basePrice: 69, // Lowest variant price (Web/Mobile User License)
      isRecurring: false, // ONE_TIME billing
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
  
  // 4. Create variants - ONE per item from Excel
  console.log('\n📦 Creating variants...\n');
  
  for (let i = 0; i < vsaasVariants.length; i++) {
    const variant = vsaasVariants[i];
    
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price, // ONE_TIME price
        compareAtPrice: variant.price,
        
        // Store additional info in attributes
        attributes: {
          shortDesc: variant.shortDesc,
          description: variant.description,
          unit: variant.unit,
          billingType: 'ONE_TIME',
        },
        
        isDefault: i === 0, // First variant is default
        isActive: true,
        sortOrder: variant.sortOrder,
      },
    });
    
    console.log(`✅ Variant: ${variant.name}`);
    console.log(`   SKU: ${variant.sku}`);
    console.log(`   Price: ₹${variant.price} (${variant.unit})`);
    console.log('');
  }

  console.log('\n✨ Import completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - 1 Product: VSaaS Cloud`);
  console.log(`  - ${vsaasVariants.length} Variants`);
  console.log(`  - Billing Type: ONE_TIME`);
  console.log(`  - Category: ${category.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
