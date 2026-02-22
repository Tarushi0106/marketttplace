/**
 * Import VSaaS On Premise Products from Excel
 * 
 * Adds variants to existing VSaaS On Premise product
 * All variants use ONE_TIME billing type
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// VSaaS On Premise Variants from Excel
const vsaasOnPremiseVariants = [
  {
    name: 'Stream OS - 32 Channel',
    sku: 'VSAAS-ONPREM-STREAM-32',
    shortDesc: 'Stream OS for up to 32 channels - One Time (per camera)',
    description: `**Stream OS - 32 Channel Capex**

- Connects up to 32 channels
- Cloud VMS with Live & Playback
- Admin Panel for device/user management
- 1 x Core Lite - Desktop application
- 1x Core Multi - Desktop application
- 5 x Web View access
- 5 x Mobile App access (Android & iOS)
- Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
- Reports & Dashboard
- Logs & Audit Trail
- Zygal Cyber+ Pack for 3 years included`,
    price: 3680,
    unit: 'per camera',
    sortOrder: 0,
  },
  {
    name: 'Stream OS - 64 Channel',
    sku: 'VSAAS-ONPREM-STREAM-64',
    shortDesc: 'Stream OS for up to 64 channels - One Time (per camera)',
    description: `**Stream OS - 64 Channel Capex**

- Connects up to 64 channels
- Cloud VMS with Live & Playback
- Admin Panel for device/user management
- 1 x Core Lite - Desktop application
- 1x Core Multi - Desktop application
- 5 x Web View access
- 5 x Mobile App access (Android & iOS)
- Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
- Reports & Dashboard
- Logs & Audit Trail
- Zygal Cyber+ Pack for 3 years included`,
    price: 3680,
    unit: 'per camera',
    sortOrder: 1,
  },
  {
    name: 'Stream OS - 128 Channel',
    sku: 'VSAAS-ONPREM-STREAM-128',
    shortDesc: 'Stream OS for up to 128 channels - One Time (per camera)',
    description: `**Stream OS - 128 Channel Capex**

- Connects up to 128 channels
- Cloud VMS with Live & Playback
- Admin Panel for device/user management
- 1 x Core Lite - Desktop application
- 1x Core Multi - Desktop application
- 5 x Web View access
- 5 x Mobile App access (Android & iOS)
- Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
- Reports & Dashboard
- Logs & Audit Trail
- Zygal Cyber+ Pack for 3 years included`,
    price: 3680,
    unit: 'per camera',
    sortOrder: 2,
  },
  {
    name: 'Stream OS - 256 Channel',
    sku: 'VSAAS-ONPREM-STREAM-256',
    shortDesc: 'Stream OS for up to 256 channels - One Time (per camera)',
    description: `**Stream OS - 256 Channel Capex**

- Connects up to 256 channels
- Cloud VMS with Live & Playback
- Admin Panel for device/user management
- 1 x Core Lite - Desktop application
- 1x Core Multi - Desktop application
- 5 x Web View access
- 5 x Mobile App access (Android & iOS)
- Device Health Check (Cameras/NVRs/HDD/SD Card etc.)
- Reports & Dashboard
- Logs & Audit Trail
- Zygal Cyber+ Pack for 3 years included`,
    price: 3680,
    unit: 'per camera',
    sortOrder: 3,
  },
  {
    name: 'AI-Box',
    sku: 'VSAAS-ONPREM-AIBOX',
    shortDesc: 'AI-Box for on-prem AI Analytics - One Time (per 16 credits)',
    description: `**AI-Box Capex (One Time)**

- Enables on-prem AI Analytics
- 3 year warranty
- Zygal Cyber+ Pack for 3 years included`,
    price: 138000,
    unit: 'per 16 credits',
    sortOrder: 4,
  },
  {
    name: 'AI Licenses',
    sku: 'VSAAS-ONPREM-AI-LICENSE',
    shortDesc: 'AI Licenses for on-prem AI-Box - One Time (per 16 credits)',
    description: `**AI Licenses Capex (One Time)**

- AI Licenses for on-prem AI-Box
- License which can be used to enable any AI alerts/ analytics
- Refer to the list of AI Analytics for per channel credit utilization`,
    price: 229908,
    unit: 'per 16 credits',
    sortOrder: 5,
  },
  {
    name: 'Cyber+ Pack (Stream OS) - Annual',
    sku: 'VSAAS-ONPREM-CYBER-STREAM',
    shortDesc: '1 year Cyber Security Pack for Stream OS (per camera)',
    description: `**Cyber + Pack (Stream OS)**

- 1 year Cyber Security Pack for Stream
- Latest features/ cyber security updates OTA
- Secure Mobile and Web access
- End-to-end data protection and encryption support
- TOTP, SSO support
- Secure VPN/ P2P support
- Organizational firewall compatibility support`,
    price: 644,
    unit: 'per camera',
    sortOrder: 6,
  },
  {
    name: 'Cyber+ Pack (AI-Box & AI License) - Annual',
    sku: 'VSAAS-ONPREM-CYBER-AI',
    shortDesc: '1 year Cyber Security Pack for AI-Box (per 16 credits)',
    description: `**Cyber + Pack (AI-Box & AI License)**

- 1 year Cyber Security Pack for AI-Box
- Latest Upgrades of AI Analytics
- Access to new AI Analytics
- Latest features/ cyber security updates OTA
- Secure Mobile and Web access
- End-to-end data protection and encryption support
- TOTP, SSO support
- Secure VPN/ P2P support
- Organizational firewall compatibility support`,
    price: 73600,
    unit: 'per 16 credits',
    sortOrder: 7,
  },
];

async function main() {
  console.log('🚀 Starting VSaaS On Premise variants import...\n');

  // 1. Find existing VSaaS On Premise product
  const existingProduct = await prisma.product.findFirst({
    where: { 
      slug: { contains: 'vsaas-on-prem' } 
    },
    include: { variants: true },
  });

  if (!existingProduct) {
    console.log('❌ No VSaaS On Premise product found. Please create it first in the admin panel.');
    process.exit(1);
  }

  console.log(`✅ Found existing product: ${existingProduct.name} (${existingProduct.variants.length} existing variants)`);

  // 2. Delete existing variants
  if (existingProduct.variants.length > 0) {
    console.log(`⚠️ Deleting ${existingProduct.variants.length} existing variants...`);
    await prisma.productVariant.deleteMany({
      where: { productId: existingProduct.id },
    });
  }

  // 3. Create variants
  console.log('\n📦 Creating variants...\n');
  
  for (let i = 0; i < vsaasOnPremiseVariants.length; i++) {
    const variant = vsaasOnPremiseVariants[i];
    
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

  console.log('\n✨ Import completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Product: ${existingProduct.name}`);
  console.log(`  - ${vsaasOnPremiseVariants.length} Variants Created`);
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
