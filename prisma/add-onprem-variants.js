const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  console.log('Adding On-Premise variants to Connect Cloud product...');

  // Find the connect-cloud product
  const product = await prisma.product.findFirst({
    where: { slug: 'connect-cloud' }
  });

  if (!product) {
    console.log('Product not found!');
    return;
  }

  console.log(`Found product: ${product.name}`);

  // On-Premise Variants - using correct Prisma schema fields
  const onPremiseVariants = [
    {
      name: 'Stream OS - 32 Channel',
      sku: 'VSAAS-ONPREM-STREAM-32',
      description: 'Stream OS for up to 32 channels - One Time. Connects up to 32 channels, Cloud VMS with Live & Playback, Admin Panel, Desktop/Mobile/Web access',
      price: 3680,
      sortOrder: 0,
      type: 'onprem',
      billingType: 'one_time'
    },
    {
      name: 'Stream OS - 64 Channel',
      sku: 'VSAAS-ONPREM-STREAM-64',
      description: 'Stream OS for up to 64 channels - One Time. Connects up to 64 channels, Cloud VMS with Live & Playback, Admin Panel',
      price: 3680,
      sortOrder: 1,
      type: 'onprem',
      billingType: 'one_time'
    },
    {
      name: 'Stream OS - 128 Channel',
      sku: 'VSAAS-ONPREM-STREAM-128',
      description: 'Stream OS for up to 128 channels - One Time. Connects up to 128 channels, Cloud VMS with Live & Playback, Admin Panel',
      price: 3680,
      sortOrder: 2,
      type: 'onprem',
      billingType: 'one_time'
    },
    {
      name: 'AI-Box',
      sku: 'VSAAS-ONPREM-AIBOX',
      description: 'AI-Box for on-prem AI Analytics - One Time. Enables on-prem AI Analytics, 3 year warranty',
      price: 138000,
      sortOrder: 4,
      type: 'onprem',
      billingType: 'one_time'
    },
    {
      name: 'AI Licenses',
      sku: 'VSAAS-ONPREM-AI-LICENSE',
      description: 'AI Licenses for on-prem AI-Box - One Time',
      price: 229908,
      sortOrder: 5,
      type: 'onprem',
      billingType: 'one_time'
    },
    {
      name: 'Cyber+ Pack (Stream OS) - Annual',
      sku: 'VSAAS-ONPREM-CYBER-STREAM',
      description: '1 year Cyber Security Pack for Stream OS. Latest features/ cyber security updates',
      price: 644,
      sortOrder: 6,
      type: 'onprem',
      billingType: 'recurring'
    },
  ];

  for (const variant of onPremiseVariants) {
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        sortOrder: variant.sortOrder,
        isActive: true,
        type: variant.type,
        billingType: variant.billingType,
        attributes: {
          type: variant.type,
          billingType: variant.billingType,
          description: variant.description
        }
      }
    });
    console.log(`Created variant: ${variant.name} - ₹${variant.price}`);
  }

  console.log('\nOn-Premise variants added successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
