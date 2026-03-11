import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exchange rate: 1 USD = 92 INR
const USD_TO_INR = 92

async function main() {
  console.log('🔍 Finding all product addons with USD prices...')
  
  // First, let's see what addons exist and their current prices
  const addons = await prisma.productAddon.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      product: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`Found ${addons.length} addons in the database.`)
  
  // Show current prices
  console.log('\n📋 Current addon prices:')
  for (const addon of addons) {
    console.log(`  - ${addon.name} (${addon.product?.name}): $${addon.price}`)
  }
  
  // Update all addon prices to INR (multiply by 92)
  console.log('\n💰 Converting prices from USD to INR...')
  
  let updatedCount = 0
  for (const addon of addons) {
    const currentPrice = Number(addon.price)
    // Only convert if the price looks like USD (less than 1000, which is typical USD range)
    if (currentPrice > 0 && currentPrice < 1000) {
      const newPrice = currentPrice * USD_TO_INR
      
      await prisma.productAddon.update({
        where: { id: addon.id },
        data: {
          price: newPrice
        }
      })
      updatedCount++
      console.log(`  ✓ Updated ${addon.name}: $${currentPrice} → ₹${newPrice}`)
    }
  }
  
  console.log(`\n✅ Successfully updated ${updatedCount} addon prices to INR`)
  
  // Verify the updates
  const updatedAddons = await prisma.productAddon.findMany({
    select: {
      id: true,
      name: true,
      price: true
    }
  })
  
  console.log('\n📋 Updated addon prices:')
  for (const addon of updatedAddons) {
    console.log(`  - ${addon.name}: ₹${addon.price}`)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
