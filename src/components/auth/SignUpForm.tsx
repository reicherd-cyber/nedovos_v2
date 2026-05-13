"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/app/(public)/sign-up/actions";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="surface-card w-full max-w-xl p-6 sm:p-8">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted">יצירת ארגון ומנהל ראשי</p>
        <h1 className="text-3xl font-semibold">פתיחת חשבון</h1>
        <p className="text-sm leading-7 text-muted">
          פתיחת ארגון חדש, יצירת משתמש מנהל, והכנה למבנה רב-דיירים.
        </p>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
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

        <button
          type="submit"
          disabled={isPending}
          className="tap-target sm:col-span-2 rounded-full bg-primary px-5 text-base font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "שומר..." : "יצירת חשבון"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        כבר יש לך משתמש?{" "}
        <Link href="/sign-in" className="font-semibold text-primary">
          חזרה להתחברות
        </Link>
      </p>
    </div>
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
      <input
        name={name}
        type={type}
        required
        className="tap-target w-full rounded-[12px] border border-border bg-surface px-4 outline-none ring-0"
      />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
