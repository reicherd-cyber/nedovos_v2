"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  acceptInvitationSchema,
  type FormState,
} from "@/lib/schemas/auth";
import { writeAuditLog } from "@/server/audit/write-audit-log";
import { prisma } from "@/server/prisma";

export async function acceptInvitation(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = acceptInvitationSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token: parsed.data.token },
  });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return {
      error: "ההזמנה לא תקפה או פגה.",
    };
  }

  const session = await auth();
  const passwordHash = await hash(parsed.data.password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      let userId = session?.user?.id ?? null;

      if (!userId) {
        const existingUser = await tx.user.findUnique({
          where: { email: invitation.email },
        });

        if (existingUser) {
          throw new Error("EXISTING_USER");
        }

        const createdUser = await tx.user.create({
          data: {
            name: parsed.data.name,
            email: invitation.email,
            passwordHash,
          },
        });

        userId = createdUser.id;
      }

      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId: invitation.orgId,
          },
        },
      });

      if (!existingMembership) {
        await tx.membership.create({
          data: {
            userId,
            orgId: invitation.orgId,
            role: invitation.role,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { activeOrgId: invitation.orgId },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
          acceptedByUserId: userId,
        },
      });

      await writeAuditLog(tx, {
        orgId: invitation.orgId,
        actorUserId: userId,
        action: "membership.accept_invite",
        targetType: "Invitation",
        targetId: invitation.id,
        payload: {
          email: invitation.email,
          role: invitation.role,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EXISTING_USER") {
      return {
        error: "כבר קיים משתמש עם האימייל הזה. יש להתחבר לחשבון הקיים ולקבל שוב את ההזמנה.",
      };
    }

    throw error;
  }

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  redirect(`/sign-in?invited=1&email=${encodeURIComponent(invitation.email)}`);
}
