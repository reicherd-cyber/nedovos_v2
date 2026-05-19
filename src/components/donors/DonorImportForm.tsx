"use client";

import { useActionState } from "react";
import { importDonorsAction } from "@/app/(app)/dashboard/donors/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

export function DonorImportForm() {
  const [state, formAction, isPending] = useActionState(importDonorsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardDescription>ייבוא בסיסי באמצעות הדבקת CSV</CardDescription>
        <CardTitle>ייבוא תורמים</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <p className="text-sm leading-7 text-muted">
            העמודה היחידה שחייבת להופיע היא `שם` או `Name`. עמודות נתמכות נוספות:
            `Email`, `Phone`, `City`, `Address`, `Language`, `Tags`, `ID`.
          </p>

          <textarea
            name="csv"
            className="min-h-40 w-full rounded-[16px] border border-border bg-surface px-4 py-3 outline-none"
            placeholder={'Name,Email,Phone,City,Tags\nישראל כהן,israel@example.com,0500000000,ירושלים,VIP|קהילה'}
          />

          {state.error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "מייבא..." : "ייבוא תורמים"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
