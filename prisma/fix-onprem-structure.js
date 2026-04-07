const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  try {
    // Find the VSAAS product
    const product = await prisma.product.findFirst({
      where: { slug: 'vsaas' }
    });
    
    if (!product) {
      console.log('VSAAS product not found!');
      return;
    }
    
    console.log('Product ID:', product.id);
    
    // First, let's delete the variants that should be addons
    // AI-Box: cmmxvu9z
    // AI Licenses: cmmxvua8  
    // Cyber+ Pack (Stream OS): cmmxvuag
    const variantsToDelete = [
      'cmmxvu9z', // AI-Box
      'cmmxvua8', // AI Licenses
      'cmmxvuag'  // Cyber+ Pack (Stream OS) - Annual
    ];
    
    console.log('\n--- Deleting variants that should be addons ---');
    for (const idPrefix of variantsToDelete) {
      const variant = await prisma.productVariant.findFirst({
        where: { id: { startsWith: idPrefix } }
      });
      
      if (variant) {
        console.log(`Deleting variant: ${variant.name} (${variant.id})`);
        await prisma.productVariant.delete({ where: { id: variant.id } });
      }
    }
    
    // Now let's create these as addons
    console.log('\n--- Creating addons for On-Premise ---');
    
    // AI-Box addon
    const aiBoxAddon = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'AI-Box Capex (One Time)',
        description: 'Enables on-prem AI Analytics. 3 year warranty. Zygal Cyber+ Pack for 3 years included.',
        price: 138000,
        unit: 'per 16 credits',
        pricingType: 'ONE_TIME',
        isRequired: false,
        group: 'On-Premise Hardware',
        sortOrder: 10
      }
    });
    console.log('Created addon:', aiBoxAddon.name);
    
    // AI Licenses addon
    const aiLicensesAddon = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'AI Licenses Capex (One Time)',
        description: 'AI Licenses for on-prem AI-Box. License which can be used to enable any AI alerts/analytics.',
        price: 229908,
        unit: 'per 16 credits',
        pricingType: 'ONE_TIME',
        isRequired: false,
        group: 'On-Premise Software',
        sortOrder: 11
      }
    });
    console.log('Created addon:', aiLicensesAddon.name);
    
    // Cyber+ Pack (Stream OS) addon
    const cyberPackAddon = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'Cyber+ Pack (Stream OS) - Annual',
        description: '1 year Cyber Security Pack for Stream. Latest features/cyber security updates OTA. Secure Mobile and Web access. End-to-end data protection and encryption support. TOTP, SSO support. Secure VPN/P2P support. Organizational firewall compatibility support.',
        price: 644,
        unit: 'per camera',
        pricingType: 'RECURRING',
        isRequired: false,
        group: 'On-Premise Security',
        sortOrder: 12
      }
    });
    console.log('Created addon:', cyberPackAddon.name);
    
    // Cyber+ Pack (AI-Box & AI License) addon
    const cyberPackAIAddon = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'Cyber+ Pack (AI-Box & AI License) - Annual',
        description: '1 year Cyber Security Pack for AI-Box. Latest Upgrades of AI Analytics. Access to new AI Analytics. Latest features/cyber security updates OTA. Secure Mobile and Web access.',
        price: 73600,
        unit: 'per 16 credits',
        pricingType: 'RECURRING',
        isRequired: false,
        group: 'On-Premise Security',
        sortOrder: 13
      }
    });
    console.log('Created addon:', cyberPackAIAddon.name);
    
    // Setup & Implementation addon
    const setupAddon = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'One Time Setup & Implementation Cost',
        description: 'One-time setup and implementation service',
        price: 46000,
        unit: 'one-time',
        pricingType: 'ONE_TIME',
        isRequired: false,
        group: 'On-Premise Services',
        sortOrder: 14
      }
    });
    console.log('Created addon:', setupAddon.name);
    
    // Now let's verify the remaining variants (should be Stream OS)
    console.log('\n--- Remaining variants (should be Stream OS) ---');
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    });
    
    variants.forEach(v => {
      console.log(`${v.id.substring(0,8)} | ${v.name} | ₹${v.price}`);
    });
    
    // Now let's verify the addons
    console.log('\n--- Addons ---');
    const addons = await prisma.productAddon.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' }
    });
    
    addons.forEach(a => {
      console.log(`${a.id.substring(0,8)} | ${a.name} | ₹${a.price} | ${a.group}`);
    });
    
    console.log('\nDone!');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
