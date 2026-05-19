"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SignInFormProps = {
  allowGoogle: boolean;
  defaultEmail?: string;
  messages: string[];
  verificationLink?: string | null;
};

export function SignInForm({
  allowGoogle,
  defaultEmail = "",
  messages,
  verificationLink,
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const response = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });

    setIsPending(false);

    if (!response || response.error) {
      setError("שם המשתמש או הסיסמה שגויים.");
      return;
    }

    router.push(response.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardDescription>כניסה לאזור הארגון</CardDescription>
        <CardTitle>התחברות</CardTitle>
        <CardDescription>
          כניסה עם אימייל וסיסמה, או עם Google אם הוגדר עבור הסביבה.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span>אימייל</span>
            <Input name="email" type="email" required defaultValue={defaultEmail} />
          </label>

          <label className="block space-y-2 text-sm">
            <span>סיסמה</span>
            <Input name="password" type="password" required />
          </label>

          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((message) => (
                <p
                  key={message}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                  {message}
                </p>
              ))}
            </div>
          ) : null}

          {verificationLink ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p>קישור האימות מוכן בתיבת הפיתוח.</p>
              <Link href={verificationLink} className="mt-1 inline-block font-semibold underline">
                פתיחת תיבת הפיתוח
              </Link>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "מתחבר..." : "התחברות"}
          </Button>
        </form>

        {allowGoogle ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => void signIn("google", { callbackUrl })}
          >
            כניסה עם Google
          </Button>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-muted">
          <Link href="/forgot-password" className="font-semibold text-primary">
            שכחתי סיסמה
          </Link>
          <Link href={`/verify-email/request${defaultEmail ? `?email=${encodeURIComponent(defaultEmail)}` : ""}`} className="font-semibold text-primary">
            שליחה חוזרת של אימות אימייל
          </Link>
          <p>
            אין לך חשבון?{" "}
            <Link href="/sign-up" className="font-semibold text-primary">
              פתיחת ארגון חדש
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
