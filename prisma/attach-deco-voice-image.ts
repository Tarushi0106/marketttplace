import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({ where: { slug: "deco-voice" } });
  if (!product) {
    console.error("Deco Voice product not found");
    process.exit(1);
  }

  // Remove any existing images first
  await prisma.productImage.deleteMany({ where: { productId: product.id } });

  const image = await prisma.productImage.create({
    data: {
      productId: product.id,
      url: "/uploads/deco-voice-2.jpeg",
      alt: "Deco Voice - AI Voice Bot",
      isPrimary: true,
      sortOrder: 0,
    },
  });

  console.log("Image attached:", image.id, "->", image.url);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
