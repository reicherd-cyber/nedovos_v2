"use client";

import { useActionState } from "react";
import { acceptInvitation } from "@/app/accept-invite/[token]/actions";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type AcceptInvitationFormProps = {
  token: string;
  email: string;
  orgName: string;
};

export function AcceptInvitationForm({
  token,
  email,
  orgName,
}: AcceptInvitationFormProps) {
  const [state, formAction, isPending] = useActionState(
    acceptInvitation,
    initialState,
  );

  return (
    <div className="surface-card w-full max-w-xl p-6 sm:p-8">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted">הצטרפות דרך הזמנה</p>
        <h1 className="text-3xl font-semibold">קבלת הזמנה</h1>
        <p className="text-sm leading-7 text-muted">
          {email} הוזמן להצטרף אל {orgName}.
        </p>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="token" value={token} />

        <Field
          label="שם מלא"
          name="name"
          type="text"
          error={state.fieldErrors?.name?.[0]}
        />
        <label className="block space-y-2 text-sm">
          <span>אימייל</span>
          <input
            type="email"
            value={email}
            disabled
            className="tap-target w-full rounded-[12px] border border-border bg-surface-secondary px-4 text-muted"
          />
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
          {isPending ? "מצרף לחשבון..." : "קבלת ההזמנה"}
        </button>
      </form>
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
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required
        className="tap-target w-full rounded-[12px] border border-border bg-surface px-4"
      />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
