import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Delete images first
  await prisma.productImage.deleteMany({ where: { product: { slug: "hr-bot" } } });
  // Delete variants
  await prisma.productVariant.deleteMany({ where: { product: { slug: "hr-bot" } } });
  // Delete the product
  const deleted = await prisma.product.delete({ where: { slug: "hr-bot" } });
  console.log("Deleted:", deleted.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
