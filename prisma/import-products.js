/**
 * Import products to PRODUCTION database
 * Run: node prisma/import-products.js
 * 
 * This script reads from exported-data.json and imports to the 
 * production database (Neon PostgreSQL)
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Production database URL from amplify.yml
const PRODUCTION_DB_URL = "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DB_URL
    }
  }
})

async function importData() {
  console.log('📦 Starting import to PRODUCTION database...')
  
  // Read exported data
  const exportPath = path.join(__dirname, '..', 'exported-data.json')
  if (!fs.existsSync(exportPath)) {
    console.error('❌ exported-data.json not found! Run prisma/export-products.js first')
    return
  }
  
  const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'))
  
  try {
    // First, let's check what's in production
    const existingProducts = await prisma.product.count()
    console.log(`📊 Production database currently has ${existingProducts} products`)
    
    // Import Categories
    console.log('\n📂 Importing categories...')
    for (const category of exportData.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          image: category.image,
          isActive: category.isActive,
          sortOrder: category.sortOrder
        },
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          image: category.image,
          isActive: category.isActive,
          sortOrder: category.sortOrder
        }
      })
    }
    console.log(`✅ Imported ${exportData.categories.length} categories`)
    
    // Import Products
    console.log('\n📦 Importing products...')
    for (const product of exportData.products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          specifications: product.specifications,
          sku: product.sku,
          basePrice: parseFloat(product.basePrice) || 0,
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
          costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
          taxRate: product.taxRate ? parseFloat(product.taxRate) : null,
          monthlyPrice: product.monthlyPrice ? parseFloat(product.monthlyPrice) : null,
          yearlyPrice: product.yearlyPrice ? parseFloat(product.yearlyPrice) : null,
          monthlySavings: product.monthlySavings ? parseFloat(product.monthlySavings) : null,
          yearlySavings: product.yearlySavings ? parseFloat(product.yearlySavings) : null,
          setupFee: product.setupFee ? parseFloat(product.setupFee) : null,
          isRecurring: product.isRecurring,
          productType: product.productType,
          status: product.status,
          isFeatured: product.isFeatured,
          isChild: product.isChild,
          isDigital: product.isDigital,
          requiresShipping: product.requiresShipping,
          trackInventory: product.trackInventory,
          allowBackorder: product.allowBackorder,
          stockQuantity: product.stockQuantity || 0,
          lowStockThreshold: product.lowStockThreshold || 5,
          weight: product.weight ? parseFloat(product.weight) : null,
          weightUnit: product.weightUnit,
          sortOrder: product.sortOrder || 0,
          averageRating: product.averageRating ? parseFloat(product.averageRating) : null,
          reviewCount: product.reviewCount || 0,
          pricingDisplayFormat: product.pricingDisplayFormat,
          icon: product.icon,
          solutionsContent: product.solutionsContent,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId
        },
        create: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          specifications: product.specifications,
          sku: product.sku,
          basePrice: parseFloat(product.basePrice) || 0,
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
          costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
          taxRate: product.taxRate ? parseFloat(product.taxRate) : null,
          monthlyPrice: product.monthlyPrice ? parseFloat(product.monthlyPrice) : null,
          yearlyPrice: product.yearlyPrice ? parseFloat(product.yearlyPrice) : null,
          monthlySavings: product.monthlySavings ? parseFloat(product.monthlySavings) : null,
          yearlySavings: product.yearlySavings ? parseFloat(product.yearlySavings) : null,
          setupFee: product.setupFee ? parseFloat(product.setupFee) : null,
          isRecurring: product.isRecurring,
          productType: product.productType,
          status: product.status,
          isFeatured: product.isFeatured,
          isChild: product.isChild,
          isDigital: product.isDigital,
          requiresShipping: product.requiresShipping,
          trackInventory: product.trackInventory,
          allowBackorder: product.allowBackorder,
          stockQuantity: product.stockQuantity || 0,
          lowStockThreshold: product.lowStockThreshold || 5,
          weight: product.weight ? parseFloat(product.weight) : null,
          weightUnit: product.weightUnit,
          sortOrder: product.sortOrder || 0,
          averageRating: product.averageRating ? parseFloat(product.averageRating) : null,
          reviewCount: product.reviewCount || 0,
          pricingDisplayFormat: product.pricingDisplayFormat,
          icon: product.icon,
          solutionsContent: product.solutionsContent,
          categoryId: product.categoryId,
          subCategoryId: product.subCategoryId
        }
      })
    }
    console.log(`✅ Imported ${exportData.products.length} products`)
    
    // Verify import
    const finalCount = await prisma.product.count()
    console.log(`\n📊 Production database now has ${finalCount} products`)
    
    console.log('\n✅ Import complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Push your code changes to git to trigger Amplify redeploy')
    console.log('2. Clear Amplify cache in the console')
    console.log('3. Visit your deployed site - it should now show the same products as localhost')
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    console.log('\n💡 If connection failed, the Neon database might not allow external connections.')
    console.log('   In that case, you can:')
    console.log('   1. Use Neon\'s SQL Editor to manually import data')
    console.log('   2. Or temporarily enable IP whitelisting for your local IP')
  } finally {
    await prisma.$disconnect()
  }
}

importData()
