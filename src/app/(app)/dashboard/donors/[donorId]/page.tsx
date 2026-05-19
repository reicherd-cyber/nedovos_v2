import Link from "next/link";
import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { AddDonorNoteForm } from "@/components/donors/AddDonorNoteForm";
import { UpdateDonorForm } from "@/components/donors/UpdateDonorForm";
import { requireRole } from "@/lib/auth/roles";
import { getDonorById } from "@/server/donors/repository";

type DonorDetailPageProps = {
  params: Promise<{
    donorId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonorDetailPage({
  params,
  searchParams,
}: DonorDetailPageProps) {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);
  const activeOrgId = session.user.activeOrgId;

  if (!activeOrgId) {
    return null;
  }

  const [{ donorId }, query] = await Promise.all([params, searchParams]);
  const donor = await getDonorById(activeOrgId, donorId);

  if (!donor) {
    notFound();
  }

  const created = query.created === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-muted">פרופיל תורם</p>
            <h1 className="mt-2 text-3xl font-semibold">{donor.fullName}</h1>
            <p className="mt-2 text-sm text-muted">
              {donor.email ?? "ללא אימייל"} | {donor.phone ?? "ללא טלפון"}
            </p>
          </div>

          <Link
            href="/dashboard/donors"
            className="inline-flex tap-target items-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground"
          >
            חזרה לרשימת התורמים
          </Link>
        </div>
      </section>

      {created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          התורם נוצר בהצלחה.
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <UpdateDonorForm donor={donor} />

        <div className="grid gap-4">
          <article className="surface-card p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">תגיות</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {donor.tags.length === 0 ? (
                <p className="text-sm text-muted">עדיין לא הוגדרו תגיות עבור התורם.</p>
              ) : (
                donor.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary-strong"
                  >
                    {tag.label}
                  </span>
                ))
              )}
            </div>
          </article>

          <AddDonorNoteForm donorId={donor.id} />
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-2xl font-semibold">הערות תורם</h2>
        <div className="mt-4 grid gap-3">
          {donor.notes.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm text-muted">
              עדיין לא נכתבו הערות עבור התורם.
            </p>
          ) : (
            donor.notes.map((note) => (
              <article
                key={note.id}
                className="rounded-2xl border border-border bg-surface-secondary px-4 py-4"
              >
                <p className="text-sm leading-7 text-foreground">{note.body}</p>
                <p className="mt-3 text-xs text-muted">
                  {new Date(note.createdAt).toLocaleString("he-IL")}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
