import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function importData() {
  const backupPath = path.join(__dirname, "database-backup.json");
  
  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found:", backupPath);
    process.exit(1);
  }
  
  const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
  
  console.log("Starting data import...");
  console.log("Backup version:", backupData.version);
  console.log("Exported at:", backupData.exportedAt);
  
  // Import in order due to foreign key constraints
  // 1. Categories
  if (backupData.categories && backupData.categories.length > 0) {
    console.log(`\nImporting ${backupData.categories.length} categories...`);
    for (const category of backupData.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      });
    }
    console.log("Categories imported!");
  }
  
  // 2. SubCategories
  if (backupData.subCategories && backupData.subCategories.length > 0) {
    console.log(`\nImporting ${backupData.subCategories.length} subCategories...`);
    for (const subCategory of backupData.subCategories) {
      await prisma.subCategory.upsert({
        where: { id: subCategory.id },
        update: subCategory,
        create: subCategory,
      });
    }
    console.log("SubCategories imported!");
  }
  
  // 3. Products
  if (backupData.products && backupData.products.length > 0) {
    console.log(`\nImporting ${backupData.products.length} products...`);
    for (const product of backupData.products) {
      await prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
    }
    console.log("Products imported!");
  }
  
  // 4. Product Images
  if (backupData.productImages && backupData.productImages.length > 0) {
    console.log(`\nImporting ${backupData.productImages.length} productImages...`);
    for (const image of backupData.productImages) {
      await prisma.productImage.upsert({
        where: { id: image.id },
        update: image,
        create: image,
      });
    }
    console.log("ProductImages imported!");
  }
  
  // 5. Product Variants
  if (backupData.productVariants && backupData.productVariants.length > 0) {
    console.log(`\nImporting ${backupData.productVariants.length} productVariants...`);
    for (const variant of backupData.productVariants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: variant,
        create: variant,
      });
    }
    console.log("ProductVariants imported!");
  }
  
  // 6. Bundles
  if (backupData.bundles && backupData.bundles.length > 0) {
    console.log(`\nImporting ${backupData.bundles.length} bundles...`);
    for (const bundle of backupData.bundles) {
      await prisma.bundle.upsert({
        where: { id: bundle.id },
        update: bundle,
        create: bundle,
      });
    }
    console.log("Bundles imported!");
  }
  
  // 7. Settings
  if (backupData.settings && backupData.settings.length > 0) {
    console.log(`\nImporting ${backupData.settings.length} settings...`);
    for (const setting of backupData.settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
    console.log("Settings imported!");
  }
  
  // 8. Testimonials
  if (backupData.testimonials && backupData.testimonials.length > 0) {
    console.log(`\nImporting ${backupData.testimonials.length} testimonials...`);
    for (const testimonial of backupData.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: testimonial.id },
        update: testimonial,
        create: testimonial,
      });
    }
    console.log("Testimonials imported!");
  }
  
  // 9. Menus
  if (backupData.menus && backupData.menus.length > 0) {
    console.log(`\nImporting ${backupData.menus.length} menus...`);
    for (const menu of backupData.menus) {
      await prisma.menu.upsert({
        where: { id: menu.id },
        update: menu,
        create: menu,
      });
    }
    console.log("Menus imported!");
  }
  
  // 10. Pages
  if (backupData.pages && backupData.pages.length > 0) {
    console.log(`\nImporting ${backupData.pages.length} pages...`);
    for (const page of backupData.pages) {
      await prisma.page.upsert({
        where: { id: page.id },
        update: page,
        create: page,
      });
    }
    console.log("Pages imported!");
  }
  
  console.log("\n✅ Data import completed!");
  
  // Verify counts
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  console.log(`\nVerification:`);
  console.log(`- Products in DB: ${productCount}`);
  console.log(`- Categories in DB: ${categoryCount}`);
}

importData()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
