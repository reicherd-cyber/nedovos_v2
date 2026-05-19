"use server";

import { type FormState, emailSchema } from "@/lib/schemas/auth";
import { sendPasswordResetEmail } from "@/server/auth/mailer";
import { getDevOutboxUrl } from "@/server/dev-email";
import { prisma } from "@/server/prisma";

export async function requestPasswordReset(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: "יש להזין כתובת אימייל תקינה.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    await sendPasswordResetEmail({
      email: parsed.data.email,
      name: user.name,
    });
  }

  return {
    success: getDevOutboxUrl(parsed.data.email, "password-reset"),
  };
}
