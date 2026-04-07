const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update VSAAS main product description
  await prisma.product.updateMany({
    where: { slug: 'vsaas' },
    data: {
      shortDescription: 'Video Surveillance as a Service',
      description: 'Complete video surveillance solution with cloud and on-premise deployment options.'
    }
  });

  // Update VSAAS Cloud product
  await prisma.product.updateMany({
    where: { slug: 'vsaas-cloud' },
    data: {
      shortDescription: 'Cloud video surveillance solution',
      description: 'Complete cloud video surveillance solution with AI features.'
    }
  });

  // Update VSAAS On-Premise product
  await prisma.product.updateMany({
    where: { slug: 'vsaas-on-premise' },
    data: {
      shortDescription: 'On-premise video surveillance solution',
      description: 'Complete on-premise video surveillance solution with AI features.'
    }
  });

  console.log('VSAAS descriptions updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
