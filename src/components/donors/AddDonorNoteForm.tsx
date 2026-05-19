"use client";

import { useActionState } from "react";
import { addDonorNoteAction } from "@/app/(app)/dashboard/donors/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormState } from "@/lib/schemas/auth";

const initialState: FormState = {};

type AddDonorNoteFormProps = {
  donorId: string;
};

export function AddDonorNoteForm({ donorId }: AddDonorNoteFormProps) {
  const [state, formAction, isPending] = useActionState(addDonorNoteAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardDescription>מעקב פנימי על תורם</CardDescription>
        <CardTitle>הוספת הערה</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="donorId" value={donorId} />
          <textarea
            name="body"
            className="min-h-32 w-full rounded-[16px] border border-border bg-surface px-4 py-3 outline-none"
            placeholder="כתיבת הערה פנימית על שיחה, פגישה, העדפת תרומה או מידע נוסף."
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
            {isPending ? "מוסיף..." : "הוספת הערה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
