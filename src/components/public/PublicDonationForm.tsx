"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createDonationIntentAction } from "@/app/orgs/[id]/donate/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";
import type { PublicOption } from "@/lib/public-org-options";

const initialState: FormState = {};

type PublicDonationFormProps = {
  orgId: string;
  options: PublicOption[];
  selectedOptionKey: string;
};

export function PublicDonationForm({
  orgId,
  options,
  selectedOptionKey,
}: PublicDonationFormProps) {
  const [state, formAction, isPending] = useActionState(
    createDonationIntentAction,
    initialState,
  );

  const selectedOption =
    options.find((option) => option.key === selectedOptionKey) ?? options[0];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardDescription>בחירת מסלול תרומה</CardDescription>
          <CardTitle>ייעוד התרומה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {options.map((option) => (
              <Link
                key={option.key}
                href={`/orgs/${orgId}/donate?option=${option.key}`}
                className={`rounded-[10px] border px-4 py-4 text-right transition ${
                  option.key === selectedOption.key
                    ? "border-[#8fc6cf] bg-[#f4fbfc]"
                    : "border-border bg-surface-secondary hover:bg-surface"
                }`}
              >
                <p className="text-[17px] font-semibold text-[#31565a]">
                  {option.title}
                </p>
                {option.description ? (
                  <p className="mt-2 text-sm text-[#698488]">{option.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>השלמת פרטי תרומה</CardDescription>
          <CardTitle>שמירת בקשת תרומה</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="orgId" value={orgId} />
            <input type="hidden" name="purpose" value={selectedOption.title} />

            <Field
              label="שם מלא"
              name="donorFullName"
              error={state.fieldErrors?.donorFullName?.[0]}
              required
            />
            <Field
              label="סכום תרומה"
              name="amount"
              type="number"
              step="1"
              min="1"
              error={state.fieldErrors?.amount?.[0]}
              required
            />
            <Field
              label="אימייל"
              name="donorEmail"
              type="email"
              error={state.fieldErrors?.donorEmail?.[0]}
            />
            <Field
              label="טלפון"
              name="donorPhone"
              error={state.fieldErrors?.donorPhone?.[0]}
            />

            <label className="flex items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-3 text-sm sm:col-span-2">
              <input
                type="checkbox"
                name="recurring"
                value="true"
                defaultChecked={Boolean(selectedOption.recurringDefault)}
              />
              <span>אני מעוניין שהתרומה תסומן כהוראת קבע / תרומה מחזורית</span>
            </label>

            <label className="block space-y-2 text-sm sm:col-span-2">
              <span>הערה</span>
              <textarea
                name="note"
                className="min-h-28 w-full rounded-[16px] border border-border bg-surface px-4 py-3 outline-none"
                placeholder="הקדשה, הערה למזכירות או פרטים נוספים"
              />
              {state.fieldErrors?.note?.[0] ? (
                <span className="text-xs text-red-700">{state.fieldErrors.note[0]}</span>
              ) : null}
            </label>

            {state.error ? (
              <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

            {state.success ? (
              <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {state.success}
              </p>
            ) : null}

            <Button type="submit" className="sm:col-span-2 w-full" disabled={isPending}>
              {isPending ? "שומר בקשה..." : "שמירת בקשת תרומה"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  error?: string;
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  step,
  min,
  error,
}: FieldProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <Input name={name} type={type} required={required} step={step} min={min} />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
