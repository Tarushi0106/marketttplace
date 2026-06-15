import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Rename hr-bot back to HR Bot
  const r = await prisma.product.update({
    where: { slug: "hr-bot" },
    data: { name: "HR Bot" },
  });
  console.log("Reverted to:", r.name);

  // Remove the deco-talent image from hr-bot
  await prisma.productImage.deleteMany({
    where: { product: { slug: "hr-bot" } },
  });
  console.log("Removed image from hr-bot");
}

main().catch(console.error).finally(() => prisma.$disconnect());
