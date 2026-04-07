import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating all products to ACTIVE status...')
  
  const result = await prisma.product.updateMany({
    where: {
      status: 'DRAFT'
    },
    data: {
      status: 'ACTIVE'
    }
  })
  
  console.log(`Updated ${result.count} products to ACTIVE status`)
  
  // Also check current status distribution
  const statusCounts = await prisma.product.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  })
  
  console.log('\nCurrent product status distribution:')
  statusCounts.forEach(s => {
    console.log(`  ${s.status}: ${s._count.status}`)
  })
  
  const totalProducts = await prisma.product.count()
  console.log(`\nTotal products: ${totalProducts}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
