import type { Prisma, User } from "@prisma/client";
import { Role } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { writeAuditLog } from "@/server/audit/write-audit-log";
import { createUniqueOrgSlug } from "@/server/auth/slug";

type Tx = Prisma.TransactionClient;

async function createOrgForUser(tx: Tx, user: Pick<User, "id" | "name" | "email">) {
  const orgLabel =
    user.name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "ארגון חדש";

  const org = await tx.org.create({
    data: {
      name: orgLabel,
      slug: await createUniqueOrgSlug(orgLabel, tx),
      createdByUserId: user.id,
    },
  });

  await tx.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: Role.ADMIN,
    },
  });

  await tx.user.update({
    where: { id: user.id },
    data: { activeOrgId: org.id },
  });

  await writeAuditLog(tx, {
    orgId: org.id,
    actorUserId: user.id,
    action: "org.bootstrap",
    targetType: "Org",
    targetId: org.id,
    payload: {
      createdBy: user.email ?? user.id,
    },
  });

  return org;
}

export async function ensureUserHasOrg(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  if (user.memberships.length > 0) {
    const activeOrgId = user.activeOrgId ?? user.memberships[0]?.orgId ?? null;

    if (activeOrgId && activeOrgId !== user.activeOrgId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeOrgId },
      });
    }

    return activeOrgId;
  }

  const org = await prisma.$transaction(async (tx) =>
    createOrgForUser(tx, {
      id: user.id,
      name: user.name,
      email: user.email,
    }),
  );

  return org.id;
}
