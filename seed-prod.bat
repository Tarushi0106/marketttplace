@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_CPbtog2S4hVN@ep-proud-fire-ai5rehvt-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
cd /d e:\marketplacee\marketplace
npx ts-node prisma/seed.ts
