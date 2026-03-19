const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: 'vsaas' },
    include: { 
      variants: true,
      addons: { take: 10 }
    }
  })
  
  console.log('Product:', product?.name)
  console.log('Product ID:', product?.id)
  console.log('Slug:', product?.slug)
  console.log('Variants count:', product?.variants?.length)
  console.log('Variants:', product?.variants?.map(v => v.name))
  console.log('Addons:', product?.addons?.map(a => a.name))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
