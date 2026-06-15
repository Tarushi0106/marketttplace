import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "AI Video Surveillance",
    slug: "ai-video-surveillance",
    description: "Cloud-hosted cameras, AI motion detection, and real-time alerts.",
    productSlug: "vsaas",
  },
  {
    name: "AI Voice Automation",
    slug: "ai-voice-automation",
    description: "Fully automated inbound & outbound AI voice calls with CRM sync.",
    productSlug: "deco-voice",
  },
  {
    name: "AI Talent Intelligence",
    slug: "ai-talent-intelligence",
    description: "Resume scoring, AI voice interviews, and 10-parameter candidate reports.",
    productSlug: "deco-talent",
  },
];

async function main() {
  // Upsert the 3 new categories
  const created = [];
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    created.push(c);
    console.log("Category ready:", c.name, c.slug);

    // Assign product to this category
    await prisma.product.update({
      where: { slug: cat.productSlug },
      data: { categoryId: c.id },
    });
    console.log(" → Assigned product:", cat.productSlug);
  }

  // Delete all other categories (not the 3 new ones)
  const keepIds = created.map((c) => c.id);
  const deleted = await prisma.category.deleteMany({
    where: { id: { notIn: keepIds } },
  });
  console.log(`Deleted ${deleted.count} old categories.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
