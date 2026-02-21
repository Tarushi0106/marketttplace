/**
 * Import Software License Addons from Excel
 * 
 * This script imports the Software License addons for Tally Cloud Server products
 * Addons include: TSPlus, Block Storage, SQL Server, Microsoft Office, VPN, etc.
 * 
 * Run with: npx ts-node prisma/import-software-license-addons.ts
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

// Software License addons from Excel with their units and rates
const softwareLicenseAddons = [
  {
    name: 'TSPlus Enterprise Plus Edition',
    description: 'Remote desktop access solution for multiple users',
    price: 180,
    unit: 'per user',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'TSPlus Enterprise Plus Edition (2FA + Ult Protection)',
    description: 'Remote desktop access with two-factor authentication and ultimate protection',
    price: 180,
    unit: 'per user',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'TSPlus Enterprise Edition Unlimited Users License',
    description: 'Unlimited users license for TSPlus Enterprise Edition',
    price: 10800,
    unit: 'per server',
    pricingType: 'ONE_TIME' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Block Storage SSD with Backup',
    description: 'Additional SSD block storage with managed backup',
    price: 6.3,
    unit: 'per GB',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'XcellDrive File Cloud',
    description: 'Cloud file storage solution',
    price: 9,
    unit: 'per GB',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'SQL Server 2019 - Web Edition',
    description: 'Microsoft SQL Server 2019 Web Edition database license',
    price: 2250,
    unit: 'per 2 core',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Microsoft Office 2019 Professional',
    description: 'Microsoft Office 2019 Professional edition license',
    price: 720,
    unit: 'per user',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'SSL VPN Client (Fortinet)',
    description: 'SSL VPN client license for secure remote access',
    price: 270,
    unit: 'per user',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Site-to-Site VPN Tunnel',
    description: 'Site-to-site VPN tunnel configuration and management',
    price: 1800,
    unit: 'per tunnel',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 9,
  },
  {
    name: 'Plesk Control Panel Web Pro Edition (30 domains)',
    description: 'Plesk Web Pro Edition control panel for managing up to 30 domains',
    price: 2250,
    unit: 'per server',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 10,
  },
  {
    name: 'Managed SysAdmin Gold Plan',
    description: 'Managed system administration including OS, Web, Mail, and Security management',
    price: 3150,
    unit: 'per server',
    pricingType: 'RECURRING_MONTHLY' as const,
    isRequired: false,
    isActive: true,
    sortOrder: 11,
  },
];

async function main() {
  console.log('Starting Software License Addons import...\n');

  // Find the Tally Cloud Server product
  const tallyProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: 'tally-cloud-server' },
        { name: { contains: 'Tally Cloud Server' } },
        { name: { contains: 'Tally India Cloud' } },
      ],
    },
  });

  if (!tallyProduct) {
    console.log('Tally Cloud Server product not found. Creating it...');
    
    // Find or create the category
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'business-applications' },
          { name: { contains: 'Business' } },
        ],
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Business Applications',
          slug: 'business-applications',
          description: 'ERP, accounting, CRM, HRMS, finance & core business software',
          icon: 'briefcase',
          iconBgColor: '#FEF3C7',
          isActive: true,
        },
      });
      console.log(`Created category: ${category.name}`);
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        name: 'Tally Cloud Server',
        slug: 'tally-cloud-server',
        sku: 'TCS-001',
        shortDescription: 'Tally Cloud Server - India Cloud Hosting',
        description: 'Host your Tally application on our secure India Cloud with 99.95% uptime SLA, managed backup, and 24x7 support.',
        productType: 'CONFIGURABLE',
        status: 'ACTIVE',
        categoryId: category.id,
      },
    });
    
    console.log(`Created product: ${newProduct.name} (ID: ${newProduct.id})\n`);
    
    // Now add addons to this product
    for (const addon of softwareLicenseAddons) {
      const createdAddon = await prisma.productAddon.create({
        data: {
          productId: newProduct.id,
          name: addon.name,
          description: addon.description,
          price: addon.price,
          unit: addon.unit,
          pricingType: addon.pricingType,
          isRequired: addon.isRequired,
          isActive: addon.isActive,
          sortOrder: addon.sortOrder,
        },
      });
      console.log(`Created addon: ${createdAddon.name} - Rs ${createdAddon.price} ${createdAddon.unit}`);
    }
  } else {
    console.log(`Found product: ${tallyProduct.name} (ID: ${tallyProduct.id})\n`);
    
    // Check if addons already exist for this product
    const existingAddons = await prisma.productAddon.findMany({
      where: { productId: tallyProduct.id },
    });
    
    if (existingAddons.length > 0) {
      console.log(`Product already has ${existingAddons.length} addons. Deleting them first...`);
      await prisma.productAddon.deleteMany({
        where: { productId: tallyProduct.id },
      });
    }
    
    // Add addons to existing product
    for (const addon of softwareLicenseAddons) {
      const createdAddon = await prisma.productAddon.create({
        data: {
          productId: tallyProduct.id,
          name: addon.name,
          description: addon.description,
          price: addon.price,
          unit: addon.unit,
          pricingType: addon.pricingType,
          isRequired: addon.isRequired,
          isActive: addon.isActive,
          sortOrder: addon.sortOrder,
        },
      });
      console.log(`Created addon: ${createdAddon.name} - Rs ${createdAddon.price} ${createdAddon.unit}`);
    }
  }

  console.log('\n✅ Software License Addons import completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
