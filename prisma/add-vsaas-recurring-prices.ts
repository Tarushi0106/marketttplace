import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding recurring prices to VSAAS variants...');

  // Find VSAAS Cloud variant
  const vsaasCloud = await prisma.productVariant.findFirst({
    where: {
      name: {
        contains: 'Cloud',
        mode: 'insensitive',
      },
      product: {
        slug: 'vsaas',
      },
    },
  });

  if (!vsaasCloud) {
    console.error('VSAAS Cloud variant not found!');
    return;
  }

  console.log(`Found VSAAS Cloud variant: ${vsaasCloud.id}`);

  // Delete any existing recurring prices for VSAAS Cloud
  await prisma.productRecurringPrice.deleteMany({
    where: { variantId: vsaasCloud.id },
  });

  // Add recurring prices for VSAAS Cloud (monthly billing)
  await prisma.productRecurringPrice.createMany({
    data: [
      {
        productId: vsaasCloud.productId,
        variantId: vsaasCloud.id,
        monthlyPrice: 248.4,
        quarterlyPrice: 700,
        yearlyPrice: 2484,
        biennialPrice: 4500,
        triennialPrice: 6000,
        monthlySetupFee: 0,
        quarterlySetupFee: 0,
        yearlySetupFee: 0,
        biennialSetupFee: 0,
        triennialSetupFee: 0,
        monthlySavings: 0,
        quarterlySavings: 5,
        yearlySavings: 10,
        currency: 'USD',
        isActive: true,
      },
    ],
  });

  console.log('Added recurring prices for VSAAS Cloud');

  // Find VSAAS On-Premise variant
  const vsaasOnPremise = await prisma.productVariant.findFirst({
    where: {
      OR: [
        { name: { contains: 'On-Premise', mode: 'insensitive' } },
        { name: { contains: 'On Premise', mode: 'insensitive' } },
        { name: { contains: 'OnPrem', mode: 'insensitive' } },
      ],
      product: {
        slug: 'vsaas',
      },
    },
  });

  if (!vsaasOnPremise) {
    console.error('VSAAS On-Premise variant not found!');
    return;
  }

  console.log(`Found VSAAS On-Premise variant: ${vsaasOnPremise.id}`);

  // Delete any existing recurring prices for VSAAS On-Premise
  await prisma.productRecurringPrice.deleteMany({
    where: { variantId: vsaasOnPremise.id },
  });

  // Add recurring prices for VSAAS On-Premise (with optional support plans)
  await prisma.productRecurringPrice.createMany({
    data: [
      {
        productId: vsaasOnPremise.productId,
        variantId: vsaasOnPremise.id,
        monthlyPrice: 4500,
        quarterlyPrice: 12600,
        yearlyPrice: 43200,
        biennialPrice: 80000,
        triennialPrice: 110000,
        monthlySetupFee: 0,
        quarterlySetupFee: 0,
        yearlySetupFee: 0,
        biennialSetupFee: 0,
        triennialSetupFee: 0,
        monthlySavings: 0,
        quarterlySavings: 5,
        yearlySavings: 10,
        currency: 'USD',
        isActive: true,
      },
    ],
  });

  console.log('Added recurring prices for VSAAS On-Premise');

  console.log('\n=== VSAAS Cloud Recurring Prices ===');
  console.log(JSON.stringify(cloudWithPrices?.recurringPrices, null, 2));

  console.log('\n=== VSAAS On-Premise Recurring Prices ===');
  console.log(JSON.stringify(onPremiseWithPrices?.recurringPrices, null, 2));

  console.log('\n✅ Successfully added recurring prices to VSAAS variants!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
