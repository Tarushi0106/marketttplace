// Script to push Prisma schema to production database
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Pushing schema to production database...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    // This will just test the connection
    await prisma.$connect();
    console.log('Connected to production database successfully!');
    
    // Now run the migration using prisma migrate
    const { execSync } = require('child_process');
    
    // Use the DATABASE_URL from env
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";
    
    execSync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
      },
      stdio: 'inherit'
    });
    
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
