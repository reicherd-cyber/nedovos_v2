"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/app/(public)/sign-up/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardDescription>יצירת ארגון ומנהל ראשי</CardDescription>
        <CardTitle>פתיחת חשבון</CardTitle>
        <CardDescription>
          פתיחת ארגון חדש, יצירת משתמש מנהל, והכנה למבנה רב-דיירים.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <Field
            label="שם מלא"
            name="name"
            type="text"
            error={state.fieldErrors?.name?.[0]}
          />
          <Field
            label="שם הארגון"
            name="orgName"
            type="text"
            error={state.fieldErrors?.orgName?.[0]}
          />
          <Field
            label="אימייל"
            name="email"
            type="email"
            error={state.fieldErrors?.email?.[0]}
          />
          <div className="hidden sm:block" />
          <Field
            label="סיסמה"
            name="password"
            type="password"
            error={state.fieldErrors?.password?.[0]}
          />
          <Field
            label="אימות סיסמה"
            name="confirmPassword"
            type="password"
            error={state.fieldErrors?.confirmPassword?.[0]}
          />

          {state.error ? (
            <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="sm:col-span-2 w-full" disabled={isPending}>
            {isPending ? "שומר..." : "יצירת חשבון"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          כבר יש לך משתמש?{" "}
          <Link href="/sign-in" className="font-semibold text-primary">
            חזרה להתחברות
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  error?: string;
};

function Field({ label, name, type, error }: FieldProps) {
  return (
    <label className="block space-y-2 text-sm sm:col-span-1">
      <span>{label}</span>
      <Input name={name} type={type} required />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
