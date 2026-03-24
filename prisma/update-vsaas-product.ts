import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find VSaaS Cloud product
  const vsaasCloud = await prisma.product.findFirst({
    where: {
      slug: 'vsaas-cloud'
    }
  })

  if (vsaasCloud) {
    console.log('Found VSaaS Cloud product:', vsaasCloud.id, vsaasCloud.name)
    
    // Update the product name
    await prisma.product.update({
      where: { id: vsaasCloud.id },
      data: {
        name: 'Video Surveillance as a Service (VSaaS)',
        description: ''
      }
    })
    console.log('Updated product name to: Video Surveillance as a Service (VSaaS)')
  } else {
    console.log('VSaaS Cloud product not found')
  }

  // Also check for main vsaas product
  const vsaas = await prisma.product.findFirst({
    where: {
      slug: 'vsaas'
    }
  })

  if (vsaas) {
    console.log('Found VSAAS product:', vsaas.id, vsaas.name)
    
    // Update the product name
    await prisma.product.update({
      where: { id: vsaas.id },
      data: {
        name: 'Video Surveillance as a Service (VSaaS)'
      }
    })
    console.log('Updated product name to: Video Surveillance as a Service (VSaaS)')
    
    // Update description to remove "Cloud video surveillance solution"
    if (vsaas.description && vsaas.description.includes('Cloud video surveillance solution')) {
      await prisma.product.update({
        where: { id: vsaas.id },
        data: {
          description: vsaas.description.replace('Cloud video surveillance solution. ', '')
        }
      })
      console.log('Removed "Cloud video surveillance solution" from description')
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
