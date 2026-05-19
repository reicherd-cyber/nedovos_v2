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
  const token = String(formData.get("token") ?? "");

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return {
      error: "ההזמנה לא תקפה או פגה.",
    };
  }

  const session = await auth();

  const parsed =
    session?.user?.id
      ? {
          success: true as const,
          data: {
            token,
            name: session.user.name ?? "",
            password: "",
            confirmPassword: "",
          },
        }
      : acceptInvitationSchema.safeParse({
          token,
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

  const passwordHash = parsed.data.password
    ? await hash(parsed.data.password, 12)
    : null;

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
            passwordHash: passwordHash ?? undefined,
            emailVerified: new Date(),
          },
        });

        userId = createdUser.id;
      } else {
        const existingUser = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser || existingUser.email?.toLowerCase() !== invitation.email.toLowerCase()) {
          throw new Error("EMAIL_MISMATCH");
        }

        if (!existingUser.emailVerified) {
          await tx.user.update({
            where: { id: userId },
            data: { emailVerified: new Date() },
          });
        }
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

    if (error instanceof Error && error.message === "EMAIL_MISMATCH") {
      return {
        error: "החשבון המחובר אינו תואם לכתובת האימייל של ההזמנה.",
      };
    }

    throw error;
  }

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  redirect(`/sign-in?invited=1&email=${encodeURIComponent(invitation.email)}`);
}
