"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import type { FormState } from "@/lib/schemas/auth";
import {
  donorFormSchema,
  donorImportSchema,
  donorNoteSchema,
} from "@/lib/schemas/donors";
import { requireRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/server/audit/write-audit-log";
import {
  addDonorNote,
  createDonor,
  importDonorsFromCsv,
  updateDonor,
} from "@/server/donors/repository";
import { prisma } from "@/server/prisma";

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseTags(rawTags?: string) {
  return (rawTags ?? "")
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createDonorAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);

  const parsed = donorFormSchema.safeParse({
    fullName: formData.get("fullName"),
    nationalId: formData.get("nationalId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    language: formData.get("language"),
    tags: formData.get("tags"),
  });

  if (!parsed.success || !session.user.activeOrgId) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const donor = await createDonor(session.user.activeOrgId, {
    fullName: parsed.data.fullName,
    nationalId: normalizeOptional(parsed.data.nationalId),
    email: normalizeOptional(parsed.data.email),
    phone: normalizeOptional(parsed.data.phone),
    addressLine1: normalizeOptional(parsed.data.addressLine1),
    city: normalizeOptional(parsed.data.city),
    language: normalizeOptional(parsed.data.language),
    tags: parseTags(parsed.data.tags),
  });

  await writeAuditLog(prisma, {
    orgId: session.user.activeOrgId,
    actorUserId: session.user.id,
    action: "donor.create",
    targetType: "Donor",
    targetId: donor.id,
    payload: {
      fullName: donor.fullName,
    },
  });

  revalidatePath("/dashboard/donors");

  redirect(`/dashboard/donors/${donor.id}?created=1`);
}

export async function updateDonorAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);

  const parsed = donorFormSchema.safeParse({
    donorId: formData.get("donorId"),
    fullName: formData.get("fullName"),
    nationalId: formData.get("nationalId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    language: formData.get("language"),
    tags: formData.get("tags"),
  });

  if (!parsed.success || !parsed.data.donorId || !session.user.activeOrgId) {
    return {
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const donor = await updateDonor(session.user.activeOrgId, parsed.data.donorId, {
    fullName: parsed.data.fullName,
    nationalId: normalizeOptional(parsed.data.nationalId),
    email: normalizeOptional(parsed.data.email),
    phone: normalizeOptional(parsed.data.phone),
    addressLine1: normalizeOptional(parsed.data.addressLine1),
    city: normalizeOptional(parsed.data.city),
    language: normalizeOptional(parsed.data.language),
    tags: parseTags(parsed.data.tags),
  });

  if (!donor) {
    return {
      error: "התורם לא נמצא בארגון הפעיל.",
    };
  }

  await writeAuditLog(prisma, {
    orgId: session.user.activeOrgId,
    actorUserId: session.user.id,
    action: "donor.update",
    targetType: "Donor",
    targetId: donor.id,
    payload: {
      fullName: parsed.data.fullName,
    },
  });

  revalidatePath("/dashboard/donors");
  revalidatePath(`/dashboard/donors/${donor.id}`);

  return {
    success: "פרטי התורם נשמרו בהצלחה.",
  };
}

export async function addDonorNoteAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);

  const parsed = donorNoteSchema.safeParse({
    donorId: formData.get("donorId"),
    body: formData.get("body"),
  });

  if (!parsed.success || !session.user.activeOrgId) {
    return {
      error: "יש להזין תוכן הערה תקין.",
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  const note = await addDonorNote(
    session.user.activeOrgId,
    parsed.data.donorId,
    parsed.data.body,
    session.user.id,
  );

  if (!note) {
    return {
      error: "התורם לא נמצא בארגון הפעיל.",
    };
  }

  await writeAuditLog(prisma, {
    orgId: session.user.activeOrgId,
    actorUserId: session.user.id,
    action: "donor.note_add",
    targetType: "DonorNote",
    targetId: note.id,
    payload: {
      donorId: parsed.data.donorId,
    },
  });

  revalidatePath(`/dashboard/donors/${parsed.data.donorId}`);

  return {
    success: "ההערה נוספה.",
  };
}

export async function importDonorsAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);

  const parsed = donorImportSchema.safeParse({
    csv: formData.get("csv"),
  });

  if (!parsed.success || !session.user.activeOrgId) {
    return {
      error: "יש להדביק תוכן CSV תקין.",
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const importedCount = await importDonorsFromCsv(
      session.user.activeOrgId,
      parsed.data.csv,
    );

    await writeAuditLog(prisma, {
      orgId: session.user.activeOrgId,
      actorUserId: session.user.id,
      action: "donor.import_csv",
      targetType: "Donor",
      payload: {
        importedCount,
      },
    });

    revalidatePath("/dashboard/donors");

    return {
      success: `יובאו ${importedCount} תורמים.`,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_NAME_COLUMN") {
      return {
        error: "קובץ ה-CSV חייב לכלול עמודת שם, Name או Full Name.",
      };
    }

    throw error;
  }
}
