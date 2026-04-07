import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating on-premise variant prices...')

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

  // Update AI-Box variant price
  const aiBoxVariant = vsaasProduct.variants.find(v => 
    v.name.toLowerCase().includes('ai-box') || 
    v.name.toLowerCase().includes('ai box')
  )

  if (aiBoxVariant) {
    await prisma.productVariant.update({
      where: { id: aiBoxVariant.id },
      data: { price: 138000 }
    })
    console.log(`Updated AI-Box variant price to 138000`)
  } else {
    console.log('AI-Box variant not found')
  }

  // Update AI Licenses variant price
  const aiLicenseVariant = vsaasProduct.variants.find(v =>
    v.name.toLowerCase().includes('ai license')
  )

  if (aiLicenseVariant) {
    await prisma.productVariant.update({
      where: { id: aiLicenseVariant.id },
      data: { price: 229908 }
    })
    console.log(`Updated AI Licenses variant price to 229908`)
  } else {
    console.log('AI Licenses variant not found')
  }

  // Verify the updates
  const updatedProduct = await prisma.product.findUnique({
    where: { slug: 'vsaas' },
    include: { variants: true }
  })

  if (updatedProduct) {
    console.log('\nUpdated variant prices:')
    updatedProduct.variants.forEach(v => {
      if (v.name.toLowerCase().includes('ai-box') || 
          v.name.toLowerCase().includes('ai box') ||
          v.name.toLowerCase().includes('ai license')) {
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
