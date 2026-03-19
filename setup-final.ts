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
  
  // Delete existing
  await prisma.productVariant.deleteMany({ where: { productId: product.id } })
  await prisma.productAddon.deleteMany({ where: { productId: product.id } })
  
  // === CLOUD VARIANTS ===
  // Connect Cloud - Platform Fee
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
  
  // Cloud Gateway
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
  
  // Stream OS - Single variant with channel options
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'Stream OS [ 32 | 64 | 128 | 256 ]',
      attributes: { 
        type: 'onprem',
        billingType: 'one_time',
        description: 'On-Premise VMS - Select channels: 32, 64, 128, or 256',
        channelOptions: [32, 64, 128, 256],
        pricesByChannel: {
          32: 3680,
          64: 7360,
          128: 14720,
          256: 29440
        }
      },
      price: 3680
    }
  })
  
  // === CLOUD ADDONS (only for Cloud) ===
  const cloudAddons = [
    { name: 'Cloud Storage - 4 Days', group: 'Cloud - Storage', price: 138 },
    { name: 'Cloud Storage - 27 Days', group: 'Cloud - Storage', price: 391 },
    { name: 'Cloud Storage - 87 Days', group: 'Cloud - Storage', price: 920 },
    { name: 'Cloud Storage - 177 Days', group: 'Cloud - Storage', price: 1702 },
    { name: 'Cloud Storage - 362 Days', group: 'Cloud - Storage', price: 3312 },
    { name: 'Core Desktop License', group: 'Cloud - Platform', price: 6578 },
    { name: 'Web User License', group: 'Cloud - Platform', price: 69 },
    { name: 'Mobile User License', group: 'Cloud - Platform', price: 69 },
    { name: 'Intrusion Detection', group: 'Cloud - AI Security', price: 161 },
    { name: 'Zone Monitoring', group: 'Cloud - AI Security', price: 161 },
    { name: 'Camera Sabotage', group: 'Cloud - AI Security', price: 161 },
    { name: 'Activity Detection', group: 'Cloud - AI Security', price: 161 },
    { name: 'Trespassing Detection', group: 'Cloud - AI Security', price: 161 },
    { name: 'Perimeter Fence Jumping', group: 'Cloud - AI Security', price: 161 },
    { name: 'Double Line Crossing', group: 'Cloud - AI Business', price: 782 },
    { name: 'Loitering Detection', group: 'Cloud - AI Business', price: 782 },
    { name: 'Overcrowding Detection', group: 'Cloud - AI Business', price: 782 },
    { name: 'People Counting', group: 'Cloud - AI Business', price: 782 },
    { name: 'Missing Staff Detection', group: 'Cloud - AI Business', price: 782 },
    { name: 'Occupancy Statistics', group: 'Cloud - AI Business', price: 782 },
    { name: 'Queue Management', group: 'Cloud - AI Business', price: 782 },
    { name: 'Heatmap Analysis', group: 'Cloud - AI Business', price: 782 },
    { name: 'PPE/Safety Kit Detection', group: 'Cloud - AI Safety', price: 920 },
    { name: 'Smoke & Fire Detection', group: 'Cloud - AI Safety', price: 920 },
    { name: 'Person of Interest', group: 'Cloud - AI Investigation', price: 1242 },
    { name: 'Vehicle of Interest', group: 'Cloud - AI Investigation', price: 1242 },
    { name: 'ANPR', group: 'Cloud - AI Investigation', price: 2231 },
    { name: 'Facial Recognition', group: 'Cloud - AI Investigation', price: 3312 },
    { name: 'Setup & Implementation', group: 'Cloud - One Time', price: 9999 },
  ]
  
  for (const addon of cloudAddons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        group: addon.group,
        price: addon.price,
        pricingType: addon.group.includes('One Time') ? 'ONE_TIME' : 'RECURRING_MONTHLY',
        unit: addon.group.includes('One Time') ? 'one-time' : 'per camera/month'
      }
    })
  }
  
  // === ON-PREMISE ADDONS (only for On-Premise) ===
  const onpremAddons = [
    { name: 'AI-Box (16 Credits)', group: 'On-Premise - Hardware', price: 138000 },
    { name: 'AI Licenses (16 Credits)', group: 'On-Premise - Hardware', price: 229908 },
    { name: 'Cyber+ Pack (Stream OS) - Per Camera/Year', group: 'On-Premise - AMC', price: 644 },
    { name: 'Cyber+ Pack (AI-Box/AI License) - Per 16 Credits/Year', group: 'On-Premise - AMC', price: 73600 },
    { name: 'Setup & Implementation', group: 'On-Premise - One Time', price: 46000 },
  ]
  
  for (const addon of onpremAddons) {
    await prisma.productAddon.create({
      data: {
        productId: product.id,
        name: addon.name,
        group: addon.group,
        price: addon.price,
        pricingType: addon.group.includes('One Time') ? 'ONE_TIME' : 'RECURRING_YEARLY',
        unit: addon.group.includes('One Time') ? 'one-time' : 'per year'
      }
    })
  }
  
  console.log('Setup complete!')
  console.log('Cloud Variants: Connect Cloud, Cloud Gateway')
  console.log('On-Premise Variant: Stream OS [32|64|128|256]')
  console.log('Cloud Addons:', cloudAddons.length)
  console.log('On-Premise Addons:', onpremAddons.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
