import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function main() {
  // First, let's see what products with "Connect" exist
  const connectProducts = await prisma.product.findMany({
    where: { 
      name: { contains: 'Connect', mode: 'insensitive' }
    },
    select: { name: true, slug: true }
  })
  
  console.log('Products with Connect:', connectProducts)

  // Update Connect Cloud to VSaaS Cloud
  const result = await prisma.product.updateMany({
    where: { 
      OR: [
        { slug: 'connect-cloud' },
        { name: { contains: 'Connect Cloud', mode: 'insensitive' } }
      ]
    },
    data: { 
      name: 'VSaaS Cloud'
    },
  })

  console.log(`Updated ${result.count} product(s)`)
  
  // Verify the update
  const updatedProducts = await prisma.product.findMany({
    where: { 
      name: { contains: 'VSaaS', mode: 'insensitive' }
    },
    select: { name: true, slug: true }
  })
  
  console.log('VSaaS products:', updatedProducts)

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
