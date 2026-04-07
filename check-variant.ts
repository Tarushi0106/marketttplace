const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const variant = await prisma.productVariant.findFirst({
    where: { id: 'cmmwfl9sd0003u52aq1xduhir' },
    include: { product: true }
  })
  
  console.log('Variant:', variant?.name)
  console.log('Product:', variant?.product?.name)
  console.log('Product ID:', variant?.product?.id)
  console.log('Product Slug:', variant?.product?.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
