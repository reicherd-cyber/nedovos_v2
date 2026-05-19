"use client";

import { verifyEmailAddress } from "@/app/verify-email/[token]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type VerifyEmailFormProps = {
  token: string;
  email: string;
};

export function VerifyEmailForm({ token, email }: VerifyEmailFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardDescription>אימות גישה לכתובת האימייל</CardDescription>
        <CardTitle>אימות כתובת אימייל</CardTitle>
        <CardDescription>
          לחיצה על הכפתור תעדכן את החשבון כך שכתובת האימייל תסומן כמאומתת.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={verifyEmailAddress} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          <div className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm">
            {email}
          </div>
          <Button type="submit" className="w-full">
            אימות האימייל
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
