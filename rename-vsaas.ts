const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Update the product name to VSAAS 
  const product = await prisma.product.update({
    where: { id: 'cmmwjtg5y000176zzo3trf0jp' },
    data: {
      name: 'VSAAS',
      slug: 'vsaas'
    }
  })
  console.log('Updated product to:', product.name, product.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
