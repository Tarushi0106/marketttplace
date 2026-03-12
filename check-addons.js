const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const product = await prisma.product.findFirst({
    where: { slug: 'connect-cloud' },
    include: { addons: true }
  })
  
  if (product) {
    console.log('Product:', product.name)
    console.log('Addons:', JSON.stringify(product.addons.map(a => ({ name: a.name, group: a.group, price: a.price })), null, 2))
  } else {
    console.log('Product not found')
  }
}

main().finally(() => prisma.$disconnect())
