const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { slug: 'vsaas' } },
    select: { id: true, name: true, type: true, attributes: true }
  })
  
  console.log('Variants:')
  for (const v of variants) {
    console.log(`  - ${v.name}: type="${v.type}", attributes.type="${v.attributes?.type}"`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
