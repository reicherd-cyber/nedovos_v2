import Link from "next/link";
import { notFound } from "next/navigation";
import { listDevEmails } from "@/server/dev-email";

type DevOutboxPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DevOutboxPage({
  searchParams,
}: DevOutboxPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.toLowerCase() : undefined;
  const records = await listDevEmails(email);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-card p-6">
        <p className="text-sm text-muted">תיבת פיתוח מקומית</p>
        <h1 className="mt-2 text-3xl font-semibold">קישורי אימייל שנוצרו בסביבה המקומית</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          דף זה נועד להשלים את שלבי Stage 1 ו-Stage 2 בלי ספק אימייל חיצוני.
          {email ? ` כרגע מוצגות הודעות עבור ${email}.` : ""}
        </p>
      </section>

      <section className="grid gap-4">
        {records.length === 0 ? (
          <div className="surface-card p-6 text-sm text-muted">לא נמצאו הודעות תואמות.</div>
        ) : (
          records.map((record) => (
            <article key={record.id} className="surface-card p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted">{record.kind}</p>
                  <h2 className="text-xl font-semibold">{record.subject}</h2>
                  <p className="mt-2 text-sm text-muted">{record.toEmail}</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{record.previewText}</p>
                </div>
                <p className="text-xs text-muted">{new Date(record.createdAt).toLocaleString("he-IL")}</p>
              </div>
              <Link
                href={record.actionUrl}
                className="mt-4 inline-flex tap-target items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                פתיחת הקישור
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
