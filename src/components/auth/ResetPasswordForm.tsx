"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/reset-password/[token]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type ResetPasswordFormProps = {
  token: string;
  email: string;
};

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardDescription>יצירת סיסמה חדשה</CardDescription>
        <CardTitle>איפוס סיסמה</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <label className="block space-y-2 text-sm">
            <span>אימייל</span>
            <Input value={email} disabled />
          </label>

          <label className="block space-y-2 text-sm">
            <span>סיסמה חדשה</span>
            <Input name="password" type="password" required />
            {state.fieldErrors?.password?.[0] ? (
              <span className="text-xs text-red-700">{state.fieldErrors.password[0]}</span>
            ) : null}
          </label>

          <label className="block space-y-2 text-sm">
            <span>אימות סיסמה</span>
            <Input name="confirmPassword" type="password" required />
            {state.fieldErrors?.confirmPassword?.[0] ? (
              <span className="text-xs text-red-700">{state.fieldErrors.confirmPassword[0]}</span>
            ) : null}
          </label>

          {state.error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "שומר..." : "שמירת סיסמה חדשה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
