import { PrismaClient } from "@prisma/client";
import { runtimeEnv } from "@/runtime-env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use runtime environment variables for AWS Amplify SSR
const databaseUrl = process.env.DATABASE_URL || runtimeEnv.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
