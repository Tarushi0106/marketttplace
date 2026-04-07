/**
 * Import Microsoft 365 Product with Variants and Addons
 * 
 * Product: Microsoft 365 Services
 * Variants: All Microsoft 365 plans from Excel
 * Addons: Mail Migration Services from Excel
 * 
 * Run with: npx tsx prisma/import-microsoft365.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Microsoft 365 Plans as Variants
// Monthly Cost column = monthlyPrice
// Annual Subscription column = yearlyPrice
const variants = [
  // Microsoft 365 SMB (Upto 300 users)
  {
    name: 'Microsoft 365 Business Basic',
    sku: 'M365-BB',
    description: 'Best for businesses that need Microsoft Teams and cloud storage. Desktop versions of Office apps not included. 50 GB Mailbox | OneDrive | Sharepoint | Teams included',
    monthlyPrice: 157.5,
    yearlyPrice: 1795.5,
    isDefault: true,
  },
  {
    name: 'Microsoft 365 Business Standard',
    sku: 'M365-BS',
    description: 'Best for businesses that need Office apps across devices plus business email, cloud file storage, and online meetings and chat.',
    monthlyPrice: 819,
    yearlyPrice: 9336.6,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Business Premium',
    sku: 'M365-BP',
    description: 'Best for businesses that need everything included in Business Standard plus advanced cyberthreat protection and device management.',
    monthlyPrice: 1953,
    yearlyPrice: 22264.2,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Apps for Business',
    sku: 'M365-AB',
    description: 'Best for businesses that need Office apps across devices and cloud file storage. Business email and Microsoft Teams not included.',
    monthlyPrice: 819,
    yearlyPrice: 9336.6,
    isDefault: false,
  },
  // Microsoft 365 Enterprise Plans
  {
    name: 'Microsoft 365 ProPlus',
    sku: 'M365-PP',
    description: 'Full Office Professional License | 1 TB OneDrive Storage | (Email not included)',
    monthlyPrice: 3915,
    yearlyPrice: 42282,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise E1',
    sku: 'M365-E1',
    description: '50 GB Mailbox | 1 TB OneDrive Storage | Skype HD Video Conf | Office Online | Sharepoint Online',
    monthlyPrice: 1350,
    yearlyPrice: 14580,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise E3',
    sku: 'M365-E3',
    description: 'All the features of ProPlus and E1 plus compliance tools, information protection, and voicemail',
    monthlyPrice: 2520,
    yearlyPrice: 27216,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise E5',
    sku: 'M365-E5',
    description: 'All the features of E3 plus a new class of UC with advanced Skype for Business meetings and voice',
    monthlyPrice: 4140,
    yearlyPrice: 44712,
    isDefault: false,
  },
  // Microsoft 365 Plans
  {
    name: 'Microsoft 365 Business',
    sku: 'M365-B',
    description: 'Office 365 + Windows 10 Standard + EMS (Upto 300 Users)',
    monthlyPrice: 1627.4,
    yearlyPrice: 19528.77,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise E3 (Bundle)',
    sku: 'M365-E3B',
    description: 'Office 365 Enterprise E3 + Windows 10 Ent + EMS',
    monthlyPrice: 3510,
    yearlyPrice: 42120,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise E5 (Bundle)',
    sku: 'M365-E5B',
    description: 'Office 365 Enterprise E5 + Windows 10 Ent + EMS',
    monthlyPrice: 4860,
    yearlyPrice: 58320,
    isDefault: false,
  },
  {
    name: 'Microsoft 365 Enterprise F1',
    sku: 'M365-F1',
    description: 'Office 365 Enterprise F1 + Windows 10 Ent + EMS',
    monthlyPrice: 814.93,
    yearlyPrice: 9779.18,
    isDefault: false,
  },
  // Microsoft 365 Security
  {
    name: 'Office 365 ATP Plan 1',
    sku: 'M365-ATP1',
    description: 'Advanced Threat Protection Plan 1',
    monthlyPrice: 157.5,
    yearlyPrice: 1890,
    isDefault: false,
  },
  {
    name: 'Office 365 ATP Plan 2',
    sku: 'M365-ATP2',
    description: 'Advanced Threat Protection Plan 2',
    monthlyPrice: 382.5,
    yearlyPrice: 4590,
    isDefault: false,
  },
  {
    name: 'Azure Active Directory Basic',
    sku: 'AAD-B',
    description: 'Azure Active Directory Basic',
    monthlyPrice: 66.1,
    yearlyPrice: 793.2,
    isDefault: false,
  },
  {
    name: 'Azure Active Directory Premium P1',
    sku: 'AAD-P1',
    description: 'Azure Active Directory Premium P1',
    monthlyPrice: 395,
    yearlyPrice: 4740,
    isDefault: false,
  },
  {
    name: 'Azure Active Directory Premium P2',
    sku: 'AAD-P2',
    description: 'Azure Active Directory Premium P2',
    monthlyPrice: 594.9,
    yearlyPrice: 7138.8,
    isDefault: false,
  },
  {
    name: 'Enterprise Mobility + Security E3',
    sku: 'EMS-E3',
    description: 'Enterprise Mobility + Security E3',
    monthlyPrice: 580,
    yearlyPrice: 6960,
    isDefault: false,
  },
  {
    name: 'Enterprise Mobility + Security E5',
    sku: 'EMS-E5',
    description: 'Enterprise Mobility + Security E5',
    monthlyPrice: 976.7,
    yearlyPrice: 11720.4,
    isDefault: false,
  },
  {
    name: 'Microsoft Cloud App Security',
    sku: 'MCAS',
    description: 'Microsoft Cloud App Security',
    monthlyPrice: 125,
    yearlyPrice: 1500,
    isDefault: false,
  },
  {
    name: 'Microsoft Defender For Office 365 Plan 1',
    sku: 'MDO-P1',
    description: 'Microsoft Defender For Office 365 Plan 1',
    monthlyPrice: 156,
    yearlyPrice: 1872,
    isDefault: false,
  },
  // Exchange Online Plans
  {
    name: 'Exchange Online Plan 1',
    sku: 'EXO-P1',
    description: '50 GB Mail Storage | Contacts | Calendar | In Place Archive',
    monthlyPrice: 366.3,
    yearlyPrice: 4395.6,
    isDefault: false,
  },
  {
    name: 'Exchange Online Plan 2',
    sku: 'EXO-P2',
    description: 'Unlimited Storage | Contacts | Calendar | In Place Archive | In Place Hold | DLP | Voicemail',
    monthlyPrice: 690.03,
    yearlyPrice: 8280.36,
    isDefault: false,
  },
  {
    name: 'Exchange Online Kiosk',
    sku: 'EXO-K',
    description: 'Advanced Threat Protection',
    monthlyPrice: 162.99,
    yearlyPrice: 1955.84,
    isDefault: false,
  },
  {
    name: 'Exchange Online Protection',
    sku: 'EXO-PROT',
    description: 'Anti-Virus | Anti-Spam | Policy | Encryption',
    monthlyPrice: 81.49,
    yearlyPrice: 977.92,
    isDefault: false,
  },
  // Email Backup Services
  {
    name: 'Office 365 Backup Service',
    sku: 'O365-BS',
    description: 'Unlimited Storage + Retention',
    monthlyPrice: 7.4,
    yearlyPrice: 88.77,
    isDefault: false,
  },
  // DropSuite Email Archiving
  {
    name: 'DropSuite Business Backup',
    sku: 'DS-BB',
    description: 'Unlimited Storage | Unlimited Retention | Daily Backups | Business Continuity | Admin Control Panel',
    monthlyPrice: 180,
    yearlyPrice: 2160,
    isDefault: false,
  },
  {
    name: 'DropSuite Business Archiver',
    sku: 'DS-BA',
    description: 'Unlimited Storage | Unlimited Retention | Fully Compliant | Daily Backups | Migrate, Download & Restore',
    monthlyPrice: 270,
    yearlyPrice: 3240,
    isDefault: false,
  },
  // Email Archiving Services
  {
    name: 'XcellArchive Continuity',
    sku: 'XA-C',
    description: '10 GB per vault + Approx 3 Year Retention + No E-Discovery',
    monthlyPrice: 66.58,
    yearlyPrice: 798.9,
    isDefault: false,
  },
  {
    name: 'XcellArchive Tracer',
    sku: 'XA-T',
    description: '30 GB per vault + Approx 8 Year Retention + E-Discovery',
    monthlyPrice: 102.64,
    yearlyPrice: 1231.64,
    isDefault: false,
  },
  {
    name: 'XcellArchive Durability',
    sku: 'XA-D',
    description: '100 GB per vault + Approx 20 Year Retention + E-Discovery',
    monthlyPrice: 154.11,
    yearlyPrice: 1849.32,
    isDefault: false,
  },
  // Email Anti-Phishing Services
  {
    name: 'Anti-Phishing Small',
    sku: 'AP-S',
    description: 'Up to 100 Employees / Single Admin User',
    monthlyPrice: 6163.15,
    yearlyPrice: 73957.81,
    isDefault: false,
  },
  {
    name: 'Anti-Phishing Medium',
    sku: 'AP-M',
    description: 'Up to 300 Employees / Local User Account',
    monthlyPrice: 16026.16,
    yearlyPrice: 192313.97,
    isDefault: false,
  },
  {
    name: 'Anti-Phishing Large',
    sku: 'AP-L',
    description: 'Up to 750 Employees / Multiple Admin User / Local User Accounts',
    monthlyPrice: 30820.68,
    yearlyPrice: 369848.22,
    isDefault: false,
  },
  // XcellEmail Signature
  {
    name: 'Exclaimer Email Signature',
    sku: 'EXCL-ES',
    description: 'Professional Email Signature Management',
    monthlyPrice: 72,
    yearlyPrice: 864,
    isDefault: false,
  },
];

// Mail Migration Services as Addons
const addons = [
  {
    name: 'Mailbox Migration Services',
    description: 'Mailbox Migration Services - per GB',
    price: 199,
    unit: 'per GB',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Mailbox Migration From Exchange to Office 365',
    description: 'Mailbox Migration Services From Microsoft Exchange to Office 365 - Manual Migration',
    price: 900,
    unit: 'per mailbox',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Mailbox Migration From Gsuite to Office 365',
    description: 'Mailbox Migration Services From Gsuite to Office 365 - Manual Migration',
    price: 900,
    unit: 'per mailbox',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Assessment Services for HealthCheck',
    description: 'Assessment Services for HealthCheck for Office 365',
    price: 91.23,
    unit: 'per user',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Mailbox Migration for Office 365 - Manual',
    description: 'Mailbox Migration Services for Office 365 - Manual Migration',
    price: 729.86,
    unit: 'per user',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Mailbox Migration Tool - MigrationWhiz',
    description: 'Mailbox Migration Tool for Office 365 - MigrationWhiz Automated Migration',
    price: 1824.66,
    unit: 'per user',
    pricingType: 'ONE_TIME',
  },
  {
    name: 'Archive Migration Service - MigrationWhiz',
    description: 'Archive Migration Service for Office 365 - MigrationWhiz Automated Migration',
    price: 1368.49,
    unit: 'per user',
    pricingType: 'ONE_TIME',
  },
];

async function main() {
  console.log('Importing Microsoft 365 Product...\n');

  // Find or create Software License category
  let category = await prisma.category.findFirst({
    where: { slug: 'software-license' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Software License',
        slug: 'software-license',
        description: 'Software licensing solutions for businesses',
        isActive: true,
      },
    });
    console.log('Created category: Software License');
  }

  // Create the product
  const product = await prisma.product.create({
    data: {
      name: 'Microsoft 365 Services',
      slug: 'microsoft-365-services',
      shortDescription: 'Complete Microsoft 365 solutions for businesses of all sizes',
      description: `Microsoft 365 Services - Complete productivity and security solutions for your business.

**Microsoft 365 SMB Plans** (Up to 300 users)
- Business Basic: Teams, cloud storage, web apps
- Business Standard: Office apps + email + meetings
- Business Premium: Advanced security + device management

**Enterprise Plans**
- Enterprise E1, E3, E5 for larger organizations
- ProPlus for full Office Professional

**Security Solutions**
- Advanced Threat Protection
- Azure Active Directory
- Enterprise Mobility + Security

**Exchange Online**
- Email hosting with various storage options
- Anti-virus, anti-spam protection

**Email Backup & Archiving**
- Office 365 Backup Service
- DropSuite Email Archiving
- XcellArchive solutions`,
      basePrice: 0,
      productType: 'CONFIGURABLE',
      status: 'ACTIVE',
      isRecurring: true,
      categoryId: category.id,
      features: [
        'Microsoft 365 Business & Enterprise Plans',
        'Azure Active Directory',
        'Advanced Threat Protection',
        'Exchange Online',
        'Email Backup & Archiving',
        'Migration Services Available',
      ],
    },
  });

  console.log(`Created product: ${product.name} (ID: ${product.id})`);

  // Create variants with recurring prices
  console.log('\nCreating variants...');
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: v.name,
        sku: v.sku,
        price: v.monthlyPrice,
        isDefault: v.isDefault,
        isActive: true,
        sortOrder: i,
        attributes: {
          billingType: 'RECURRING',
          description: v.description,
        },
      },
    });

    // Create recurring prices for the variant
    await prisma.productRecurringPrice.create({
      data: {
        productId: product.id,
        variantId: variant.id,
        monthlyPrice: v.monthlyPrice,
        yearlyPrice: v.yearlyPrice,
      },
    });

    console.log(`  Created variant: ${v.name} (Monthly: ₹${v.monthlyPrice}, Yearly: ₹${v.yearlyPrice})`);
  }

  // Create addons
  console.log('\nCreating addons...');
  for (let i = 0; i < addons.length; i++) {
    const a = addons[i];
    
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: a.name,
        description: a.description,
        price: a.price,
        unit: a.unit,
        pricingType: a.pricingType as 'ONE_TIME' | 'RECURRING_MONTHLY' | 'RECURRING_YEARLY',
        isActive: true,
        sortOrder: i,
      },
    });

    console.log(`  Created addon: ${a.name} (₹${a.price} ${a.unit})`);
  }

  console.log('\n✅ Microsoft 365 product imported successfully!');
  console.log(`   - ${variants.length} variants created`);
  console.log(`   - ${addons.length} addons created`);
}

main()
  .catch((e) => {
    console.error('Error importing Microsoft 365:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
