import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/prisma";

type SlugClient = PrismaClient | Prisma.TransactionClient;

function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "org";
}

export async function createUniqueOrgSlug(base: string, client: SlugClient = prisma) {
  const root = slugify(base);
  let candidate = root;
  let counter = 2;

  while (await client.org.findUnique({ where: { slug: candidate } })) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }

  return candidate;
}
