"use client";

import type { Donor, DonorTag } from "@prisma/client";
import { useActionState } from "react";
import { updateDonorAction } from "@/app/(app)/dashboard/donors/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type UpdateDonorFormProps = {
  donor: Donor & {
    tags: DonorTag[];
  };
};

export function UpdateDonorForm({ donor }: UpdateDonorFormProps) {
  const [state, formAction, isPending] = useActionState(updateDonorAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardDescription>עדכון פרטי תורם</CardDescription>
        <CardTitle>פרטי קשר ותגיות</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="donorId" value={donor.id} />
          <Field
            label="שם מלא"
            name="fullName"
            defaultValue={donor.fullName}
            error={state.fieldErrors?.fullName?.[0]}
            required
          />
          <Field
            label="תעודת זהות"
            name="nationalId"
            defaultValue={donor.nationalId ?? ""}
            error={state.fieldErrors?.nationalId?.[0]}
          />
          <Field
            label="אימייל"
            name="email"
            type="email"
            defaultValue={donor.email ?? ""}
            error={state.fieldErrors?.email?.[0]}
          />
          <Field
            label="טלפון"
            name="phone"
            defaultValue={donor.phone ?? ""}
            error={state.fieldErrors?.phone?.[0]}
          />
          <Field
            label="עיר"
            name="city"
            defaultValue={donor.city ?? ""}
            error={state.fieldErrors?.city?.[0]}
          />
          <Field
            label="שפה"
            name="language"
            defaultValue={donor.language ?? ""}
            error={state.fieldErrors?.language?.[0]}
          />
          <label className="block space-y-2 text-sm sm:col-span-2">
            <span>כתובת</span>
            <Input
              name="addressLine1"
              defaultValue={donor.addressLine1 ?? ""}
            />
            {state.fieldErrors?.addressLine1?.[0] ? (
              <span className="text-xs text-red-700">{state.fieldErrors.addressLine1[0]}</span>
            ) : null}
          </label>
          <label className="block space-y-2 text-sm sm:col-span-2">
            <span>תגיות</span>
            <Input
              name="tags"
              defaultValue={donor.tags.map((tag) => tag.label).join(", ")}
              placeholder="לדוגמה: VIP, קהילה, הוראת קבע"
            />
            {state.fieldErrors?.tags?.[0] ? (
              <span className="text-xs text-red-700">{state.fieldErrors.tags[0]}</span>
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
            {isPending ? "שומר..." : "שמירת שינויים"}
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
  defaultValue?: string;
  error?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required = false,
}: FieldProps) {
  return (
    <label className="block space-y-2 text-sm">
      <span>{label}</span>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
