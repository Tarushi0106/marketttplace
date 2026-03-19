require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  
  // Check if variant exists
  const v = await prisma.productVariant.findUnique({ 
    where: { id: 'cmmwl3e300001tltze8p2govn' }
  });
  console.log('Variant:', v ? v.name : 'NOT FOUND');
  
  // List all variants
  const variants = await prisma.productVariant.findMany({ take: 10 });
  console.log('All variants:', variants.length);
  variants.forEach(v => console.log('-', v.id, v.name));
}

main()
  .catch(e => { console.error('Error:', e.message); })
  .finally(() => prisma.$disconnect());
