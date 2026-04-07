const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: 'vsaas' }
  })
  
  if (!product) {
    console.log('Product not found')
    return
  }
  
  // Delete existing variants
  await prisma.productVariant.deleteMany({
    where: { productId: product.id }
  })
  
  // Delete existing addons
  await prisma.productAddon.deleteMany({
    where: { productId: product.id }
  })
  
  // Create Cloud variants (without emoji)
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Connect Cloud - Platform Fee',
      attributes: { 
        type: 'cloud',
        billingType: 'recurring',
        description: 'Cloud VMS with Live & Playback, 3 Days Cloud Backup'
      },
      price: 248.40,
      isDefault: true
    }
  })
  
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Cloud Gateway',
      attributes: { 
        type: 'cloud',
        billingType: 'one_time',
        description: 'Cloud Gateway Edge Device'
      },
      price: 5796
    }
  })
  
  // Create On-Premise variant (without emoji)
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'VSAAS On-Premise',
      attributes: { 
        type: 'onprem',
        billingType: 'recurring',
        description: 'On-Premise Video Surveillance Solution'
      },
      price: 4500
    }
  })
  
  // Create addons (without emoji prefix in group)
  const cloudAddons = [
    { name: 'Cloud Storage - 4 Days', group: 'Storage', price: 138 },
    { name: 'Cloud Storage - 27 Days', group: 'Storage', price: 391 },
    { name: 'Cloud Storage - 87 Days', group: 'Storage', price: 920 },
    { name: 'Cloud Storage - 177 Days', group: 'Storage', price: 1702 },
    { name: 'Cloud Storage - 362 Days', group: 'Storage', price: 3312 },
    { name: 'Core Desktop License', group: 'Platform', price: 6578 },
    { name: 'Web User License', group: 'Platform', price: 69 },
    { name: 'Mobile User License', group: 'Platform', price: 69 },
    { name: 'Intrusion Detection', group: 'AI Security', price: 161 },
    { name: 'Zone Monitoring', group: 'AI Security', price: 161 },
    { name: 'Camera Sabotage', group: 'AI Security', price: 161 },
    { name: 'Activity Detection', group: 'AI Security', price: 161 },
    { name: 'Trespassing Detection', group: 'AI Security', price: 161 },
    { name: 'Perimeter Fence Jumping', group: 'AI Security', price: 161 },
    { name: 'Double Line Crossing', group: 'AI Business', price: 782 },
    { name: 'Loitering Detection', group: 'AI Business', price: 782 },
    { name: 'Overcrowding Detection', group: 'AI Business', price: 782 },
    { name: 'People Counting', group: 'AI Business', price: 782 },
    { name: 'Missing Staff Detection', group: 'AI Business', price: 782 },
    { name: 'Occupancy Statistics', group: 'AI Business', price: 782 },
    { name: 'Queue Management', group: 'AI Business', price: 782 },
    { name: 'Heatmap Analysis', group: 'AI Business', price: 782 },
    { name: 'PPE/Safety Kit Detection', group: 'AI Safety', price: 920 },
    { name: 'Smoke & Fire Detection', group: 'AI Safety', price: 920 },
    { name: 'Person of Interest', group: 'AI Investigation', price: 1242 },
    { name: 'Vehicle of Interest', group: 'AI Investigation', price: 1242 },
    { name: 'ANPR', group: 'AI Investigation', price: 2231 },
    { name: 'Facial Recognition', group: 'AI Investigation', price: 3312 },
    { name: 'Setup & Implementation', group: 'One Time', price: 9999 },
  ]
  
  for (const addon of cloudAddons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        group: addon.group,
        price: addon.price,
        pricingType: addon.group === 'One Time' ? 'ONE_TIME' : 'RECURRING_MONTHLY',
        unit: addon.group === 'One Time' ? 'one-time' : 'per camera/month'
      }
    })
  }
  
  console.log('VSAAS setup complete - no emojis')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
