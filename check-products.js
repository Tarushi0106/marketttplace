const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: { addons: true }
  })
  
  products.forEach(product => {
    console.log('Product:', product.name, '(', product.slug, ')')
    console.log('  Addons:', product.addons.length)
    product.addons.slice(0, 5).forEach(addon => {
      console.log('   -', addon.name, '| group:', addon.group)
    })
    if (product.addons.length > 5) {
      console.log('   ... and', product.addons.length - 5, 'more')
    }
    console.log('')
  })
}

main().finally(() => prisma.$disconnect())
