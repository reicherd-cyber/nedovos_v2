"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import {
  inviteMemberSchema,
  switchOrgSchema,
  type FormState,
} from "@/lib/schemas/auth";
import { requireRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/server/audit/write-audit-log";
import { prisma } from "@/server/prisma";

export async function switchActiveOrg(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const parsed = switchOrgSchema.safeParse({
    orgId: formData.get("orgId"),
  });

  if (!parsed.success) {
    redirect("/dashboard");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId: parsed.data.orgId,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeOrgId: parsed.data.orgId },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function inviteMember(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { session } = await requireRole([Role.ADMIN]);

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success || !session.user.activeOrgId) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.success
        ? undefined
        : parsed.error.flatten().fieldErrors,
    };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const invitation = await prisma.invitation.create({
    data: {
      email: parsed.data.email,
      token,
      orgId: session.user.activeOrgId,
      role: parsed.data.role,
      invitedByUserId: session.user.id,
      expiresAt,
    },
  });

  await writeAuditLog(prisma, {
    orgId: session.user.activeOrgId,
    actorUserId: session.user.id,
    action: "membership.invite",
    targetType: "Invitation",
    targetId: invitation.id,
    payload: {
      email: invitation.email,
      role: invitation.role,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: `/accept-invite/${invitation.token}`,
  };
}
