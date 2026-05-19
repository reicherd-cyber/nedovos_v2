"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resendVerificationEmail } from "@/app/(public)/verify-email/request/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type VerificationRequestFormProps = {
  defaultEmail?: string;
};

export function VerificationRequestForm({
  defaultEmail = "",
}: VerificationRequestFormProps) {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmail,
    initialState,
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardDescription>שליחה חוזרת של קישור אימות</CardDescription>
        <CardTitle>אימות אימייל</CardTitle>
        <CardDescription>
          אם החשבון קיים ועדיין לא אומת, נשמור קישור חדש בתיבת הפיתוח המקומית.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span>אימייל</span>
            <Input name="email" type="email" required defaultValue={defaultEmail} />
            {state.fieldErrors?.email?.[0] ? (
              <span className="text-xs text-red-700">{state.fieldErrors.email[0]}</span>
            ) : null}
          </label>

          {state.error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>קישור האימות מוכן בתיבת הפיתוח.</p>
              <Link href={state.success} className="mt-1 inline-block font-semibold underline">
                פתיחת תיבת הפיתוח
              </Link>
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "יוצר קישור..." : "שליחה חוזרת"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          חזרה למסך ההתחברות?{" "}
          <Link href="/sign-in" className="font-semibold text-primary">
            התחברות
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
