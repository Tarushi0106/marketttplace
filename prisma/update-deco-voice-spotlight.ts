import { prisma } from "../src/lib/prisma";

async function main() {
  // The original storefront filter code already expects an "AI Voice Automation"
  // category (alongside "AI Video Surveillance" / "AI Talent Intelligence") —
  // it just never existed in the seed data. Create it and move Deco Voice into it.
  const category = await prisma.category.upsert({
    where: { slug: "ai-voice-automation" },
    update: {},
    create: {
      name: "AI Voice Automation",
      slug: "ai-voice-automation",
      icon: "Mic",
      sortOrder: 7,
    },
  });

  const updated = await prisma.product.update({
    where: { slug: "deco-voice" },
    data: {
      categoryId: category.id,
      specifications: {
        "Languages supported": "10+",
        "Response time": "Faster",
        "Business availability": "24/7",
        "Unlimited scalability": "∞",
      },
    },
  });

  console.log("Deco Voice updated:", updated.id, "-> category:", category.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
