const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Find VSAAS product
  const product = await prisma.product.findFirst({
    where: { slug: 'vsaas' }
  })
  
  if (!product) {
    console.log('Product not found')
    return
  }
  
  // Add on-premise variant (needed for configure page)
  await prisma.productVariant.create({
    data: {
      productId: product.id,
      name: 'VSAAS On-Premise',
      attributes: { 
        type: 'onprem',
        billingType: 'recurring',
        description: 'On-Premise Video Surveillance Solution'
      },
      price: 4500,  // Monthly price in INR
      isDefault: false
    }
  })
  console.log('Added On-Premise variant')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
