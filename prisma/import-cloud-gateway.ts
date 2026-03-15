/**
 * Import Cloud Gateway Link Device as a standalone product
 * Run with: npx tsx prisma/import-cloud-gateway.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Cloud Gateway import...\n');

  // 1. Find or create category for Hardware
  let category = await prisma.category.findFirst({
    where: { slug: 'hardware' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Hardware',
        slug: 'hardware',
        description: 'Hardware devices and equipment',
        icon: 'server',
        isActive: true,
        sortOrder: 10,
      },
    });
    console.log('✅ Created category:', category.name);
  }

  // 2. Check if product already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug: 'cloud-gateway-link-device' },
  });

  if (existingProduct) {
    console.log('⚠️  Product already exists:', existingProduct.name);
    console.log('   Deleting and recreating...\n');
    await prisma.product.delete({
      where: { id: existingProduct.id },
    });
  }

  // 3. Create the Cloud Gateway product
  const product = await prisma.product.create({
    data: {
      name: 'Cloud Gateway Link Device',
      slug: 'cloud-gateway-link-device',
      shortDescription: 'Cloud Gateway Edge Device for secure connection to Cloud VMS',
      description: `
## Cloud Gateway Link Device

The Cloud Gateway Edge Device creates a secured network tunnel between your local CCTV infrastructure and the Cloud VMS platform. This essential hardware enables remote monitoring, cloud storage, and centralized management of your video surveillance system.

### Key Features

- **Secure Connection**: TLS 1.3 secured tunnel to cloud platform
- **Easy Installation**: Plug-and-play setup on existing CCTV LAN network
- **High Capacity**: Supports up to 16 cameras per device
- **Remote Access**: Access cameras from anywhere via web or mobile app
- **3 Year Warranty**: Manufacturer warranty for peace of mind

### Technical Specifications

- Network: 10/100/1000 Mbps Ethernet
- Power: DC 12V / 2A
- Dimensions: 150mm x 100mm x 30mm
- Operating Temperature: -10°C to 50°C

### Package Includes

- 1x Cloud Gateway Device
- 1x Power Adapter
- 1x Ethernet Cable
- Quick Start Guide
      `.trim(),
      features: [
        'Cloud Gateway Edge Device',
        'Creates secured network tunnel with Cloud',
        'Connects 8/16 channels in local network',
        '3 year warranty',
        'Easy plug-and-play installation',
        'Remote access via Web & Mobile',
      ],
      specifications: {
        'Network Interface': '10/100/1000 Mbps Ethernet',
        'Power Supply': 'DC 12V / 2A',
        'Dimensions': '150mm x 100mm x 30mm',
        'Operating Temperature': '-10°C to 50°C',
        'Max Cameras': '16 channels',
        'Security': 'TLS 1.3',
        'Warranty': '3 Years',
      },
      sku: 'CGW-001',
      basePrice: 5796, // INR price
      compareAtPrice: 6500,
      costPrice: 4500,
      productType: 'STANDALONE',
      status: 'ACTIVE',
      categoryId: category.id,
      isFeatured: true,
      isDigital: false,
      requiresShipping: true,
      trackInventory: true,
      stockQuantity: 100,
      weight: 0.5,
      weightUnit: 'kg',
    },
  });

  console.log('✅ Created product:', product.name);

  // 4. Create product images (placeholder)
  await prisma.productImage.createMany({
    data: [
      {
        productId: product.id,
        url: '/uploads/icons/server.svg',
        alt: 'Cloud Gateway Device',
        sortOrder: 0,
        isPrimary: true,
      },
    ],
  });

  console.log('✅ Added product images');

  // 5. Create variants for different channel options
  const variants = [
    {
      name: '8-Channel Cloud Gateway',
      sku: 'CGW-8CH',
      price: 4500,
      compareAtPrice: 5000,
      attributes: {
        channels: '8',
        billingType: 'ONE_TIME',
        'Max Channels': '8',
        'Suitable For': 'Small business / Home',
      },
      isDefault: false,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: '16-Channel Cloud Gateway',
      sku: 'CGW-16CH',
      price: 5796,
      compareAtPrice: 6500,
      attributes: {
        channels: '16',
        billingType: 'ONE_TIME',
        'Max Channels': '16',
        'Suitable For': 'Medium business / Enterprise',
      },
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
  ];

  for (const variant of variants) {
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        attributes: variant.attributes,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
        sortOrder: variant.sortOrder,
        stockQuantity: 50,
      },
    });
    console.log('✅ Created variant:', variant.name);
  }

  console.log('\n🎉 Cloud Gateway product imported successfully!');
  console.log('\n📝 Product Details:');
  console.log('   - Name:', product.name);
  console.log('   - Slug:', product.slug);
  console.log('   - Base Price: ₹' + product.basePrice);
  console.log('   - Category:', category.name);
  console.log('   - Status:', product.status);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
