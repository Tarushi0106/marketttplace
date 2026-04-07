import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createVSAASProduct() {
  try {
    // Check if VSAAS product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { slug: "vsaas" }
    });

    if (existingProduct) {
      console.log("VSAAS product already exists with ID:", existingProduct.id);
      // Update the existing product
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: "VSAAS",
          shortDescription: "Choose between Cloud or On-Premise deployment",
          description: "VSAAS provides comprehensive video management solutions. Choose our cloud-based deployment for easy scalability or on-premise for complete data control."
        }
      });
      console.log("VSAAS product updated!");
      return;
    }

    // Find the category for VSAAS
    const category = await prisma.category.findFirst({
      where: { 
        slug: { contains: "vsaas", mode: "insensitive" }
      }
    });

    // Create the VSAAS product
    const product = await prisma.product.create({
      data: {
        name: "VSAAS",
        slug: "vsaas",
        shortDescription: "Choose between Cloud or On-Premise deployment",
        description: "VSAAS (Video Surveillance as a Service) provides comprehensive video management solutions. Choose our cloud-based deployment for easy scalability or on-premise for complete data control.",
        basePrice: 0,
        status: "ACTIVE",
        productType: "CONFIGURABLE",
        categoryId: category?.id || null,
        isFeatured: true,
      }
    });

    console.log("VSAAS product created with ID:", product.id);
    console.log("Product URL will be: /products/vsaas");
    console.log("Configure URL will be: /products/vsaas/configure");
  } catch (error) {
    console.error("Error creating VSAAS product:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createVSAASProduct();
