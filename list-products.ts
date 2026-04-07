const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: { 
      OR: [
        { name: { contains: 'VSAAS', mode: 'insensitive' } },
        { slug: { contains: 'vsaas', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true
    }
  })
  
  console.log('All VSAAS products in database:')
  for (const p of products) {
    console.log(`  - Name: "${p.name}" | ID: ${p.id} | Slug: ${p.slug} | Status: ${p.status}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
