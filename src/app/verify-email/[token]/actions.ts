"use server";

import { redirect } from "next/navigation";
import { consumeAuthToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";

export async function verifyEmailAddress(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase();

  const record = await consumeAuthToken({
    type: "verify-email",
    email,
    token,
  });

  if (!record) {
    redirect(
      `/sign-in?verificationError=1&email=${encodeURIComponent(email)}`,
    );
  }

  await prisma.user.updateMany({
    where: {
      email,
      emailVerified: null,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  redirect(`/sign-in?verified=1&email=${encodeURIComponent(email)}`);
}
