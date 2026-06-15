import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findUnique({ where: { slug: "hr-bot" }, include: { variants: true, images: true, category: true } });
  console.log(JSON.stringify(p, null, 2));
  await prisma.$disconnect();
}
main();
