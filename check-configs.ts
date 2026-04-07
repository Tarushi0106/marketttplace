const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: 'vsaas' },
    include: { 
      variants: true,
      configs: true,
      addons: true
    }
  })
  
  console.log('Product:', product?.name)
  console.log('ID:', product?.id)
  console.log('Slug:', product?.slug)
  console.log('Status:', product?.status)
  console.log('')
  console.log('Variants:', product?.variants?.length)
  console.log('Configs:', product?.configs?.length)
  console.log('Addons:', product?.addons?.length)
  console.log('')
  console.log('Configs detail:')
  for (const c of product?.configs || []) {
    console.log(`  - ${c.name} (${c.configType})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
