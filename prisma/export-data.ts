import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function exportData() {
  console.log("Exporting database data...");

  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",

    // Users (excluding sensitive data like passwords)
    users: await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),

    // Categories
    categories: await prisma.category.findMany(),

    // SubCategories
    subCategories: await prisma.subCategory.findMany(),

    // Products
    products: await prisma.product.findMany(),

    // Product Images
    productImages: await prisma.productImage.findMany(),

    // Product Variants
    productVariants: await prisma.productVariant.findMany(),

    // Product Addons
    productAddons: await prisma.productAddon.findMany(),

    // Product Configs
    productConfigs: await prisma.productConfig.findMany(),

    // Bundles
    bundles: await prisma.bundle.findMany(),

    // Bundle Items
    bundleItems: await prisma.bundleItem.findMany(),

    // Pricing Tiers
    pricingTiers: await prisma.pricingTier.findMany(),

    // Discounts
    discounts: await prisma.discount.findMany(),

    // Company Info
    companyInfo: await prisma.companyInfo.findMany(),

    // Settings
    settings: await prisma.setting.findMany(),

    // Pages
    pages: await prisma.page.findMany(),

    // Page Sections
    pageSections: await prisma.pageSection.findMany(),

    // SEO Metadata
    seoMetadata: await prisma.seoMetadata.findMany(),

    // Menus
    menus: await prisma.menu.findMany(),

    // Menu Items
    menuItems: await prisma.menuItem.findMany(),

    // Media
    media: await prisma.media.findMany(),

    // Trending Categories
    trendingCategories: await prisma.trendingCategory.findMany(),

    // Testimonials
    testimonials: await prisma.testimonial.findMany(),

    // Company Logos
    companyLogos: await prisma.companyLogo.findMany(),
  };

  const outputPath = path.join(__dirname, "database-backup.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`Data exported to: ${outputPath}`);
  console.log("\nExport summary:");
  console.log(`- Users: ${data.users.length}`);
  console.log(`- Categories: ${data.categories.length}`);
  console.log(`- SubCategories: ${data.subCategories.length}`);
  console.log(`- Products: ${data.products.length}`);
  console.log(`- Product Variants: ${data.productVariants.length}`);
  console.log(`- Bundles: ${data.bundles.length}`);
  console.log(`- Pages: ${data.pages.length}`);
  console.log(`- Menus: ${data.menus.length}`);
  console.log(`- Testimonials: ${data.testimonials.length}`);
  console.log(`- Company Logos: ${data.companyLogos.length}`);
}

exportData()
  .catch((e) => {
    console.error("Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
