"use client";

import { useActionState } from "react";
import { createDonorAction } from "@/app/(app)/dashboard/donors/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

export function CreateDonorForm() {
  const [state, formAction, isPending] = useActionState(createDonorAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardDescription>יצירת כרטיס תורם חדש</CardDescription>
        <CardTitle>תורם חדש</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <Field label="שם מלא" name="fullName" error={state.fieldErrors?.fullName?.[0]} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="אימייל" name="email" type="email" error={state.fieldErrors?.email?.[0]} />
            <Field label="טלפון" name="phone" error={state.fieldErrors?.phone?.[0]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="עיר" name="city" error={state.fieldErrors?.city?.[0]} />
            <Field label="שפה" name="language" error={state.fieldErrors?.language?.[0]} />
          </div>
          <Field label="כתובת" name="addressLine1" error={state.fieldErrors?.addressLine1?.[0]} />
          <Field label="תעודת זהות" name="nationalId" error={state.fieldErrors?.nationalId?.[0]} />
          <Field
            label="תגיות"
            name="tags"
            error={state.fieldErrors?.tags?.[0]}
            placeholder="לדוגמה: VIP, קהילה, הוראת קבע"
          />

          {state.error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "שומר..." : "יצירת תורם"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  type = "text",
  error,
  placeholder,
  required = false,
}: FieldProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <Input name={name} type={type} placeholder={placeholder} required={required} />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
