"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

type SignInFormProps = {
  allowGoogle: boolean;
  defaultEmail?: string;
};

export function SignInForm({
  allowGoogle,
  defaultEmail = "",
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
    <div className="surface-card w-full max-w-md p-6 sm:p-8">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted">כניסה לאזור הארגון</p>
        <h1 className="text-3xl font-semibold">התחברות</h1>
        <p className="text-sm leading-7 text-muted">
          כניסה עם אימייל וסיסמה, או עם Google אם הוגדר עבור הסביבה.
        </p>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-2 text-sm">
          <span>אימייל</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            className="tap-target w-full rounded-[12px] border border-border bg-surface px-4 outline-none ring-0"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span>סיסמה</span>
          <input
            name="password"
            type="password"
            required
            className="tap-target w-full rounded-[12px] border border-border bg-surface px-4 outline-none ring-0"
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="tap-target w-full rounded-full bg-primary px-5 text-base font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "מתחבר..." : "התחברות"}
        </button>
      </form>

      {allowGoogle ? (
        <button
          type="button"
          onClick={() => void signIn("google", { callbackUrl })}
          className="tap-target mt-3 w-full rounded-full border border-border bg-surface-secondary px-5 text-base font-semibold text-foreground hover:bg-surface"
        >
          כניסה עם Google
        </button>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        אין לך חשבון?{" "}
        <Link href="/sign-up" className="font-semibold text-primary">
          פתיחת ארגון חדש
        </Link>
      </p>
    </div>
  );
}
