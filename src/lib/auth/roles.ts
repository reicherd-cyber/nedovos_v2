import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import type { Role } from "@prisma/client";

export async function requireRole(roles: Role[]) {
  const session = await auth();

  if (!session?.user?.id || !session.user.activeOrgId) {
    redirect("/sign-in");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId: session.user.activeOrgId,
      },
    },
  });

  if (!membership || !roles.includes(membership.role)) {
    redirect("/dashboard?forbidden=1");
  }

  return { session, membership };
}
