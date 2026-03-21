import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, fix Cloud Gateway
  console.log('🔍 Looking for Cloud Gateway variant...');

  const cloudGatewayVariant = await prisma.productVariant.findFirst({
    where: {
      name: 'Cloud Gateway',
      product: {
        name: 'VSaaS Cloud'
      }
    },
    include: {
      recurringPrices: true
    }
  });

  if (!cloudGatewayVariant) {
    console.error('❌ Cloud Gateway variant not found!');
    return;
  }

  console.log(`✅ Found Cloud Gateway variant: ${cloudGatewayVariant.id}`);
  console.log(`   Current price: ₹${cloudGatewayVariant.price}`);

  // Delete existing recurring prices first
  await prisma.productRecurringPrice.deleteMany({
    where: { variantId: cloudGatewayVariant.id }
  });
  console.log('   Deleted existing recurring prices');

  // Add new recurring prices - using the correct field names
  await prisma.productRecurringPrice.create({
    data: {
      productId: cloudGatewayVariant.productId,
      variantId: cloudGatewayVariant.id,
      monthlyPrice: 483,
      quarterlyPrice: 1449,    // 483 * 3
      semiAnnualPrice: 2898,   // 483 * 6
      yearlyPrice: 5796,       // 483 * 12
      currency: 'INR'
    }
  });
  console.log('   Added monthlyPrice: ₹483');
  console.log('   Added quarterlyPrice: ₹1449');
  console.log('   Added semiAnnualPrice: ₹2898');
  console.log('   Added yearlyPrice: ₹5796');

  console.log('✅ Successfully added recurring prices to Cloud Gateway!');

  // Now fix Cloud Connect - Platform Fee (missing semi-annual)
  console.log('\n🔍 Looking for Cloud Connect - Platform Fee variant...');

  const platformFeeVariant = await prisma.productVariant.findFirst({
    where: {
      name: 'Cloud Connect - Platform Fee',
      product: {
        name: 'VSaaS Cloud'
      }
    },
    include: {
      recurringPrices: true
    }
  });

  if (!platformFeeVariant) {
    console.error('❌ Cloud Connect - Platform Fee variant not found!');
    return;
  }

  console.log(`✅ Found Cloud Connect - Platform Fee variant: ${platformFeeVariant.id}`);
  console.log(`   Current price: ₹${platformFeeVariant.price}`);

  // Delete existing recurring prices first
  await prisma.productRecurringPrice.deleteMany({
    where: { variantId: platformFeeVariant.id }
  });
  console.log('   Deleted existing recurring prices');

  // Add new recurring prices with semi-annual
  await prisma.productRecurringPrice.create({
    data: {
      productId: platformFeeVariant.productId,
      variantId: platformFeeVariant.id,
      monthlyPrice: 248.40,
      quarterlyPrice: 745.20,     // 248.40 * 3
      semiAnnualPrice: 1490.40,   // 248.40 * 6
      yearlyPrice: 2980.80,       // 248.40 * 12
      currency: 'INR'
    }
  });
  console.log('   Added monthlyPrice: ₹248.40');
  console.log('   Added quarterlyPrice: ₹745.20');
  console.log('   Added semiAnnualPrice: ₹1490.40');
  console.log('   Added yearlyPrice: ₹2980.80');

  console.log('✅ Successfully added recurring prices to Cloud Connect - Platform Fee!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
