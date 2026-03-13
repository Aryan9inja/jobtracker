import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function normalizeDatabaseUrl(url: string): string {
  const schemeNormalized = url.replace(/^mysql:\/\//i, "mariadb://");
  const hasAllowPublicKeyRetrieval = /(?:\?|&)allowPublicKeyRetrieval=/i.test(schemeNormalized);
  if (hasAllowPublicKeyRetrieval) return schemeNormalized;
  return `${schemeNormalized}${schemeNormalized.includes("?") ? "&" : "?"}allowPublicKeyRetrieval=true`;
}

function createPrismaClient() {
  // Prefer DATABASE_URL so runtime defaults match Prisma tooling defaults.
  const databaseUrl = process.env.DATABASE_URL;
  const runtimeUrl = databaseUrl ? normalizeDatabaseUrl(databaseUrl) : null;

  const adapter = new PrismaMariaDb(
    runtimeUrl
      ? runtimeUrl
      : {
          host: process.env.DB_HOST ?? "localhost",
          port: Number(process.env.DB_PORT ?? 3306),
          user: process.env.DB_USER ?? "root",
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME ?? "jobtracker",
          allowPublicKeyRetrieval: true,
          connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 5000),
          acquireTimeout: Number(process.env.DB_ACQUIRE_TIMEOUT_MS ?? 5000),
          connectionLimit: Number(process.env.DB_POOL_LIMIT ?? 10),
          bigIntAsNumber: true,
        },
    {
      onConnectionError: (err) => {
        console.error("Prisma MariaDB connection error:", err.message);
      },
    }
  );

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
