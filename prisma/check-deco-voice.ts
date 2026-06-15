import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "deco-voice" },
    select: { name: true, description: true, features: true, shortDescription: true, specifications: true },
  });
  console.log(JSON.stringify(p, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
