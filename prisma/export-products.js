/**
 * Export all products from local database to JSON
 * Run: node prisma/export-products.js
 * 
 * This exports products, categories, variants, images, addons, etc.
 * The output can be used to import into production database
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportData() {
  console.log('📦 Starting export from LOCAL database...')
  
  try {
    // Export Categories
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: { select: { products: true } }
      }
    })
    console.log(`✅ Exported ${categories.length} categories`)

    // Export Products with all related data
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
        images: true,
        variants: {
          include: {
            recurringPrices: true
          }
        },
        addons: true,
        configs: {
          include: {
            options: true
          }
        },
        pricingTiers: true,
        recurringPrices: true,
        seoMetadata: true
      }
    })
    console.log(`✅ Exported ${products.length} products`)

    // Export Product Config Templates
    const configTemplates = await prisma.productConfigTemplate.findMany()
    console.log(`✅ Exported ${configTemplates.length} config templates`)

    // Create export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      categories,
      products: products.map(p => ({
        ...p,
        // Convert Decimal to string for JSON serialization
        basePrice: p.basePrice?.toString(),
        compareAtPrice: p.compareAtPrice?.toString(),
        costPrice: p.costPrice?.toString(),
        taxRate: p.taxRate?.toString(),
        monthlyPrice: p.monthlyPrice?.toString(),
        yearlyPrice: p.yearlyPrice?.toString(),
        monthlySavings: p.monthlySavings?.toString(),
        yearlySavings: p.yearlySavings?.toString(),
        setupFee: p.setupFee?.toString(),
        averageRating: p.averageRating?.toString(),
        weight: p.weight?.toString(),
        // Variants
        variants: p.variants?.map(v => ({
          ...v,
          price: v.price?.toString(),
          compareAtPrice: v.compareAtPrice?.toString(),
          costPrice: v.costPrice?.toString(),
          recurringPrices: v.recurringPrices?.map(rp => ({
            ...rp,
            monthlyPrice: rp.monthlyPrice?.toString(),
            quarterlyPrice: rp.quarterlyPrice?.toString(),
            yearlyPrice: rp.yearlyPrice?.toString(),
            biennialPrice: rp.biennialPrice?.toString(),
            triennialPrice: rp.triennialPrice?.toString(),
          }))
        })) || [],
        // Addons
        addons: p.addons?.map(a => ({
          ...a,
          price: a.price?.toString()
        })) || [],
        // Configs
        configs: p.configs?.map(c => ({
          ...c,
          options: c.options?.map(o => ({
            ...o,
            priceModifier: o.priceModifier?.toString(),
            monthlyPriceModifier: o.monthlyPriceModifier?.toString(),
            yearlyPriceModifier: o.yearlyPriceModifier?.toString()
          }))
        })) || [],
        // Pricing Tiers
        pricingTiers: p.pricingTiers?.map(pt => ({
          ...pt,
          minQuantity: pt.minQuantity,
          maxQuantity: pt.maxQuantity,
          price: pt.price?.toString(),
          priceModifier: pt.priceModifier?.toString()
        })) || [],
        // Recurring Prices
        recurringPrices: p.recurringPrices?.map(rp => ({
          ...rp,
          monthlyPrice: rp.monthlyPrice?.toString(),
          quarterlyPrice: rp.quarterlyPrice?.toString(),
          yearlyPrice: rp.yearlyPrice?.toString(),
          biennialPrice: rp.biennialPrice?.toString(),
          triennialPrice: rp.triennialPrice?.toString()
        })) || []
      })),
      configTemplates
    }

    // Write to file
    const outputPath = path.join(__dirname, '..', 'exported-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))
    console.log(`\n✅ Export complete! Data saved to: ${outputPath}`)
    console.log(`📊 Summary:`)
    console.log(`   - ${categories.length} categories`)
    console.log(`   - ${products.length} products`)
    console.log(`   - ${configTemplates.length} config templates`)
    
    console.log(`\n📝 Next steps:`)
    console.log(`1. Review the exported data in exported-data.json`)
    console.log(`2. Use the import script or run SQL to import to production database`)
    console.log(`3. Or share the exported data for manual import`)

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
