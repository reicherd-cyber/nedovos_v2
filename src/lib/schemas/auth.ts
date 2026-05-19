import { Role } from "@prisma/client";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים."),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "יש להזין שם מלא."),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים."),
    confirmPassword: z.string().min(8, "יש לאשר את הסיסמה."),
    orgName: z.string().trim().min(2, "יש להזין שם ארגון."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "אימות הסיסמה לא תואם.",
  });

export const switchOrgSchema = z.object({
  orgId: z.string().min(1, "חסר ארגון."),
});

export const inviteMemberSchema = z.object({
  email: z.email().trim().toLowerCase(),
  role: z.nativeEnum(Role),
});

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1),
    name: z.string().trim().min(2, "יש להזין שם מלא."),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים."),
    confirmPassword: z.string().min(8, "יש לאשר את הסיסמה."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "אימות הסיסמה לא תואם.",
  });

export const emailSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים."),
    confirmPassword: z.string().min(8, "יש לאשר את הסיסמה."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "אימות הסיסמה לא תואם.",
  });

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
