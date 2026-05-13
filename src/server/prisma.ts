import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const sslAcceptMode = parsedDatabaseUrl.searchParams.get("sslaccept");
const databaseName = parsedDatabaseUrl.pathname.replace(/^\//, "");

const adapter = new PrismaMariaDb({
  host: parsedDatabaseUrl.hostname,
  port: parsedDatabaseUrl.port ? Number(parsedDatabaseUrl.port) : 3306,
  user: decodeURIComponent(parsedDatabaseUrl.username),
  password: decodeURIComponent(parsedDatabaseUrl.password),
  database: databaseName,
  connectionLimit: 5,
  ssl:
    sslAcceptMode === "accept_invalid_certs"
      ? { rejectUnauthorized: false }
      : sslAcceptMode
        ? true
        : undefined,
});

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
