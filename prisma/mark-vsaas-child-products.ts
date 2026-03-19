import { prisma } from "../src/lib/prisma";

async function markVsaasChildProducts() {
  console.log("Finding and marking VSAAS child products...");

  // Find products with vsaas in the slug that should be marked as child
  const vsaasProducts = await prisma.product.findMany({
    where: {
      slug: {
        contains: "vsaas",
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  console.log("Found VSAAS products:", vsaasProducts);

  // Mark all VSAAS products as child except the main VSAAS product
  for (const product of vsaasProducts) {
    // Skip the main VSAAS product (just "vsaas")
    if (product.slug === "vsaas") {
      console.log(`Skipping main VSAAS product: ${product.name} (${product.slug})`);
      continue;
    }

    // Mark as child product
    await prisma.product.update({
      where: { id: product.id },
      data: { isChild: true },
    });

    console.log(`Marked as child: ${product.name} (${product.slug})`);
  }

  console.log("Done!");
}

markVsaasChildProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
