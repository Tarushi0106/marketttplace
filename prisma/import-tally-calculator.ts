/**
 * Import Tally Cloud Server Calculator from Excel
 * 
 * Creates ONE Product "Tally Cloud Server" with:
 * - Basic tab: Short description, Long description, Features
 * - Variants tab: 9 variants (one per server plan) with recurring billing
 * - Each variant has Monthly, Quarterly, Semi-Annual, Annual pricing
 * - Customer prices from Excel for each billing cycle
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tally Cloud Server Plans from Excel - these will be VARIANTS
const serverPlans = [
  {
    name: 'Cloud Multi-Tenant',
    slug: 'tally-cloud-multi-tenant',
    shortDesc: 'For 1-2 Users - Entry Level Tally Cloud',
    users: '1-2',
    serverType: 'Multi-Tenant',
    diskSpace: '10 GB',
    memory: 'Shared',
    vcpu: 'Shared',
    prices: {
      monthly: 10242,
      quarterly: 29189.70,      // 5% savings
      semiAnnual: 60837.48,    // 7.5% savings
      annual: 110613.60,       // 10% savings
    },
    setupFeeUSD: 49,
  },
  {
    name: 'Private Cloud Lite',
    slug: 'tally-private-cloud-lite',
    shortDesc: 'For 3-4 Users - Private Cloud Entry',
    users: '3-4',
    serverType: 'G3.4 GB',
    diskSpace: '100 GB',
    memory: '4 GB',
    vcpu: '2 vCPU',
    prices: {
      monthly: 11565,
      quarterly: 32960.25,
      semiAnnual: 64185.75,
      annual: 124902,
    },
    setupFeeUSD: 49,
  },
  {
    name: 'Private Cloud X Small',
    slug: 'tally-private-cloud-x-small',
    shortDesc: 'For 5 Users - Small Team Server',
    users: '5',
    serverType: 'G3.6 GB',
    diskSpace: '125 GB',
    memory: '6 GB',
    vcpu: '4 vCPU',
    prices: {
      monthly: 12015,
      quarterly: 34242.75,
      semiAnnual: 66683.25,
      annual: 129762,
    },
    setupFeeUSD: 99,
  },
  {
    name: 'Private Cloud Small',
    slug: 'tally-private-cloud-small',
    shortDesc: 'For 10 Users - Growing Business Server',
    users: '10',
    serverType: 'G3.8 GB',
    diskSpace: '150 GB',
    memory: '12 GB',
    vcpu: '6 vCPU',
    prices: {
      monthly: 13950,
      quarterly: 39757.50,
      semiAnnual: 77422.50,
      annual: 150660,
    },
    setupFeeUSD: 99,
  },
  {
    name: 'Private Cloud Medium',
    slug: 'tally-private-cloud-medium',
    shortDesc: 'For 11-15 Users - Medium Business Server',
    users: '11-15',
    serverType: 'G3.16 GB',
    diskSpace: '200 GB',
    memory: '16 GB',
    vcpu: '8 vCPU',
    prices: {
      monthly: 18360,
      quarterly: 52326,
      semiAnnual: 101898,
      annual: 198288,
    },
    setupFeeUSD: 99,
  },
  {
    name: 'Private Cloud X Large',
    slug: 'tally-private-cloud-x-large',
    shortDesc: 'For 16-20 Users - Large Team Server',
    users: '16-20',
    serverType: 'G3.32 GB',
    diskSpace: '300 GB',
    memory: '32 GB',
    vcpu: '12 vCPU',
    prices: {
      monthly: 26370,
      quarterly: 75154.50,
      semiAnnual: 146353.50,
      annual: 284796,
    },
    setupFeeUSD: 149,
  },
  {
    name: 'Private Cloud XX Large',
    slug: 'tally-private-cloud-xx-large',
    shortDesc: 'For 21-30 Users - Enterprise Server',
    users: '21-30',
    serverType: 'G3.48 GB',
    diskSpace: '400 GB',
    memory: '64 GB',
    vcpu: '16 vCPU',
    prices: {
      monthly: 35370,
      quarterly: 100804.50,
      semiAnnual: 196303.50,
      annual: 381996,
    },
    setupFeeUSD: 149,
  },
  {
    name: 'Private Cloud XXX Large (50)',
    slug: 'tally-private-cloud-xxx-large-50',
    shortDesc: 'For 31-50 Users - Large Enterprise Server',
    users: '31-50',
    serverType: 'G3.64 GB',
    diskSpace: '500 GB',
    memory: '64 GB',
    vcpu: '24 vCPU',
    prices: {
      monthly: 42210,
      quarterly: 120298.50,
      semiAnnual: 234265.50,
      annual: 455868,
    },
    setupFeeUSD: 199,
  },
  {
    name: 'Private Cloud XXX Large (75)',
    slug: 'tally-private-cloud-xxx-large-75',
    shortDesc: 'For 51-75 Users - Maximum Capacity Server',
    users: '51-75',
    serverType: 'G3.64 GB',
    diskSpace: '500 GB',
    memory: '128 GB',
    vcpu: '32 vCPU',
    prices: {
      monthly: 70290,
      quarterly: 200326.50,
      semiAnnual: 390109.50,
      annual: 759132,
    },
    setupFeeUSD: 199,
  },
];

// Addons from Excel
const addons = [
  { name: 'TSPlus Enterprise Plus Edition', desc: 'Remote access solution for Tally', unit: 'per user', rate: 180, pricingType: 'RECURRING_MONTHLY' },
  { name: 'TSPlus Enterprise Plus (2FA + Protection)', desc: 'Enhanced security with 2FA', unit: 'per user', rate: 180, pricingType: 'RECURRING_MONTHLY' },
  { name: 'TSPlus Unlimited Users License', desc: 'Unlimited users license', unit: 'per server', rate: 10800, pricingType: 'ONE_TIME' },
  { name: 'Block Storage SSD with Backup', desc: 'Additional SSD storage', unit: 'per GB', rate: 6.30, pricingType: 'RECURRING_MONTHLY' },
  { name: 'XcellDrive File Cloud', desc: 'Cloud file storage', unit: 'per GB', rate: 9, pricingType: 'RECURRING_MONTHLY' },
  { name: 'SQL Server 2019 Web Edition', desc: 'Microsoft SQL Server', unit: 'per 2 core', rate: 2250, pricingType: 'RECURRING_MONTHLY' },
  { name: 'Microsoft Office 2019 Professional', desc: 'Office suite', unit: 'per user', rate: 720, pricingType: 'RECURRING_MONTHLY' },
  { name: 'SSL VPN Client (Fortinet)', desc: 'Secure VPN access', unit: 'per user', rate: 270, pricingType: 'RECURRING_MONTHLY' },
  { name: 'Site-to-Site VPN Tunnel', desc: 'Site-to-site VPN', unit: 'per tunnel', rate: 1800, pricingType: 'RECURRING_MONTHLY' },
  { name: 'Plesk Control Panel Web Pro', desc: 'Web hosting panel (30 domains)', unit: 'per server', rate: 2250, pricingType: 'RECURRING_MONTHLY' },
  { name: 'Managed SysAdmin Gold Plan', desc: 'OS + Web + Mail + Security', unit: 'per server', rate: 3150, pricingType: 'RECURRING_MONTHLY' },
];

async function main() {
  console.log('🚀 Starting Tally Cloud Server import...\n');

  // 1. Find or create category
  let category = await prisma.category.findFirst({
    where: { slug: 'tally-cloud' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Tally Cloud Servers',
        slug: 'tally-cloud',
        description: 'ShaurryaApps Secure Cloud Server - India Cloud',
        icon: 'cloud',
        isActive: true,
        sortOrder: 1,
      },
    });
    console.log('✅ Created category:', category.name);
  } else {
    console.log('✅ Found existing category:', category.name);
  }

  // 2. Delete existing product if exists
  const existingProduct = await prisma.product.findFirst({
    where: { slug: 'tally-cloud-server' },
  });
  
  if (existingProduct) {
    console.log(`⚠️ Deleting existing product...`);
    await prisma.product.delete({ where: { id: existingProduct.id } });
  }

  // 3. Create ONE product with all server plans as variants
  console.log('\n📦 Creating Tally Cloud Server product with variants...\n');
  
  // Create the main product
  const product = await prisma.product.create({
    data: {
      name: 'Tally Cloud Server',
      slug: 'tally-cloud-server',
      categoryId: category.id,
      
      // Basic Tab - Short Description
      shortDescription: 'ShaurryaApps Secure Cloud Server - India Cloud. Choose from multiple server configurations for your Tally hosting needs.',
      
      // Basic Tab - Long Description
      description: `**Tally Cloud Server** - ShaurryaApps Secure Cloud Hosting

Choose from our range of cloud server configurations designed specifically for Tally hosting. All plans include enterprise-grade security, managed services, and 24/7 support.

**All Plans Include:**
- Managed Backup (Full Image Backup) every 8 hours
- Enterprise NextGen Endpoint Detection & Response Security (Acronis Cyber Protect Cloud)
- Enterprise NextGen Firewall in High Availability (Fortinet)
- Managed SysAdmin Services (24 x 7 Support)
- FREE SSL Certificate
- SuperFast SSD Storage
- Unlimited Monthly Data Transfer
- Dedicated IP Address
- Windows Server 2022

**Hosting:** India Cloud (Mumbai) Tier 4 Data Center
**Uptime SLA:** 99.95%

**Available Configurations:**
- Cloud Multi-Tenant: 1-2 Users
- Private Cloud Lite: 3-4 Users
- Private Cloud X Small: 5 Users
- Private Cloud Small: 10 Users
- Private Cloud Medium: 11-15 Users
- Private Cloud X Large: 16-20 Users
- Private Cloud XX Large: 21-30 Users
- Private Cloud XXX Large (50): 31-50 Users
- Private Cloud XXX Large (75): 51-75 Users`,
      
      // Basic Tab - Features
      features: [
        'Multiple Server Configurations',
        'Managed Backup Every 8 Hours',
        'Acronis Cyber Protect Security',
        'Fortinet Firewall (HA)',
        '24 x 7 Support',
        '99.95% Uptime SLA',
        'Windows Server 2022',
        'Unlimited Data Transfer',
        'India Cloud (Mumbai) Tier 4 DC',
      ],
      
      // Specifications
      specifications: {
        dataTransfer: 'Unlimited',
        backup: 'Every 8 hours',
        dedicatedIP: '1',
        storage: 'SSD',
        os: 'Windows Server 2022',
        security: 'Acronis Cyber Protect Cloud',
        firewall: 'Fortinet',
        support: '24 x 7',
        location: 'India - Mumbai Cloud',
        dataCenter: 'Tier 4',
        uptime: '99.95%',
      },
      
      // Pricing - base price is lowest monthly
      basePrice: 10242,
      monthlyPrice: 10242,
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
  
  // 4. Create variants - ONE per server plan (not per billing cycle)
  console.log('\n📦 Creating variants (server plans)...\n');
  
  for (let i = 0; i < serverPlans.length; i++) {
    const plan = serverPlans[i];
    
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: plan.name,
        sku: `TALLY-${plan.slug.toUpperCase()}`,
        price: plan.prices.monthly, // Base monthly price
        compareAtPrice: plan.prices.monthly,
        
        // Store all pricing and description in attributes
        attributes: {
          // Server specs
          users: plan.users,
          serverType: plan.serverType,
          diskSpace: plan.diskSpace,
          memory: plan.memory,
          vcpu: plan.vcpu,
          setupFee: plan.setupFeeUSD,
          
          // All billing cycle prices
          monthlyPrice: plan.prices.monthly,
          quarterlyPrice: plan.prices.quarterly,
          semiAnnualPrice: plan.prices.semiAnnual,
          annualPrice: plan.prices.annual,
          
          // Savings percentages
          quarterlySavings: 5,
          semiAnnualSavings: 7.5,
          annualSavings: 10,
          
          // Description
          shortDesc: plan.shortDesc,
          description: `**${plan.name}** - ${plan.shortDesc}

**Server Specifications:**
- **Users:** ${plan.users}
- **Server Type:** ${plan.serverType}
- **Disk Space:** ${plan.diskSpace}
- **Memory:** ${plan.memory}
- **vCPU:** ${plan.vcpu}

**Pricing Options:**
- Monthly: ₹${plan.prices.monthly.toLocaleString()}/month
- Quarterly: ₹${plan.prices.quarterly.toLocaleString()} (Save 5%)
- Semi-Annual: ₹${plan.prices.semiAnnual.toLocaleString()} (Save 7.5%)
- Annual: ₹${plan.prices.annual.toLocaleString()} (Save 10%)`,
        },
        
        isDefault: i === 0, // First variant is default
        isActive: true,
        sortOrder: i,
      },
    });
    
    console.log(`✅ Variant: ${plan.name}`);
    console.log(`   Users: ${plan.users}`);
    console.log(`   Monthly: ₹${plan.prices.monthly.toLocaleString()}`);
    console.log(`   Quarterly: ₹${plan.prices.quarterly.toLocaleString()} (5% savings)`);
    console.log(`   Semi-Annual: ₹${plan.prices.semiAnnual.toLocaleString()} (7.5% savings)`);
    console.log(`   Annual: ₹${plan.prices.annual.toLocaleString()} (10% savings)`);
    
    // Create recurring price record for this variant
    await prisma.productRecurringPrice.create({
      data: {
        productId: product.id,
        variantId: variant.id, // Link to this specific variant
        monthlyPrice: plan.prices.monthly,
        quarterlyPrice: plan.prices.quarterly,
        semiAnnualPrice: plan.prices.semiAnnual,
        yearlyPrice: plan.prices.annual,
        quarterlySavings: 5,
        yearlySavings: 10,
        currency: 'INR',
        isActive: true,
      },
    });
    
    console.log(`   └─ Created recurring price record for variant`);
    console.log('');
  }
  
  // 6. Create product configs
  const configs = [
    { name: 'Users', value: 'Varies by plan', type: 'USERS' },
    { name: 'Server Type', value: 'Varies by plan', type: 'SERVER' },
    { name: 'Disk Space', value: '10 GB - 500 GB', type: 'STORAGE' },
    { name: 'Memory', value: 'Shared - 128 GB', type: 'RAM' },
    { name: 'vCPU', value: 'Shared - 32 vCPU', type: 'CPU' },
    { name: 'Data Transfer', value: 'Unlimited', type: 'BANDWIDTH' },
    { name: 'Backup', value: 'Every 8 hours', type: 'BACKUP' },
    { name: 'Storage Type', value: 'SSD', type: 'STORAGE' },
    { name: 'Operating System', value: 'Windows Server 2022', type: 'OS' },
    { name: 'Security', value: 'Acronis Cyber Protect Cloud', type: 'SECURITY' },
    { name: 'Firewall', value: 'Fortinet (HA)', type: 'NETWORK' },
    { name: 'Support', value: '24 x 7', type: 'SUPPORT' },
  ];
  
  for (const config of configs) {
    await prisma.productConfig.create({
      data: {
        productId: product.id,
        name: config.name,
        displayName: config.name,
        configType: config.type,
        configGroup: 'Server Configuration',
        inputType: 'SELECT',
        isRequired: false,
        sortOrder: configs.indexOf(config),
      },
    });
  }
  
  // 7. Create product addons
  for (const addon of addons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        description: addon.desc,
        price: addon.rate,
        pricingType: addon.pricingType,
        isActive: true,
        sortOrder: addons.indexOf(addon),
      },
    });
  }

  console.log('\n✨ Import completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - 1 Product: Tally Cloud Server`);
  console.log(`  - ${serverPlans.length} Variants (server plans)`);
  console.log(`  - ${serverPlans.length} Recurring Price Records (one per variant)`);
  console.log(`  - ${configs.length} Product Configurations`);
  console.log(`  - ${addons.length} Product Addons`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
