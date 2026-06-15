import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KEEP_SLUGS = ["hr-bot", "deco-talent", "vsaas", "deco-voice"];

async function main() {
  const toDelete = await prisma.product.findMany({
    where: { slug: { notIn: KEEP_SLUGS } },
    select: { id: true, name: true, slug: true },
  });

  if (toDelete.length === 0) {
    console.log("No products to delete.");
    return;
  }

  console.log("Deleting:");
  toDelete.forEach((p) => console.log(`  - ${p.name} (${p.slug})`));

  await prisma.product.deleteMany({
    where: { slug: { notIn: KEEP_SLUGS } },
  });

  console.log(`\nDeleted ${toDelete.length} products.`);

  const remaining = await prisma.product.findMany({ select: { name: true, slug: true } });
  console.log("\nRemaining products:");
  remaining.forEach((p) => console.log(`  ✓ ${p.name} (${p.slug})`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
