import Link from "next/link";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { InviteMemberForm } from "@/components/dashboard/InviteMemberForm";
import { OrgSwitcher } from "@/components/dashboard/OrgSwitcher";
import { prisma } from "@/server/prisma";

const roleLabels: Record<Role, string> = {
  ADMIN: "מנהל",
  FINANCE: "כספים",
  DONOR: "תורם",
  MERCHANT: "ספק",
};

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.activeOrgId) {
    return null;
  }

  const params = await searchParams;
  const activeOrg = await prisma.org.findUnique({
    where: { id: session.user.activeOrgId },
  });
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      emailVerified: true,
    },
  });

  const invitations = await prisma.invitation.findMany({
    where: {
      orgId: session.user.activeOrgId,
      acceptedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const memberCount = await prisma.membership.count({
    where: { orgId: session.user.activeOrgId },
  });

  const isAdmin = session.user.role === Role.ADMIN;
  const forbidden = params.forbidden === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted">שלב 2 | משתמשים, ארגונים והרשאות</p>
            <h1 className="text-3xl font-semibold">
              {activeOrg?.name ?? "לוח בקרה"}
            </h1>
            <p className="text-sm leading-7 text-muted">
              מחובר בתור {session.user.name ?? session.user.email} | תפקיד פעיל:{" "}
              {session.user.role ? roleLabels[session.user.role] : "לא מוגדר"}
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
      </section>

      {forbidden ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          אין לך הרשאה לפעולה שביקשת בארגון הפעיל.
        </p>
      ) : null}

      {currentUser?.email && !currentUser.emailVerified ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium">כתובת האימייל עדיין לא אומתה.</p>
          <p className="mt-1 leading-7">
            מומלץ להשלים את האימות לפני שימוש קבוע במערכת.
          </p>
          <Link
            href={`/verify-email/request?email=${encodeURIComponent(currentUser.email)}`}
            className="mt-3 inline-flex font-semibold text-primary underline"
          >
            שליחת קישור אימות חדש
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5">
          <p className="text-sm text-muted">חברים בארגון</p>
          <p className="mt-3 text-3xl font-semibold">{memberCount}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm text-muted">ארגונים נגישים למשתמש</p>
          <p className="mt-3 text-3xl font-semibold">
            {session.user.memberships.length}
          </p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm text-muted">הזמנות פתוחות</p>
          <p className="mt-3 text-3xl font-semibold">{invitations.length}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm text-muted">מודול תורמים</p>
          <p className="mt-3 text-lg font-semibold">שלב 3 מוכן לעבודה</p>
          <Link
            href="/dashboard/donors"
            className="mt-4 inline-flex text-sm font-semibold text-primary underline"
          >
            מעבר לניהול תורמים
          </Link>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="surface-card p-5 sm:p-6">
          <h2 className="text-2xl font-semibold">הרשאות וגישה</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 leading-7">
              כל משתמש משויך לארגון אחד או יותר דרך Membership עם תפקיד מוגדר.
            </p>
            <p className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 leading-7">
              הארגון הפעיל נשמר על המשתמש, ונטען לסשן כדי לאפשר החלפה בין ארגונים.
            </p>
            <p className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 leading-7">
              פעולות ניהוליות משתמשות ב-audit log ומוגנות דרך requireRole.
            </p>
          </div>
        </article>

        <article className="surface-card p-5 sm:p-6">
          <h2 className="text-2xl font-semibold">הזמנות פעילות</h2>
          <div className="mt-4 space-y-3">
            {invitations.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm text-muted">
                עדיין לא נוצרו הזמנות פתוחות.
              </p>
            ) : (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="rounded-2xl border border-border bg-surface-secondary px-4 py-3"
                >
                  <p className="font-medium">{invitation.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {roleLabels[invitation.role]} | {new Date(invitation.createdAt).toLocaleDateString("he-IL")}
                  </p>
                  <Link
                    href={`/dev/outbox?email=${encodeURIComponent(invitation.email)}&kind=invitation`}
                    className="mt-2 inline-flex text-xs font-semibold text-primary underline"
                  >
                    פתיחת הודעת ההזמנה בסביבת הפיתוח
                  </Link>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {isAdmin ? (
        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-2xl font-semibold">הזמנת משתמש חדש</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            יצירת הזמנה שומרת הודעת אימייל בתיבת הפיתוח המקומית, כולל קישור הקבלה המלא.
          </p>
          <div className="mt-5">
            <InviteMemberForm />
          </div>
        </section>
      ) : null}
    </main>
  );
}
