import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function attachImage(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) { console.log(`Not found: ${slug}`); return; }

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: "/uploads/deco-talent.jpeg",
      alt: "Deco Talent AI Interview Platform",
      isPrimary: true,
      sortOrder: 0,
    },
  });
  console.log(`Image attached to: ${product.name} (${slug})`);
}

async function main() {
  await attachImage("deco-talent");
  await attachImage("hr-bot");
}

main().catch(console.error).finally(() => prisma.$disconnect());
