"use client";

import Link from "next/link";
import { Role } from "@prisma/client";
import { useActionState } from "react";
import { inviteMember } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

const roleLabels: Record<Role, string> = {
  ADMIN: "מנהל",
  FINANCE: "כספים",
  DONOR: "תורם",
  MERCHANT: "ספק",
};

export function InviteMemberForm() {
  const [state, formAction, isPending] = useActionState(inviteMember, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        <label className="block space-y-2 text-sm">
          <span>אימייל להזמנה</span>
          <Input
            name="email"
            type="email"
            required
          />
          {state.fieldErrors?.email?.[0] ? (
            <span className="text-xs text-red-700">{state.fieldErrors.email[0]}</span>
          ) : null}
        </label>

        <label className="block space-y-2 text-sm">
          <span>תפקיד</span>
          <select
            name="role"
            defaultValue={Role.FINANCE}
            className="tap-target w-full rounded-[12px] border border-border bg-surface px-4"
          >
            {Object.values(Role).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>ההזמנה נוצרה ונשמרה בתיבת הפיתוח.</p>
          <Link href={state.success} className="mt-1 inline-block font-semibold underline">
            פתיחת הודעת ההזמנה
          </Link>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
      >
        {isPending ? "יוצר הזמנה..." : "יצירת הזמנה"}
      </Button>
    </form>
  );
}
