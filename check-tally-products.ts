import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: { contains: 'tally', mode: 'insensitive' }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true
    }
  })
  
  console.log('Tally products:', JSON.stringify(products, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
