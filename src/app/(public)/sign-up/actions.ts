"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { signUpSchema, type FormState } from "@/lib/schemas/auth";
import { writeAuditLog } from "@/server/audit/write-audit-log";
import { createUniqueOrgSlug } from "@/server/auth/slug";
import { prisma } from "@/server/prisma";

export async function registerUser(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    orgName: formData.get("orgName"),
  });

  if (!parsed.success) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return {
      error: "כבר קיים משתמש עם כתובת האימייל הזו.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const slug = await createUniqueOrgSlug(parsed.data.orgName);

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    const org = await tx.org.create({
      data: {
        name: parsed.data.orgName,
        slug,
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
      action: "user.register",
      targetType: "User",
      targetId: user.id,
      payload: {
        email: user.email,
      },
    });

    return user;
  });

  redirect(
    `/sign-in?registered=1&email=${encodeURIComponent(createdUser.email ?? "")}`,
  );
}
