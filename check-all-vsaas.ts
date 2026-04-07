const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'VSAAS', mode: 'insensitive' } },
    include: { 
      variants: true
    }
  })
  
  console.log('All VSAAS Products:')
  for (const p of products) {
    console.log(`\nProduct: ${p.name} (ID: ${p.id})`)
    console.log(`  Variants (${p.variants.length}):`, p.variants.map(v => v.name))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
