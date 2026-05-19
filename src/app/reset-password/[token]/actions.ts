"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import {
  resetPasswordSchema,
  type FormState,
} from "@/lib/schemas/auth";
import { consumeAuthToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";

export async function resetPassword(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const record = await consumeAuthToken({
    type: "password-reset",
    email: parsed.data.email,
    token: parsed.data.token,
  });

  if (!record) {
    return {
      error: "קישור איפוס הסיסמה אינו תקף או שפג תוקפו.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { email: parsed.data.email },
    data: { passwordHash },
  });

  redirect(`/sign-in?passwordReset=1&email=${encodeURIComponent(parsed.data.email)}`);
}
