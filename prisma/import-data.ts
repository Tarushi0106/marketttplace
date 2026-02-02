import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function importData() {
  const backupPath = path.join(__dirname, "database-backup.json");

  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found:", backupPath);
    process.exit(1);
  }

  console.log("Importing database data from backup...");
  const data = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

  console.log(`Backup created at: ${data.exportedAt}`);

  // Create admin user with default password
  const adminPassword = await bcrypt.hash("admin@123", 12);
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? adminPassword : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(),
      },
    });
  }
  console.log(`Imported ${data.users.length} users`);

  // Categories
  for (const item of data.categories) {
    await prisma.category.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.categories.length} categories`);

  // SubCategories
  for (const item of data.subCategories) {
    await prisma.subCategory.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.subCategories.length} subcategories`);

  // Products
  for (const item of data.products) {
    await prisma.product.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.products.length} products`);

  // Product Images
  for (const item of data.productImages) {
    await prisma.productImage.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
      },
    });
  }
  console.log(`Imported ${data.productImages.length} product images`);

  // Product Variants
  for (const item of data.productVariants) {
    await prisma.productVariant.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.productVariants.length} product variants`);

  // Product Addons
  for (const item of data.productAddons) {
    await prisma.productAddon.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.productAddons.length} product addons`);

  // Product Configs
  for (const item of data.productConfigs) {
    await prisma.productConfig.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.productConfigs.length} product configs`);

  // Bundles
  for (const item of data.bundles) {
    await prisma.bundle.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.bundles.length} bundles`);

  // Bundle Items
  for (const item of data.bundleItems) {
    await prisma.bundleItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
      },
    });
  }
  console.log(`Imported ${data.bundleItems.length} bundle items`);

  // Pricing Tiers
  for (const item of data.pricingTiers) {
    await prisma.pricingTier.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.pricingTiers.length} pricing tiers`);

  // Discounts
  for (const item of data.discounts) {
    await prisma.discount.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        startsAt: item.startsAt ? new Date(item.startsAt) : null,
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.discounts.length} discounts`);

  // Company Info
  for (const item of data.companyInfo) {
    await prisma.companyInfo.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.companyInfo.length} company info records`);

  // Settings
  for (const item of data.settings) {
    await prisma.setting.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.settings.length} settings`);

  // Pages
  for (const item of data.pages) {
    await prisma.page.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.pages.length} pages`);

  // Page Sections
  for (const item of data.pageSections) {
    await prisma.pageSection.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.pageSections.length} page sections`);

  // SEO Metadata
  for (const item of data.seoMetadata) {
    await prisma.seoMetadata.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.seoMetadata.length} SEO metadata records`);

  // Menus
  for (const item of data.menus) {
    await prisma.menu.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.menus.length} menus`);

  // Menu Items (handle parent-child relationships)
  const menuItemsWithoutParent = data.menuItems.filter((item: any) => !item.parentId);
  const menuItemsWithParent = data.menuItems.filter((item: any) => item.parentId);

  for (const item of menuItemsWithoutParent) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }

  for (const item of menuItemsWithParent) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.menuItems.length} menu items`);

  // Media
  for (const item of data.media) {
    await prisma.media.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.media.length} media files`);

  // Trending Categories
  for (const item of data.trendingCategories) {
    await prisma.trendingCategory.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.trendingCategories.length} trending categories`);

  // Testimonials
  for (const item of data.testimonials) {
    await prisma.testimonial.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.testimonials.length} testimonials`);

  // Company Logos
  for (const item of data.companyLogos) {
    await prisma.companyLogo.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log(`Imported ${data.companyLogos.length} company logos`);

  console.log("\nDatabase import completed successfully!");
}

importData()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
