"use server";

import { donationIntentSchema } from "@/lib/schemas/donations";
import type { FormState } from "@/lib/schemas/auth";
import { prisma } from "@/server/prisma";

export async function createDonationIntentAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = donationIntentSchema.safeParse({
    orgId: formData.get("orgId"),
    purpose: formData.get("purpose"),
    donorFullName: formData.get("donorFullName"),
    donorEmail: formData.get("donorEmail"),
    donorPhone: formData.get("donorPhone"),
    amount: formData.get("amount"),
    recurring: formData.get("recurring") ?? "false",
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const org = await prisma.org.findFirst({
    where: {
      id: parsed.data.orgId,
      publicListingEnabled: true,
    },
    select: {
      id: true,
    },
  });

  if (!org) {
    return {
      error: "הארגון לא נמצא או שאינו פתוח לקבלת תרומות ציבוריות.",
    };
  }

  const amountMinor = Math.round(parsed.data.amount * 100);

  const intent = await prisma.donationIntent.create({
    data: {
      orgId: org.id,
      donorFullName: parsed.data.donorFullName,
      donorEmail: parsed.data.donorEmail,
      donorPhone: parsed.data.donorPhone,
      amountMinor,
      purpose: parsed.data.purpose,
      recurring: parsed.data.recurring,
      note: parsed.data.note,
    },
  });

  return {
    success: `בקשת התרומה נשמרה. מספר פנייה: ${intent.id}`,
  };
}
