/**
 * Update Tally Cloud Server Product Specifications
 * 
 * This script updates the specifications for each variant of Tally Cloud Server
 * based on the Excel data.
 * 
 * Run with: npx tsx prisma/update-tally-specifications.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Variant specifications from Excel
const variantSpecifications = [
  {
    name: 'Cloud Multi-Tenant',
    users: 'For 1-2 Users',
    specifications: {
      'Server Type': 'Multi-Tenant',
      'Disk Space': '10 GB',
      'Virtual Memory': 'Multi-Tenant',
      'Virtual CPU': 'Multi-Tenant',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Lite',
    users: 'For 3-4 Users',
    specifications: {
      'Server Type': 'G3.4 GB',
      'Disk Space': '100 GB',
      'Virtual Memory': '4 GB',
      'Virtual CPU': '2 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud X Small',
    users: 'For 5 Users',
    specifications: {
      'Server Type': 'G3.6 GB',
      'Disk Space': '125 GB',
      'Virtual Memory': '6 GB',
      'Virtual CPU': '4 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Small',
    users: 'For 10 Users',
    specifications: {
      'Server Type': 'G3.8 GB',
      'Disk Space': '150 GB',
      'Virtual Memory': '12 GB',
      'Virtual CPU': '6 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud Medium',
    users: 'For 11-15 Users',
    specifications: {
      'Server Type': 'G3.16 GB',
      'Disk Space': '200 GB',
      'Virtual Memory': '16 GB',
      'Virtual CPU': '8 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud X Large',
    users: 'For 16-20 Users',
    specifications: {
      'Server Type': 'G3.32 GB',
      'Disk Space': '300 GB',
      'Virtual Memory': '32 GB',
      'Virtual CPU': '12 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XX Large',
    users: 'For 21-30 Users',
    specifications: {
      'Server Type': 'G3.48 GB',
      'Disk Space': '400 GB',
      'Virtual Memory': '64 GB',
      'Virtual CPU': '16 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XXX Large',
    users: 'For 31-50 Users',
    specifications: {
      'Server Type': 'G3.64 GB',
      'Disk Space': '500 GB',
      'Virtual Memory': '64 GB',
      'Virtual CPU': '24 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
  {
    name: 'Private Cloud XXX Large (75 Users)',
    users: 'For 51-75 Users',
    specifications: {
      'Server Type': 'G3.64 GB',
      'Disk Space': '500 GB',
      'Virtual Memory': '128 GB',
      'Virtual CPU': '32 vCPU',
      'Monthly Data Transfer': 'Unlimited',
      'Managed Backup': 'Every 8 hrs',
      'Dedicated IP Address': '1',
      'Storage Type': 'SSD',
      'Operating System': 'Windows Server 2022',
      'Security': 'Acronis Cyber Protect Cloud',
      'Firewall': 'Fortinet',
      'Support': '24 x 7 Support',
    },
  },
];

async function main() {
  console.log('Updating Tally Cloud Server variant specifications...\n');

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
      // Get current attributes
      const currentAttributes = (variant.attributes as Record<string, any>) || {};
      
      // Merge specifications into attributes (preserving existing billing data)
      const updatedAttributes = {
        ...currentAttributes,
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
      console.log(`  Specifications: ${JSON.stringify(specData.specifications, null, 2).split('\n').join('\n  ')}`);
    } else {
      console.log(`No matching specifications found for variant: ${variant.name}`);
    }
  }

  console.log('\n✅ Variant specifications updated successfully!');
}

main()
  .catch((e) => {
    console.error('Error updating specifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
