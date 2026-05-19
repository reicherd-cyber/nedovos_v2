import { queueDevEmail } from "@/server/dev-email";
import { buildAppUrl, issueAuthToken } from "@/server/auth/tokens";

export async function sendVerificationEmail(input: {
  email: string;
  name?: string | null;
}) {
  const issued = await issueAuthToken({
    type: "verify-email",
    email: input.email,
    ttlHours: 24,
  });

  const actionUrl = buildAppUrl(
    `/verify-email/${issued.token}?email=${encodeURIComponent(input.email)}`,
  );

  return queueDevEmail({
    kind: "verify-email",
    toEmail: input.email.toLowerCase(),
    subject: "אימות כתובת האימייל שלך",
    previewText: `לחיצה על הקישור תאמת את כתובת האימייל עבור ${input.name ?? input.email}.`,
    actionUrl,
  });
}

export async function sendVerificationReminder(input: {
  email: string;
  name?: string | null;
}) {
  const issued = await issueAuthToken({
    type: "verify-email",
    email: input.email,
    ttlHours: 24,
  });

  const actionUrl = buildAppUrl(
    `/verify-email/${issued.token}?email=${encodeURIComponent(input.email)}`,
  );

  return queueDevEmail({
    kind: "verification-reminder",
    toEmail: input.email.toLowerCase(),
    subject: "שליחה חוזרת של אימות האימייל",
    previewText: `נוצר קישור אימות חדש עבור ${input.name ?? input.email}.`,
    actionUrl,
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name?: string | null;
}) {
  const issued = await issueAuthToken({
    type: "password-reset",
    email: input.email,
    ttlHours: 2,
  });

  const actionUrl = buildAppUrl(
    `/reset-password/${issued.token}?email=${encodeURIComponent(input.email)}`,
  );

  return queueDevEmail({
    kind: "password-reset",
    toEmail: input.email.toLowerCase(),
    subject: "איפוס סיסמה",
    previewText: `נוצר קישור איפוס סיסמה עבור ${input.name ?? input.email}.`,
    actionUrl,
  });
}

export async function sendInvitationEmail(input: {
  email: string;
  orgName: string;
  invitationUrl: string;
}) {
  return queueDevEmail({
    kind: "invitation",
    toEmail: input.email.toLowerCase(),
    subject: `הזמנה להצטרף אל ${input.orgName}`,
    previewText: `נוצר קישור הזמנה ל-${input.orgName}.`,
    actionUrl: input.invitationUrl,
  });
}
