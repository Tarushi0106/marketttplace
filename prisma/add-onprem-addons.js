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
    
    // Check if addons already exist
    const existingAddons = await prisma.productAddon.findMany({
      where: { productId: product.id }
    });
    
    console.log('Existing addons:', existingAddons.length);
    
    // Cyber+ Pack (Stream OS) addon - Annual
    const cyberPackStream = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'Cyber+ Pack (Stream OS) - Annual',
        description: '1 year Cyber Security Pack for Stream. Latest features/cyber security updates OTA. Secure Mobile and Web access. End-to-end data protection and encryption support. TOTP, SSO support. Secure VPN/P2P support.',
        price: 644,
        unit: 'per camera',
        pricingType: 'RECURRING_YEARLY',
        isRequired: false,
        group: 'On-Premise Security',
        sortOrder: 12
      }
    });
    console.log('Created addon:', cyberPackStream.name);
    
    // Cyber+ Pack (AI-Box & AI License) addon - Annual
    const cyberPackAI = await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: 'Cyber+ Pack (AI-Box & AI License) - Annual',
        description: '1 year Cyber Security Pack for AI-Box. Latest Upgrades of AI Analytics. Access to new AI Analytics. Latest features/cyber security updates OTA. Secure Mobile and Web access.',
        price: 73600,
        unit: 'per 16 credits',
        pricingType: 'RECURRING_YEARLY',
        isRequired: false,
        group: 'On-Premise Security',
        sortOrder: 13
      }
    });
    console.log('Created addon:', cyberPackAI.name);
    
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
    
    // Verify the addons
    console.log('\n--- All Addons ---');
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
