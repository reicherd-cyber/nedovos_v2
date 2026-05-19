import Link from "next/link";
import { Role } from "@prisma/client";
import { CreateDonorForm } from "@/components/donors/CreateDonorForm";
import { DonorImportForm } from "@/components/donors/DonorImportForm";
import { OrgSwitcher } from "@/components/dashboard/OrgSwitcher";
import { requireRole } from "@/lib/auth/roles";
import { listDonors } from "@/server/donors/repository";

const roleLabels: Record<Role, string> = {
  ADMIN: "מנהל",
  FINANCE: "כספים",
  DONOR: "תורם",
  MERCHANT: "ספק",
};

type DonorsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonorsPage({ searchParams }: DonorsPageProps) {
  const { session } = await requireRole([Role.ADMIN, Role.FINANCE]);
  const activeOrgId = session.user.activeOrgId;

  if (!activeOrgId) {
    return null;
  }

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const tag = typeof params.tag === "string" ? params.tag : "";

  const donors = await listDonors(activeOrgId, {
    query,
    tag,
  });

  const tags = [...new Set(donors.flatMap((donor) => donor.tags.map((item) => item.label)))];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted">שלב 3 | מאגר תורמים</p>
            <h1 className="text-3xl font-semibold">ניהול תורמים</h1>
            <p className="text-sm leading-7 text-muted">
              רשימת תורמים, חיפוש, תגיות, הערות וייבוא בסיסי ב-CSV עם סינון לפי הארגון הפעיל בלבד.
            </p>
          </div>

          <div className="min-w-[280px]">
            <OrgSwitcher
              activeOrgId={session.user.activeOrgId}
              memberships={session.user.memberships.map((membership) => ({
                orgId: membership.orgId,
                orgName: membership.orgName,
                role: roleLabels[membership.role],
              }))}
            />
          </div>
        </div>

        <div className="mt-5">
          <Link
            href="/dashboard"
            className="inline-flex tap-target items-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground"
          >
            חזרה ללוח הבקרה
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)]">
        <article className="surface-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">רשימת תורמים</h2>
              <p className="mt-2 text-sm text-muted">נמצאו {donors.length} תורמים לפי החיפוש הנוכחי.</p>
            </div>

            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
              <input
                name="q"
                defaultValue={query}
                placeholder="חיפוש לפי שם, אימייל, טלפון או עיר"
                className="tap-target w-full rounded-[12px] border border-border bg-surface px-4"
              />
              <select
                name="tag"
                defaultValue={tag}
                className="tap-target w-full rounded-[12px] border border-border bg-surface px-4"
              >
                <option value="">כל התגיות</option>
                {tags.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="tap-target rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                סינון
              </button>
            </form>
          </div>

          <div className="mt-5 overflow-hidden rounded-[16px] border border-border">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr_120px] gap-3 bg-surface-secondary px-4 py-3 text-sm font-semibold text-muted md:grid">
              <div>תורם</div>
              <div>אימייל</div>
              <div>טלפון</div>
              <div>תגיות</div>
              <div>הערות</div>
            </div>

            <div className="divide-y divide-border">
              {donors.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted">עדיין לא נמצאו תורמים בארגון הפעיל.</div>
              ) : (
                donors.map((donor) => (
                  <Link
                    key={donor.id}
                    href={`/dashboard/donors/${donor.id}`}
                    className="grid gap-3 px-4 py-4 hover:bg-surface-secondary md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr_120px] md:items-center"
                  >
                    <div>
                      <p className="font-semibold">{donor.fullName}</p>
                      <p className="mt-1 text-xs text-muted">
                        {donor.city ?? "ללא עיר"}{donor.language ? ` | ${donor.language}` : ""}
                      </p>
                    </div>
                    <div className="text-sm text-muted">{donor.email ?? "—"}</div>
                    <div className="text-sm text-muted">{donor.phone ?? "—"}</div>
                    <div className="flex flex-wrap gap-2">
                      {donor.tags.length === 0 ? (
                        <span className="text-sm text-muted">ללא תגיות</span>
                      ) : (
                        donor.tags.map((item) => (
                          <span
                            key={item.id}
                            className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary-strong"
                          >
                            {item.label}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="text-sm text-muted">{donor._count.notes}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </article>

        <div className="grid gap-4">
          <CreateDonorForm />
          <DonorImportForm />
        </div>
      </section>
    </main>
  );
}
