"use client";

import Link from "next/link";
import { useActionState } from "react";
import { acceptInvitation } from "@/app/accept-invite/[token]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type AcceptInvitationFormProps = {
  token: string;
  email: string;
  orgName: string;
  requiresAccountSetup: boolean;
  sessionEmailMatches: boolean;
};

export function AcceptInvitationForm({
  token,
  email,
  orgName,
  requiresAccountSetup,
  sessionEmailMatches,
}: AcceptInvitationFormProps) {
  const [state, formAction, isPending] = useActionState(
    acceptInvitation,
    initialState,
  );

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <CardDescription>הצטרפות דרך הזמנה</CardDescription>
        <CardTitle>קבלת הזמנה</CardTitle>
        <CardDescription>
          {email} הוזמן להצטרף אל {orgName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sessionEmailMatches ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            החשבון המחובר אינו תואם לכתובת האימייל של ההזמנה. יש להתחבר עם {email}.
          </div>
        ) : null}

        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="token" value={token} />

          {requiresAccountSetup ? (
            <>
              <Field
                label="שם מלא"
                name="name"
                type="text"
                error={state.fieldErrors?.name?.[0]}
              />
              <label className="block space-y-2 text-sm">
                <span>אימייל</span>
                <Input type="email" value={email} disabled />
              </label>
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
            </>
          ) : (
            <div className="sm:col-span-2 rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm leading-7 text-muted">
              החשבון כבר קיים או שאתה כבר מחובר. לחיצה על הכפתור תצרף את המשתמש המתאים לארגון ותסמן את האימייל כמאומת במידת הצורך.
            </div>
          )}

          {state.error ? (
            <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="sm:col-span-2 w-full"
            disabled={isPending || !sessionEmailMatches}
          >
            {isPending ? "מצרף לחשבון..." : "קבלת ההזמנה"}
          </Button>
        </form>

        {!requiresAccountSetup ? (
          <p className="mt-6 text-center text-sm text-muted">
            לא החשבון הנכון?{" "}
            <Link href={`/sign-in?email=${encodeURIComponent(email)}`} className="font-semibold text-primary">
              התחברות עם אימייל אחר
            </Link>
          </p>
        ) : null}
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
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <Input name={name} type={type} required />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
