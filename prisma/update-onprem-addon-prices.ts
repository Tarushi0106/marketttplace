import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating on-premise addon prices...')

  // Find the VSaaS product
  const vsaasProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
    include: { addons: true }
  })

  if (!vsaasProduct) {
    console.error('VSaaS product not found')
    return
  }

  console.log(`Found VSaaS product: ${vsaasProduct.name}`)

  // 1. Update AI-Box addon price to 138000
  const aiBoxAddon = vsaasProduct.addons.find(a => 
    a.name.toLowerCase().includes('ai-box') || 
    a.name.toLowerCase().includes('ai box')
  )

  if (aiBoxAddon) {
    await prisma.productAddon.update({
      where: { id: aiBoxAddon.id },
      data: { price: 138000 }
    })
    console.log(`✓ Updated AI-Box addon price to ₹138,000`)
  } else {
    console.log('✗ AI-Box addon not found')
  }

  // 2. Update AI Licenses addon price to 229908
  const aiLicenseAddon = vsaasProduct.addons.find(a =>
    a.name.toLowerCase().includes('ai license')
  )

  if (aiLicenseAddon) {
    await prisma.productAddon.update({
      where: { id: aiLicenseAddon.id },
      data: { price: 229908 }
    })
    console.log(`✓ Updated AI Licenses addon price to ₹229,908`)
  } else {
    console.log('✗ AI Licenses addon not found')
  }

  // 3. Add Cyber + Pack (Stream OS) with price 644
  const cyberPackStreamAddon = vsaasProduct.addons.find(a =>
    a.name.toLowerCase().includes('cyber') && a.name.toLowerCase().includes('stream')
  )

  if (cyberPackStreamAddon) {
    await prisma.productAddon.update({
      where: { id: cyberPackStreamAddon.id },
      data: { price: 644 }
    })
    console.log(`✓ Updated Cyber + Pack (Stream OS) addon price to ₹644`)
  } else {
    // Create new addon if it doesn't exist
    const newCyberPackStream = await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        name: 'Cyber + Pack (Stream OS)',
        price: 644,
        pricingType: 'ONE_TIME',
        isActive: true,
        sortOrder: 10,
        unit: 'one-time'
      }
    })
    console.log(`✓ Created Cyber + Pack (Stream OS) addon with price ₹644`)
  }

  // 4. Add Cyber + Pack (AI-Box & AI License) with price 73600
  const cyberPackAIAddon = vsaasProduct.addons.find(a =>
    a.name.toLowerCase().includes('cyber') && 
    (a.name.toLowerCase().includes('ai') || a.name.toLowerCase().includes('ai-box'))
  )

  if (cyberPackAIAddon) {
    await prisma.productAddon.update({
      where: { id: cyberPackAIAddon.id },
      data: { price: 73600 }
    })
    console.log(`✓ Updated Cyber + Pack (AI-Box & AI License) addon price to ₹73,600`)
  } else {
    // Create new addon if it doesn't exist
    const newCyberPackAI = await prisma.productAddon.create({
      data: {
        productId: vsaasProduct.id,
        name: 'Cyber + Pack (AI-Box & AI License)',
        price: 73600,
        pricingType: 'ONE_TIME',
        isActive: true,
        sortOrder: 11,
        unit: 'one-time'
      }
    })
    console.log(`✓ Created Cyber + Pack (AI-Box & AI License) addon with price ₹73,600`)
  }

  // Verify all updates
  const updatedProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
    include: { addons: true }
  })

  if (updatedProduct) {
    console.log('\n=== Updated Addon Prices ===')
    updatedProduct.addons.forEach(a => {
      if (a.name.toLowerCase().includes('ai-box') || 
          a.name.toLowerCase().includes('ai box') ||
          a.name.toLowerCase().includes('ai license') ||
          a.name.toLowerCase().includes('cyber')) {
        console.log(`- ${a.name}: ₹${a.price}`)
      }
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
