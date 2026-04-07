/**
 * Import Acronis Cyber Backup Cloud Products from Excel
 * 
 * Creates new product "Acronis Cyber Backup Cloud for India Partners-Storage"
 * with variants and addons (Included Components with 0 price)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Acronis Variants from Excel
const acronisVariants = [
  {
    name: 'Standard Storage - 50 GB',
    sku: 'ACRONIS-CLOUD-50GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 50 GB (per GB)',
    description: `Acronis Cyber Backup Cloud Standard Storage Subscription - 50 GB

Cloud storage subscription with unlimited Backup Agents.`,
    price: 345, // 50 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 0,
  },
  {
    name: 'Standard Storage - 100 GB',
    sku: 'ACRONIS-CLOUD-100GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 100 GB (per GB)',
    description: `Acronis Cyber Backup Cloud Standard Storage Subscription - 100 GB

Cloud storage subscription with unlimited Backup Agents.`,
    price: 690, // 100 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 1,
  },
  {
    name: 'Standard Storage - 500 GB',
    sku: 'ACRONIS-CLOUD-500GB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 500 GB (per GB)',
    description: `Acronis Cyber Backup Cloud Standard Storage Subscription - 500 GB

Cloud storage subscription with unlimited Backup Agents.`,
    price: 3450, // 500 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 2,
  },
  {
    name: 'Standard Storage - 2 TB',
    sku: 'ACRONIS-CLOUD-2TB',
    shortDesc: 'Acronis Cyber Backup Cloud Standard Storage - 2 TB (per GB)',
    description: `Acronis Cyber Backup Cloud Standard Storage Subscription - 2 TB

Cloud storage subscription with unlimited Backup Agents.`,
    price: 6900, // ~1000 GB * 6.9 per GB
    unit: 'per GB',
    sortOrder: 3,
  },
  {
    name: 'Standard Storage - Cloud (per TB)',
    sku: 'ACRONIS-CLOUD-TB',
    shortDesc: 'Acronis Cyber Protect Cloud Standard Storage - Cloud (per TB)',
    description: `Acronis Cyber Protect Cloud - Standard Storage Subscription - per TB (Cloud Storage)

Cloud storage subscription with unlimited Backup Agents.`,
    price: 6900,
    unit: 'per TB',
    sortOrder: 4,
  },
  {
    name: 'Standard Storage - Local (per TB)',
    sku: 'ACRONIS-LOCAL-TB',
    shortDesc: 'Acronis Cyber Protect Cloud Standard Storage - Local (per TB)',
    description: `Acronis Cyber Protect Cloud - Standard Storage Subscription - per TB (Local Storage)

Local storage subscription with unlimited Backup Agents.`,
    price: 4140,
    unit: 'per TB',
    sortOrder: 5,
  },
  {
    name: 'Managed Backup Services',
    sku: 'ACRONIS-MANAGED-TB',
    shortDesc: 'Managed Backup Services (per TB)',
    description: `Managed Backup Services

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

  // 1. Find or create category
  let category = await prisma.category.findFirst({
    where: { slug: 'acronis-backup' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Acronis Backup',
        slug: 'acronis-backup',
        description: 'Acronis Cyber Backup Cloud Services',
        icon: 'cloud',
        isActive: true,
        sortOrder: 15,
      },
    });
    console.log('✅ Created category:', category.name);
  } else {
    console.log('✅ Found existing category:', category.name);
  }

  // 2. Delete existing product if exists
  const existingProduct = await prisma.product.findFirst({
    where: { slug: 'acronis-cyber-backup-cloud-india' },
    include: { variants: true, addons: true },
  });
  
  if (existingProduct) {
    console.log(`⚠️ Deleting existing product with ${existingProduct.variants.length} variants and ${existingProduct.addons.length} addons...`);
    await prisma.productVariant.deleteMany({
      where: { productId: existingProduct.id },
    });
    await prisma.productAddon.deleteMany({
      where: { productId: existingProduct.id },
    });
    await prisma.product.delete({ where: { id: existingProduct.id } });
  }

  // 2b. Delete any existing variants with these SKUs
  console.log('🗑️ Cleaning up existing variants with same SKUs...');
  for (const variant of acronisVariants) {
    await prisma.productVariant.deleteMany({
      where: { sku: variant.sku },
    });
  }

  // 3. Create new product
  console.log('\n📦 Creating Acronis Cyber Backup Cloud product...\n');
  
  const product = await prisma.product.create({
    data: {
      name: 'Acronis Cyber Backup Cloud for India Partners-Storage',
      slug: 'acronis-cyber-backup-cloud-india',
      categoryId: category.id,
      
      shortDescription: 'XcellBackup | Secure Cloud Backup Services - Powered by Acronis Cyber Protect Cloud. Protect your data against system hardware, viruses & trojans, ransomware, data thefts, accidental deletion, natural disasters, human errors etc.',
      
      description: `XcellBackup | Secure Cloud Backup Services - Powered by Acronis Cyber Protect Cloud

Protect your data against system hardware, viruses & trojans, ransomware, data thefts, accidental deletion, natural disasters, human errors etc.

Cloud Storage Options:
- Standard Storage Subscription (50 GB - 2 TB)
- Standard Storage Cloud (per TB)
- Standard Storage Local (per TB)

Managed Services:
- Managed Backup Services (per TB)

Included Components:
- Infrastructure-As-A-Service (Cloud Gateway + Cloud Repository + WAN Acceleration) Hosted in Acronis Cyber Backup Cloud
- Acronis Software Agent Licenses
- Incoming + Outgoing Bandwidth
- Acronis Cloud Storage
- 100% Infrastructure Uptime SLA

Contract Terms:
- Annual Advance Payment with One Time Setup Charges
- Annual Contract (Auto Renewable). 30 days Termination Notice required
- Setup Charges does not include any Initial Backup Seeding Charges
- Delivery: Within 2 working days from PO + Advance Payment Receipt
- Overage Billing will be billed as actuals`,
      
      basePrice: 345, // Lowest variant price
      isRecurring: false,
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

  // 4. Create variants
  console.log('\n📦 Creating variants...\n');
  
  for (let i = 0; i < acronisVariants.length; i++) {
    const variant = acronisVariants[i];
    
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.price,
        
        attributes: {
          unit: variant.unit,
          billingType: 'ONE_TIME',
        },
        
        isDefault: i === 0,
        isActive: true,
        sortOrder: variant.sortOrder,
      },
    });
    
    console.log(`✅ Variant: ${variant.name}`);
    console.log(`   SKU: ${variant.sku}`);
    console.log(`   Price: ₹${variant.price} (${variant.unit})`);
    console.log('');
  }

  // 5. Create addons (Included Components with 0 price)
  console.log('\n📦 Creating addons (Included Components)...\n');
  
  for (let i = 0; i < includedComponents.length; i++) {
    const addon = includedComponents[i];
    
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
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
  console.log(`  - Product: ${product.name}`);
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
