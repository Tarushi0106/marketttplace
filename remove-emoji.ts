const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Remove emoji prefix from variant names
  await prisma.productVariant.updateMany({
    where: { product: { slug: 'vsaas' } },
    data: {
      name: {
        set: 'VSAAS Cloud'
      }
    }
  })
  console.log('Updated variant names')
  
  // Remove emoji prefix from addon groups
  await prisma.productAddon.updateMany({
    where: { 
      product: { slug: 'vsaas' },
      group: { startsWith: '☁️' }
    },
    data: {
      group: {
        set: 'Cloud'
      }
    }
  })
  console.log('Updated addon groups')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
