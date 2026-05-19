import { z } from "zod";

export const donationIntentSchema = z.object({
  orgId: z.string().trim().min(1),
  purpose: z.string().trim().min(2, "יש לבחור ייעוד תרומה."),
  donorFullName: z.string().trim().min(2, "יש להזין שם מלא."),
  donorEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "יש להזין כתובת אימייל תקינה.",
    }),
  donorPhone: z.string().trim().optional().transform((value) => value || undefined),
  amount: z.coerce
    .number()
    .positive("יש להזין סכום גדול מ-0.")
    .max(1000000, "הסכום חורג מהמגבלה הזמנית."),
  recurring: z
    .union([z.literal("true"), z.literal("false"), z.literal("on"), z.undefined()])
    .transform((value) => value === "true" || value === "on"),
  note: z.string().trim().optional().transform((value) => value || undefined),
});
