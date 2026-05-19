import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

export const donorFormSchema = z.object({
  donorId: z.string().optional(),
  fullName: z.string().trim().min(2, "יש להזין שם תורם מלא."),
  nationalId: optionalTrimmedString,
  email: z.email("יש להזין כתובת אימייל תקינה.").trim().toLowerCase().optional().or(z.literal("")),
  phone: optionalTrimmedString,
  addressLine1: optionalTrimmedString,
  city: optionalTrimmedString,
  language: optionalTrimmedString,
  tags: z.string().trim().optional(),
});

export const donorNoteSchema = z.object({
  donorId: z.string().min(1),
  body: z.string().trim().min(2, "יש להזין תוכן הערה."),
});

export const donorImportSchema = z.object({
  csv: z.string().trim().min(1, "יש להדביק תוכן CSV."),
});

export const donorSearchSchema = z.object({
  q: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});

export type DonorFormInput = z.infer<typeof donorFormSchema>;
