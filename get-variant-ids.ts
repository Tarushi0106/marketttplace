const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { slug: 'vsaas' } },
    select: { id: true, name: true, price: true }
  })
  
  console.log('VSAAS Variants:')
  for (const v of variants) {
    console.log(`  - ${v.name}: ID=${v.id}, Price=${v.price}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
