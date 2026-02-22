/**
 * Import Acronis Backup Advanced SPLA Products from Excel
 * 
 * Creates new product "Acronis Backup Advanced SPLA for Partners - IN Backup"
 * with variants and addons
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Acronis Backup Advanced Variants from Excel
const acronisVariants = [
  // Workstation variants
  {
    name: 'Advanced Backup - Workstation (Monthly)',
    sku: 'ACRONIS-ADV-WKST-MON',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Workstation (Monthly) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Workstation (Monthly) with Active Protection`,
    price: 158,
    unit: 'per device',
    sortOrder: 0,
  },
  {
    name: 'Advanced Backup - Workstation (1 Year)',
    sku: 'ACRONIS-ADV-WKST-1Y',
    shortDesc: 'Acronis Advanced Backup - Workstation (1 Year Subscription) with Active Protection',
    description: `Acronis Advanced Backup - Workstation (1 Year Subscription) with Active Protection`,
    price: 135,
    unit: 'per device',
    sortOrder: 1,
  },
  {
    name: 'Advanced Backup - Workstation (2 Year)',
    sku: 'ACRONIS-ADV-WKST-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Workstation (2 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Workstation (2 Year Subscription) with Active Protection`,
    price: 135,
    unit: 'per device',
    sortOrder: 2,
  },
  {
    name: 'Advanced Backup - Workstation (3 Year)',
    sku: 'ACRONIS-ADV-WKST-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Workstation (3 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Workstation (3 Year Subscription) with Active Protection`,
    price: 113,
    unit: 'per device',
    sortOrder: 3,
  },
  // VM variants
  {
    name: 'Advanced Backup - VM (Monthly)',
    sku: 'ACRONIS-ADV-VM-MON',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - VM (Monthly) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - VM (Monthly) with Active Protection`,
    price: 270,
    unit: 'per VM',
    sortOrder: 4,
  },
  {
    name: 'Advanced Backup - VM (1 Year)',
    sku: 'ACRONIS-ADV-VM-1Y',
    shortDesc: 'Acronis Advanced Backup - VM (1 Year Subscription) with Active Protection',
    description: `Acronis Advanced Backup - VM (1 Year Subscription) with Active Protection`,
    price: 248,
    unit: 'per VM',
    sortOrder: 5,
  },
  {
    name: 'Advanced Backup - VM (2 Year)',
    sku: 'ACRONIS-ADV-VM-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - VM (2 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - VM (2 Year Subscription) with Active Protection`,
    price: 225,
    unit: 'per VM',
    sortOrder: 6,
  },
  {
    name: 'Advanced Backup - VM (3 Year)',
    sku: 'ACRONIS-ADV-VM-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - VM (3 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - VM (3 Year Subscription) with Active Protection`,
    price: 203,
    unit: 'per VM',
    sortOrder: 7,
  },
  // Server variants
  {
    name: 'Advanced Backup - Server (Monthly)',
    sku: 'ACRONIS-ADV-SVR-MON',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Server (Monthly) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Server (Monthly) with Active Protection`,
    price: 810,
    unit: 'per server',
    sortOrder: 8,
  },
  {
    name: 'Advanced Backup - Server (1 Year)',
    sku: 'ACRONIS-ADV-SVR-1Y',
    shortDesc: 'Acronis Advanced Backup - Server (1 Year Subscription) with Active Protection',
    description: `Acronis Advanced Backup - Server (1 Year Subscription) with Active Protection`,
    price: 720,
    unit: 'per server',
    sortOrder: 9,
  },
  {
    name: 'Advanced Backup - Server (2 Year)',
    sku: 'ACRONIS-ADV-SVR-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Server (2 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Server (2 Year Subscription) with Active Protection`,
    price: 630,
    unit: 'per server',
    sortOrder: 10,
  },
  {
    name: 'Advanced Backup - Server (3 Year)',
    sku: 'ACRONIS-ADV-SVR-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Server (3 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Server (3 Year Subscription) with Active Protection`,
    price: 540,
    unit: 'per server',
    sortOrder: 11,
  },
  // Virtual Host variants
  {
    name: 'Advanced Backup - Virtual Host (1 Year)',
    sku: 'ACRONIS-ADV-VH-1Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Virtual Host (1 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Virtual Host (1 Year Subscription) with Active Protection`,
    price: 27900,
    unit: 'per virtual host',
    sortOrder: 12,
  },
  {
    name: 'Advanced Backup - Virtual Host (2 Year)',
    sku: 'ACRONIS-ADV-VH-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Virtual Host (2 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Virtual Host (2 Year Subscription) with Active Protection`,
    price: 22410,
    unit: 'per virtual host',
    sortOrder: 13,
  },
  {
    name: 'Advanced Backup - Virtual Host (3 Year)',
    sku: 'ACRONIS-ADV-VH-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Virtual Host (3 Year Subscription) with Active Protection',
    description: `Acronis Cyber Protect Advanced Backup - Virtual Host (3 Year Subscription) with Active Protection`,
    price: 17910,
    unit: 'per virtual host',
    sortOrder: 14,
  },
  // Office 365 Mailbox variants
  {
    name: 'Advanced Backup - Office 365 Mailbox (Monthly)',
    sku: 'ACRONIS-ADV-O365-MON',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (Monthly)',
    description: `Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (Monthly)`,
    price: 90,
    unit: 'per mailbox',
    sortOrder: 15,
  },
  {
    name: 'Advanced Backup - Office 365 Mailbox (1 Year)',
    sku: 'ACRONIS-ADV-O365-1Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (1 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (1 Year Subscription)`,
    price: 81,
    unit: 'per mailbox',
    sortOrder: 16,
  },
  {
    name: 'Advanced Backup - Office 365 Mailbox (2 Year)',
    sku: 'ACRONIS-ADV-O365-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (2 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (2 Year Subscription)`,
    price: 72,
    unit: 'per mailbox',
    sortOrder: 17,
  },
  {
    name: 'Advanced Backup - Office 365 Mailbox (3 Year)',
    sku: 'ACRONIS-ADV-O365-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (3 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Office 365 Mailbox (3 Year Subscription)`,
    price: 63,
    unit: 'per mailbox',
    sortOrder: 18,
  },
  // Mobile Device variants
  {
    name: 'Advanced Backup - Mobile Device (Monthly)',
    sku: 'ACRONIS-ADV-MOB-MON',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Mobile Device (Monthly)',
    description: `Acronis Cyber Protect Advanced Backup - Mobile Device (Monthly)`,
    price: 68,
    unit: 'per device',
    sortOrder: 19,
  },
  {
    name: 'Advanced Backup - Mobile Device (1 Year)',
    sku: 'ACRONIS-ADV-MOB-1Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Mobile Device (1 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Mobile Device (1 Year Subscription)`,
    price: 63,
    unit: 'per device',
    sortOrder: 20,
  },
  {
    name: 'Advanced Backup - Mobile Device (2 Year)',
    sku: 'ACRONIS-ADV-MOB-2Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Mobile Device (2 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Mobile Device (2 Year Subscription)`,
    price: 59,
    unit: 'per device',
    sortOrder: 21,
  },
  {
    name: 'Advanced Backup - Mobile Device (3 Year)',
    sku: 'ACRONIS-ADV-MOB-3Y',
    shortDesc: 'Acronis Cyber Protect Advanced Backup - Mobile Device (3 Year Subscription)',
    description: `Acronis Cyber Protect Advanced Backup - Mobile Device (3 Year Subscription)`,
    price: 54,
    unit: 'per device',
    sortOrder: 22,
  },
];

// Addons from Excel
const addons = [
  {
    name: 'Backup Server Setup',
    description: 'Backup Server Setup (addon)',
    price: 29250,
    unit: 'per install',
  },
  {
    name: 'Backup NAS Setup',
    description: 'Backup NAS Setup (addon)',
    price: 15750,
    unit: 'per install',
  },
  {
    name: 'Windows 2019 Standard Edition for Backup Server',
    description: 'Windows 2019 Standard Edition for Backup Server (main and addon)',
    price: 540,
    unit: 'per 2 core',
  },
  {
    name: 'Backup Cloud Storage',
    description: 'Backup Cloud Storage (main and addon)',
    price: 5625,
    unit: 'per TB',
  },
  {
    name: 'Managed Backup Services - Cloud Storage',
    description: 'Managed Backup Services - Cloud Storage (addon)',
    price: 1170,
    unit: 'per TB',
  },
  {
    name: 'Managed Backup Services - per Virtual Host',
    description: 'Managed Backup Services - per Virtual Host',
    price: 11250,
    unit: 'per virtual host',
  },
  {
    name: 'Managed Backup Services - per Server/VM',
    description: 'Managed Backup Services - per Server/ Virtual Machine',
    price: 270,
    unit: 'per device',
  },
  {
    name: 'Managed Backup Services - per Workstation',
    description: 'Managed Backup Services - per Workstation',
    price: 90,
    unit: 'per device',
  },
  {
    name: 'Managed Backup Services - per Office 365',
    description: 'Managed Backup Services - per Office 365',
    price: 23,
    unit: 'per mailbox',
  },
];

async function main() {
  console.log('🚀 Starting Acronis Backup Advanced SPLA import...\n');

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
    where: { slug: 'acronis-backup-advanced-spla' },
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
  console.log('\n📦 Creating Acronis Backup Advanced SPLA product...\n');
  
  const product = await prisma.product.create({
    data: {
      name: 'Acronis Backup Advanced SPLA for Partners - IN Backup',
      slug: 'acronis-backup-advanced-spla',
      categoryId: category.id,
      
      shortDescription: 'XcellBackup | Acronis Advanced Backup Subscription Licenses. Advanced backup solutions for workstations, VMs, servers, virtual hosts, Office 365 mailboxes, and mobile devices.',
      
      description: `XcellBackup | Acronis Advanced Backup Subscription Licenses

Advanced backup solutions with Active Protection for:
- Workstations (Monthly, 1 Year, 2 Year, 3 Year subscriptions)
- Virtual Machines (Monthly, 1 Year, 2 Year, 3 Year subscriptions)
- Servers (Monthly, 1 Year, 2 Year, 3 Year subscriptions)
- Virtual Hosts (1 Year, 2 Year, 3 Year subscriptions)
- Office 365 Mailboxes (Monthly, 1 Year, 2 Year, 3 Year subscriptions)
- Mobile Devices (Monthly, 1 Year, 2 Year, 3 Year subscriptions)

Managed Backup Services:
- Cloud Storage
- Per Virtual Host
- Per Server/ Virtual Machine
- Per Workstation
- Per Office 365

Contract Terms:
- Advance Payment with One Time Setup Charges
- 30 days Advanced Termination Notice required upon completion subscription term
- Delivery: Within 2 working days from PO + Advance Payment Receipt
- Overage Billing will be billed as actuals
- Plus 18% Good & Services Tax (GST) applicable on above. No TDS to be deducted on Software Licenses`,
      
      basePrice: 54, // Lowest variant price
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
          shortDesc: variant.shortDesc,
          description: variant.description,
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

  // 5. Create addons
  console.log('\n📦 Creating addons...\n');
  
  for (let i = 0; i < addons.length; i++) {
    const addon = addons[i];
    
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
  console.log(`  - ${addons.length} Addons Created`);
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
