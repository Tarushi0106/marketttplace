import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkVSAASPrices() {
  try {
    const vsaasOnPremise = await prisma.product.findFirst({
      where: { slug: "vsaas-on-premise" },
      include: { 
        variants: { include: { recurringPrices: true } },
        recurringPrices: true
      }
    });

    console.log("=== VSAAS On-Premise Product ===");
    console.log("Product ID:", vsaasOnPremise?.id);
    console.log("Product Name:", vsaasOnPremise?.name);
    
    console.log("\n=== Product-level Recurring Prices ===");
    console.log(JSON.stringify(vsaasOnPremise?.recurringPrices, null, 2));
    
    console.log("\n=== Variants ===");
    vsaasOnPremise?.variants.forEach(variant => {
      console.log(`\nVariant: ${variant.name} (${variant.id})`);
      console.log("Price:", variant.price);
      console.log("Recurring Prices:", JSON.stringify(variant.recurringPrices, null, 2));
    });

    // Also check connect-cloud
    const connectCloud = await prisma.product.findFirst({
      where: { slug: "connect-cloud" },
      include: { 
        variants: { include: { recurringPrices: true } },
        recurringPrices: true
      }
    });

    console.log("\n\n=== Connect Cloud Product ===");
    console.log("Product ID:", connectCloud?.id);
    console.log("Product Name:", connectCloud?.name);
    
    console.log("\n=== Product-level Recurring Prices ===");
    console.log(JSON.stringify(connectCloud?.recurringPrices, null, 2));
    
    console.log("\n=== Variants ===");
    connectCloud?.variants.forEach(variant => {
      console.log(`\nVariant: ${variant.name} (${variant.id})`);
      console.log("Price:", variant.price);
      console.log("Recurring Prices:", JSON.stringify(variant.recurringPrices, null, 2));
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVSAASPrices();
