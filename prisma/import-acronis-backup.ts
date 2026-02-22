/**
 * Import Acronis Cyber Backup Cloud Products from Excel
 * 
 * Adds variants to existing Acronis product
 * Included Components become addons with 0 price
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Acronis Variants from Excel
const acronisVariants = [
  {
    name: 'Standard Storage - 50 GB',
    sku: 'ACRONIS-STORAGE-50GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 50 GB (per GB)',
    description: `**Acronis Cyber Backup Cloud Standard Storage Subscription - 50 GB**

Cloud storage subscription with unlimited Backup Agents.`,
    price: 345, // 50 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 0,
  },
  {
    name: 'Standard Storage - 100 GB',
    sku: 'ACRONIS-STORAGE-100GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 100 GB (per GB)',
    description: `**Acronis Cyber Backup Cloud Standard Storage Subscription - 100 GB**

Cloud storage subscription with unlimited Backup Agents.`,
    price: 690, // 100 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 1,
  },
  {
    name: 'Standard Storage - 500 GB',
    sku: 'ACRONIS-STORAGE-500GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 500 GB (per GB)',
    description: `**Acronis Cyber Backup Cloud Standard Storage Subscription - 500 GB**

Cloud storage subscription with unlimited Backup Agents.`,
    price: 3450, // 500 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 2,
  },
  {
    name: 'Standard Storage - 2 TB',
    sku: 'ACRONIS-STORAGE-2TB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 2 TB (per GB)',
    description: `**Acronis Cyber Backup Cloud Standard Storage Subscription - 2 TB**

Cloud storage subscription with unlimited Backup Agents.`,
    price: 6900, // ~1000 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 3,
  },
  {
    name: 'Standard Storage - Cloud (per TB)',
    sku: 'ACRONIS-STORAGE-CLOUD-TB',
    shortDesc: 'Acronis Cyber Protect Cloud Standard Storage - Cloud (per TB)',
    description: `**Acronis Cyber Protect Cloud - Standard Storage Subscription - per TB (Cloud Storage)**

Cloud storage subscription with unlimited Backup Agents.`,
    price: 6900,
    unit: 'per TB',
    sortOrder: 4,
  },
  {
    name: 'Standard Storage - Local (per TB)',
    sku: 'ACRONIS-STORAGE-LOCAL-TB',
    shortDesc: 'Acronis Cyber Protect Cloud Standard Storage - Local (per TB)',
    description: `**Acronis Cyber Protect Cloud - Standard Storage Subscription - per TB (Local Storage)**

Local storage subscription with unlimited Backup Agents.`,
    price: 4140,
    unit: 'per TB',
    sortOrder: 5,
  },
  {
    name: 'Managed Backup Services',
    sku: 'ACRONIS-MANAGED-BACKUP',
    shortDesc: 'Managed Backup Services (per TB)',
    description: `**Managed Backup Services**

Comprehensive managed backup service including:
- Creating Backup Plan [Frequency of Backup, What to Backup, Restoration Plan]
- Backup Plan Review [Speed of Backup & Restoration, Mock Restore, Backup Integrity Checks]
- Assess & Define Comprehensive Backup & Recovery Plan
- Integrate Backup Plan into Overall Managed Hosting Plan
- Minimize impact of backup activities
- Segregate Backup Activity on a Separate Backup Network
- Define Backup Retention Periods & Encryption Standards
- Design Optional Application Specific Backup Strategies
- Complete Backup System Verification
- Verify completion of each backup session
- Provide Optional Test Recovery Strategies
- Schedule Regular Backup during off peak hours
- Aggregate Backup Usage
- Determine Impending Backup Limit Alerts
- Evaluate Backup Usage Trends
- Apply Scalability foresight to anticipate backup capacity needs`,
    price: 690,
    unit: 'per TB',
    sortOrder: 6,
  },
];

// Included Components - Addons with 0 price
const includedComponents = [
  {
    name: 'Infrastructure-As-A-Service (Cloud Gateway + Cloud Repository + WAN Acceleration)',
    description: 'Hosted in Acronis Cyber Backup Cloud',
    price: 0,
    unit: 'included',
  },
  {
    name: 'Acronis Software Agent Licenses',
    description: 'Include Acronis Software Agent Licenses',
    price: 0,
    unit: 'included',
  },
  {
    name: 'Incoming + Outgoing Bandwidth',
    description: 'Includes Incoming + Outgoing Bandwidth',
    price: 0,
    unit: 'included',
  },
  {
    name: 'Acronis Cloud Storage',
    description: 'Includes Acronis Cloud Storage',
    price: 0,
    unit: 'included',
  },
  {
    name: '100% Infrastructure Uptime SLA',
    description: '100% Infrastructure Uptime SLA',
    price: 0,
    unit: 'included',
  },
];

async function main() {
  console.log('🚀 Starting Acronis Cyber Backup Cloud import...\n');

  // 1. Find existing Acronis product
  const existingProduct = await prisma.product.findFirst({
    where: { 
      slug: { contains: 'acronis' } 
    },
    include: { variants: true, addons: true },
  });

  if (!existingProduct) {
    console.log('❌ No Acronis product found. Please create it first in the admin panel.');
    process.exit(1);
  }

  console.log(`✅ Found existing product: ${existingProduct.name} (${existingProduct.variants.length} existing variants, ${existingProduct.addons.length} existing addons)`);

  // 2. Delete existing variants and addons
  if (existingProduct.variants.length > 0) {
    console.log(`⚠️ Deleting ${existingProduct.variants.length} existing variants...`);
    await prisma.productVariant.deleteMany({
      where: { productId: existingProduct.id },
    });
  }

  if (existingProduct.addons.length > 0) {
    console.log(`⚠️ Deleting ${existingProduct.addons.length} existing addons...`);
    await prisma.productAddon.deleteMany({
      where: { productId: existingProduct.id },
    });
  }

  // 3. Create variants
  console.log('\n📦 Creating variants...\n');
  
  for (let i = 0; i < acronisVariants.length; i++) {
    const variant = acronisVariants[i];
    
    await prisma.productVariant.create({
      data: {
        productId: existingProduct.id,
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

  // 4. Create addons (Included Components with 0 price)
  console.log('\n📦 Creating addons (Included Components)...\n');
  
  for (let i = 0; i < includedComponents.length; i++) {
    const addon = includedComponents[i];
    
    await prisma.productAddon.create({
      data: {
        productId: existingProduct.id,
        name: addon.name,
        description: addon.description,
        price: addon.price, // 0 price for included components
        unit: addon.unit,
        pricingType: 'ONE_TIME',
        isActive: true,
        sortOrder: i,
      },
    });
    
    console.log(`✅ Addon: ${addon.name}`);
    console.log(`   Price: ₹${addon.price} (${addon.unit})`);
    console.log('');
  }

  console.log('\n✨ Import completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Product: ${existingProduct.name}`);
  console.log(`  - ${acronisVariants.length} Variants Created`);
  console.log(`  - ${includedComponents.length} Addons Created (Included Components with 0 price)`);
  console.log(`  - Billing Type: ONE_TIME`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
