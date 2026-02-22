/**
 * Import Acronis Cyber Protect Cloud Products from Excel
 * 
 * Creates new product "Acronis Cyber Protect Cloud" with variants
 * and addon (Backup Storage Subscription)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Acronis Cyber Protect Cloud Variants from Excel
const acronisVariants = [
  // Standard Backup
  {
    name: 'Standard Backup - Workstation',
    sku: 'ACRONIS-PROTECT-STD-WKST',
    shortDesc: 'Acronis Cyber Protect Cloud | Standard Backup - Workstation',
    description: `Acronis Cyber Protect Cloud | Standard Backup - Workstation

Workstations, Servers (Windows, Linux, Mac) backup, Virtual machine backup, File backup, Image backup, Immutable backups, Standard applications backup (Microsoft 365, Google Workspace, Microsoft Exchange, Microsoft SQL), Network Shares backup, Backup to local storage.`,
    price: 115,
    unit: 'per workload',
    sortOrder: 0,
  },
  {
    name: 'Standard Backup - VM',
    sku: 'ACRONIS-PROTECT-STD-VM',
    shortDesc: 'Acronis Cyber Protect Cloud | Standard Backup - VM',
    description: `Acronis Cyber Protect Cloud | Standard Backup - VM

Workstations, Servers (Windows, Linux, Mac) backup, Virtual machine backup, File backup, Image backup, Immutable backups, Standard applications backup (Microsoft 365, Google Workspace, Microsoft Exchange, Microsoft SQL), Network Shares backup, Backup to local storage.`,
    price: 368,
    unit: 'per workload',
    sortOrder: 1,
  },
  {
    name: 'Standard Backup - Server',
    sku: 'ACRONIS-PROTECT-STD-SVR',
    shortDesc: 'Acronis Cyber Protect Cloud | Standard Backup - Server',
    description: `Acronis Cyber Protect Cloud | Standard Backup - Server

Workstations, Servers (Windows, Linux, Mac) backup, Virtual machine backup, File backup, Image backup, Immutable backups, Standard applications backup (Microsoft 365, Google Workspace, Microsoft Exchange, Microsoft SQL), Network Shares backup, Backup to local storage.`,
    price: 1104,
    unit: 'per workload',
    sortOrder: 2,
  },
  // Advanced Backup
  {
    name: 'Advanced Backup - Workstation',
    sku: 'ACRONIS-PROTECT-ADV-WKST',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Backup - Workstation',
    description: `Acronis Cyber Protect Cloud | Advanced Backup - Workstation

Microsoft SQL Server and Microsoft Exchange clusters, Oracle DB, SAP HANA, MySQL / MariaDB, Continuous data protection, Off-host data processing, Data protection map.`,
    price: 138,
    unit: 'per workload',
    sortOrder: 3,
  },
  {
    name: 'Advanced Backup - VM',
    sku: 'ACRONIS-PROTECT-ADV-VM',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Backup - VM',
    description: `Acronis Cyber Protect Cloud | Advanced Backup - VM

Microsoft SQL Server and Microsoft Exchange clusters, Oracle DB, SAP HANA, MySQL / MariaDB, Continuous data protection, Off-host data processing, Data protection map.`,
    price: 368,
    unit: 'per workload',
    sortOrder: 4,
  },
  {
    name: 'Advanced Backup - Server',
    sku: 'ACRONIS-PROTECT-ADV-SVR',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Backup - Server',
    description: `Acronis Cyber Protect Cloud | Advanced Backup - Server

Microsoft SQL Server and Microsoft Exchange clusters, Oracle DB, SAP HANA, MySQL / MariaDB, Continuous data protection, Off-host data processing, Data protection map.`,
    price: 1610,
    unit: 'per workload',
    sortOrder: 5,
  },
  // Microsoft 365 & Google Workspace
  {
    name: 'Microsoft 365 Seat',
    sku: 'ACRONIS-PROTECT-M365',
    shortDesc: 'Acronis Cyber Protect Cloud | Microsoft 365 Seat',
    description: `Acronis Cyber Protect Cloud | Microsoft 365 Seat

With unlimited Acronis Hosted Cloud storage.`,
    price: 161,
    unit: 'per workload',
    sortOrder: 6,
  },
  {
    name: 'Google Workspace Seat',
    sku: 'ACRONIS-PROTECT-GWS',
    shortDesc: 'Acronis Cyber Protect Cloud | Google Workspace Seat',
    description: `Acronis Cyber Protect Cloud | Google Workspace Seat

With unlimited Acronis Hosted Cloud storage.`,
    price: 184,
    unit: 'per workload',
    sortOrder: 7,
  },
  // Advanced Security
  {
    name: 'Advanced Security + EDR',
    sku: 'ACRONIS-PROTECT-SEC-EDR',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Security + EDR',
    description: `Acronis Cyber Protect Cloud | Advanced Security + EDR

Anti-Virus & Anti Malware Protection: Local signature-based file detection. URL Filtering, Forensic Backup Centralized backup scanning for malware, Safe recovery, Corporate whitelist, Smart protection plans (integration with CPOC alerts), Endpoint firewall management. #CyberFit Score with Compliance Scorecard & Advanced configuration assessment plus Device Control plus Endpoint Detection and Response (events collection, automated response, security incident management).`,
    price: 112,
    unit: 'per user',
    sortOrder: 8,
  },
  // Advanced Management
  {
    name: 'Remote Monitoring and Management (RMM)',
    sku: 'ACRONIS-PROTECT-RMM',
    shortDesc: 'Acronis Cyber Protect Cloud | Remote Monitoring and Management',
    description: `Acronis Cyber Protect Cloud | Remote Monitoring and Management (RMM)

Vulnerability Assessment with integrated Patch Management Fail-safe patching + Asset management with Software Inventory Drive health monitoring + #CyberFit Score Remote desktop connection to Windows, Macos & Linux workloads File transfer + Monitoring based on machine intelligence, Patch management, HDD health, Software inventory, Fail-safe Patching, Cyber Scripting, AI-based monitoring, Software deployment.`,
    price: 109,
    unit: 'per user',
    sortOrder: 9,
  },
  // Advanced Email Security
  {
    name: 'Advanced Email Security (AES)',
    sku: 'ACRONIS-PROTECT-AES',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Email Security',
    description: `Acronis Cyber Protect Cloud | Advanced Email Security (AES)

Advanced Email Security enables real-time protection for your Microsoft 365 & Gmail mailboxes:
Anti-Malware + Anti-Spam + URL scan in emails + Anti-Phishing DMARC analysis + BEC + ATO + Impersonation protection Attachments Scan + Content disarm & reconstruction + Graph of Trust Anti-phishing, anti-spam protection, anti-malware, APT and zero-day protection, impression (BEC) protection, account takeover (ATO) detection, attachments deep scanning, URL filtering, threat intelligence, incident response services.`,
    price: 161,
    unit: 'per user',
    sortOrder: 10,
  },
  // Advanced DLP
  {
    name: 'Advanced Data Loss Prevention (DLP)',
    sku: 'ACRONIS-PROTECT-DLP',
    shortDesc: 'Acronis Cyber Protect Cloud | Advanced Data Loss Prevention',
    description: `Acronis Cyber Protect Cloud | Advanced Data Loss Prevention (DLP)

Advanced Data Loss Prevention Workloads (Servers, VMs, Workstations, Hosting Servers).`,
    price: 217,
    unit: 'per user',
    sortOrder: 11,
  },
];

// Addon - Backup Storage Subscription
const addons = [
  {
    name: 'Backup Storage Subscription',
    description: 'Acronis Cyber Protect Cloud Backup Storage Subscription (addon)',
    price: 6900,
    unit: 'per TB',
  },
];

async function main() {
  console.log('🚀 Starting Acronis Cyber Protect Cloud import...\n');

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
    where: { slug: 'acronis-cyber-protect-cloud' },
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
  console.log('\n📦 Creating Acronis Cyber Protect Cloud product...\n');
  
  const product = await prisma.product.create({
    data: {
      name: 'Acronis Cyber Protect Cloud',
      slug: 'acronis-cyber-protect-cloud',
      categoryId: category.id,
      
      shortDescription: 'XcellSecure | Cloud Endpoint Security Services - Powered by Acronis Cyber Protect Cloud. Comprehensive cyber protection for workstations, servers, VMs, and cloud workloads.',
      
      description: `XcellSecure | Cloud Endpoint Security Services - Powered by Acronis Cyber Protect Cloud

Comprehensive cyber protection solution for your entire infrastructure.

Standard Backup:
- Workstations, Servers (Windows, Linux, Mac) backup
- Virtual machine backup, File backup, Image backup
- Immutable backups
- Standard applications backup (Microsoft 365, Google Workspace, Microsoft Exchange, Microsoft SQL)
- Network Shares backup, Backup to local storage

Advanced Backup:
- Microsoft SQL Server and Microsoft Exchange clusters
- Oracle DB, SAP HANA, MySQL / MariaDB
- Continuous data protection
- Off-host data processing, Data protection map

Advanced Security + EDR:
- Anti-Virus & Anti Malware Protection
- URL Filtering, Forensic Backup
- Endpoint Detection and Response

Advanced Management (RMM):
- Vulnerability Assessment with Patch Management
- Remote desktop connection
- AI-based monitoring

Advanced Email Security:
- Real-time protection for Microsoft 365 & Gmail
- Anti-Phishing, Anti-Spam, Anti-Malware

Advanced DLP:
- Data Loss Prevention for all workloads

Contract Terms:
- Advance Payment with One Time Setup Charges
- Annual Contract. 30 days Termination Notice required
- Delivery: Within 3-4 working days from PO + Advance Payment Receipt
- Overage Billing will be billed as actuals`,
      
      basePrice: 109, // Lowest variant price
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
  console.log(`  - ${addons.length} Addon Created (Backup Storage Subscription)`);
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
