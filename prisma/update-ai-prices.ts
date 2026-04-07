import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating AI product prices and adding new variants...')

  // Find the VSaaS product
  const vsaasProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
    include: { variants: true }
  })

  if (!vsaasProduct) {
    console.error('VSaaS product not found')
    return
  }

  console.log(`Found VSaaS product: ${vsaasProduct.name}`)

  // 1. Update AI-Box variant price to 138000
  const aiBoxVariant = vsaasProduct.variants.find(v => 
    v.name.toLowerCase().includes('ai-box') || 
    v.name.toLowerCase().includes('ai box')
  )

  if (aiBoxVariant) {
    await prisma.productVariant.update({
      where: { id: aiBoxVariant.id },
      data: { price: 138000 }
    })
    console.log(`✓ Updated AI-Box variant price to ₹138,000`)
  } else {
    console.log('✗ AI-Box variant not found')
  }

  // 2. Update AI Licenses variant price to 229908
  const aiLicenseVariant = vsaasProduct.variants.find(v =>
    v.name.toLowerCase().includes('ai license')
  )

  if (aiLicenseVariant) {
    await prisma.productVariant.update({
      where: { id: aiLicenseVariant.id },
      data: { price: 229908 }
    })
    console.log(`✓ Updated AI Licenses variant price to ₹229,908`)
  } else {
    console.log('✗ AI Licenses variant not found')
  }

  // 3. Add Cyber + Pack (Stream OS) with price 644
  const cyberPackStreamVariant = vsaasProduct.variants.find(v =>
    v.name.toLowerCase().includes('cyber') && v.name.toLowerCase().includes('stream')
  )

  if (cyberPackStreamVariant) {
    await prisma.productVariant.update({
      where: { id: cyberPackStreamVariant.id },
      data: { price: 644 }
    })
    console.log(`✓ Updated Cyber + Pack (Stream OS) variant price to ₹644`)
  } else {
    // Create new variant if it doesn't exist
    const newCyberPackStream = await prisma.productVariant.create({
      data: {
        productId: vsaasProduct.id,
        name: 'Cyber + Pack (Stream OS)',
        price: 644,
        type: 'onprem',
        isActive: true,
        sortOrder: 10,
        attributes: {
          type: 'onprem',
          billingType: 'ONE_TIME'
        }
      }
    })
    console.log(`✓ Created Cyber + Pack (Stream OS) variant with price ₹644`)
  }

  // 4. Add Cyber + Pack (AI-Box & AI License) with price 73600
  const cyberPackAIVariant = vsaasProduct.variants.find(v =>
    v.name.toLowerCase().includes('cyber') && 
    (v.name.toLowerCase().includes('ai') || v.name.toLowerCase().includes('ai-box'))
  )

  if (cyberPackAIVariant) {
    await prisma.productVariant.update({
      where: { id: cyberPackAIVariant.id },
      data: { price: 73600 }
    })
    console.log(`✓ Updated Cyber + Pack (AI-Box & AI License) variant price to ₹73,600`)
  } else {
    // Create new variant if it doesn't exist
    const newCyberPackAI = await prisma.productVariant.create({
      data: {
        productId: vsaasProduct.id,
        name: 'Cyber + Pack (AI-Box & AI License)',
        price: 73600,
        type: 'onprem',
        isActive: true,
        sortOrder: 11,
        attributes: {
          type: 'onprem',
          billingType: 'ONE_TIME'
        }
      }
    })
    console.log(`✓ Created Cyber + Pack (AI-Box & AI License) variant with price ₹73,600`)
  }

  // Verify all updates
  const updatedProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
    include: { variants: true }
  })

  if (updatedProduct) {
    console.log('\n=== Updated Variant Prices ===')
    updatedProduct.variants.forEach(v => {
      if (v.name.toLowerCase().includes('ai-box') || 
          v.name.toLowerCase().includes('ai box') ||
          v.name.toLowerCase().includes('ai license') ||
          v.name.toLowerCase().includes('cyber')) {
        console.log(`- ${v.name}: ₹${v.price}`)
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
