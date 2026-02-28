/**
 * Remove markdown bold syntax (**text**) from product descriptions and specifications
 * Run with: npx ts-node prisma/remove-markdown-bold.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeMarkdownBold() {
  console.log('🔍 Finding products with markdown bold syntax...');
  
  // Get all products
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });
  
  let updatedCount = 0;
  
  for (const product of products) {
    let needsUpdate = false;
    const updates: Record<string, any> = {};
    
    // Check shortDescription
    if (product.shortDescription && product.shortDescription.includes('**')) {
      updates.shortDescription = product.shortDescription.replace(/\*\*/g, '');
      needsUpdate = true;
    }
    
    // Check description
    if (product.description && product.description.includes('**')) {
      updates.description = product.description.replace(/\*\*/g, '');
      needsUpdate = true;
    }
    
    // Update product if needed
    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
      updatedCount++;
      console.log(`✅ Updated product: ${product.name}`);
    }
    
    // Check variants for specifications
    for (const variant of product.variants) {
      if (variant.attributes) {
        const attrs = variant.attributes as Record<string, any>;
        const specUpdates: Record<string, any> = {};
        let variantNeedsUpdate = false;
        
        for (const [key, value] of Object.entries(attrs)) {
          if (typeof value === 'string' && value.includes('**')) {
            specUpdates[key] = value.replace(/\*\*/g, '');
            variantNeedsUpdate = true;
          }
        }
        
        if (variantNeedsUpdate) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { attributes: { ...attrs, ...specUpdates } },
          });
          console.log(`  ✅ Updated variant: ${variant.name}`);
        }
      }
    }
  }
  
  console.log(`\n✨ Done! Updated ${updatedCount} products.`);
}

removeMarkdownBold()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
