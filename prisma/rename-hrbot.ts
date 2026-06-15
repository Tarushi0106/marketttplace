import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.product.update({
    where: { slug: "hr-bot" },
    data: { name: "Deco Talent" },
  });
  console.log("Updated:", r.name);
}
main().catch(console.error).finally(() => prisma.$disconnect());
