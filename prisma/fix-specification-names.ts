/**
 * Update Tally Cloud Server Product Specifications with Correct Names
 * 
 * Specification names should match exactly what's in the Excel under "Item Description" column
 * Note: Removed \r\n from long specification names to avoid JSON parsing issues
 * 
 * Run with: npx tsx prisma/fix-specification-names.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Correct specification names from Excel "Item Description" column
// Note: "Enterprise NextGen Endpoint Detection & Response Security" - removed the \r\n to avoid issues
const variantSpecifications = [
  {
    name: 'Cloud Multi-Tenant',
    specifications: {
      'Server Type': '-',
      'Cloud Server Disk Space': '10 GB',
      'Cloud Server Virtual Memory': 'Multi-Tenant',
      'Cloud Server Virtual CPU': 'Multi-Tenant',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Lite',
    specifications: {
      'Server Type': 'G3.4 GB',
      'Cloud Server Disk Space': '100 GB',
      'Cloud Server Virtual Memory': '4 GB',
      'Cloud Server Virtual CPU': '2 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud X Small',
    specifications: {
      'Server Type': 'G3.6 GB',
      'Cloud Server Disk Space': '125 GB',
      'Cloud Server Virtual Memory': '6 GB',
      'Cloud Server Virtual CPU': '4 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Small',
    specifications: {
      'Server Type': 'G3.8 GB',
      'Cloud Server Disk Space': '150 GB',
      'Cloud Server Virtual Memory': '12 GB',
      'Cloud Server Virtual CPU': '6 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Medium',
    specifications: {
      'Server Type': 'G3.16 GB',
      'Cloud Server Disk Space': '200 GB',
      'Cloud Server Virtual Memory': '16 GB',
      'Cloud Server Virtual CPU': '8 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud X Large',
    specifications: {
      'Server Type': 'G3.32 GB',
      'Cloud Server Disk Space': '300 GB',
      'Cloud Server Virtual Memory': '32 GB',
      'Cloud Server Virtual CPU': '12 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XX Large',
    specifications: {
      'Server Type': 'G3.48 GB',
      'Cloud Server Disk Space': '400 GB',
      'Cloud Server Virtual Memory': '64 GB',
      'Cloud Server Virtual CPU': '16 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XXX Large (50)',
    specifications: {
      'Server Type': 'G3.64 GB',
      'Cloud Server Disk Space': '500 GB',
      'Cloud Server Virtual Memory': '64 GB',
      'Cloud Server Virtual CPU': '24 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XXX Large (75)',
    specifications: {
      'Server Type': 'G3.64 GB',
      'Cloud Server Disk Space': '500 GB',
      'Cloud Server Virtual Memory': '128 GB',
      'Cloud Server Virtual CPU': '32 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup (Full Image Backup)': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'SuperFast Storage': 'SSD',
      'Operating Systems': 'Windows Server 2022',
      'Enterprise NextGen Endpoint Detection & Response Security': 'Acronis Cyber Protect Cloud',
      'Enterprise NextGen Firewall in High Availability': 'Fortinet',
      'Managed SysAdmin Services': '24 x 7 Support',
    },
  },
];

async function main() {
  console.log('Updating Tally Cloud Server variant specifications with correct names...\n');

  // Find the Tally Cloud Server product
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: 'tally-cloud-server' },
        { name: { contains: 'Tally Cloud Server' } },
      ],
    },
    include: {
      variants: true,
    },
  });

  if (!product) {
    console.log('Tally Cloud Server product not found!');
    return;
  }

  console.log(`Found product: ${product.name} (ID: ${product.id})`);
  console.log(`Product has ${product.variants.length} variants\n`);

  // Update each variant's specifications
  for (const variant of product.variants) {
    // Find matching specification data
    const specData = variantSpecifications.find(
      (s) => s.name.toLowerCase() === variant.name.toLowerCase() ||
             s.name.toLowerCase().includes(variant.name.toLowerCase()) ||
             variant.name.toLowerCase().includes(s.name.toLowerCase())
    );

    if (specData) {
      // Get current attributes to preserve billing/pricing data
      const currentAttributes = (variant.attributes as Record<string, any>) || {};
      
      // Extract reserved keys to preserve
      const reservedKeys = [
        'billingType', 'setupFee',
        'monthlyPrice', 'biMonthlyPrice', 'quarterlyPrice', 'fourMonthlyPrice',
        'semiAnnualPrice', 'triAnnualPrice', 'yearlyPrice', 'biennialPrice', 'triennialPrice',
        'monthlySetupFee', 'biMonthlySetupFee', 'quarterlySetupFee', 'fourMonthlySetupFee',
        'semiAnnualSetupFee', 'triAnnualSetupFee', 'yearlySetupFee', 'biennialSetupFee', 'triennialSetupFee'
      ];
      
      const preservedData: Record<string, any> = {};
      for (const key of reservedKeys) {
        if (currentAttributes[key] !== undefined) {
          preservedData[key] = currentAttributes[key];
        }
      }
      
      // Merge preserved data with new specifications
      const updatedAttributes = {
        ...preservedData,
        ...specData.specifications,
      };

      // Update the variant
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          attributes: updatedAttributes,
        },
      });

      console.log(`Updated variant: ${variant.name}`);
      console.log(`  Specifications:`);
      Object.entries(specData.specifications).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
      console.log('');
    } else {
      console.log(`No matching specifications found for variant: ${variant.name}`);
    }
  }

  console.log('✅ Variant specifications updated successfully!');
}

main()
  .catch((e) => {
    console.error('Error updating specifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
