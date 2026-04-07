const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Delete old VSAAS product
  await prisma.product.delete({
    where: { id: 'cmmwelpg100027t31aeu25hen' }
  })
  console.log('Deleted old VSAAS product')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
