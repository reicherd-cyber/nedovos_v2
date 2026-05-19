import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AcceptInvitationForm } from "@/components/invitations/AcceptInvitationForm";
import { prisma } from "@/server/prisma";

type AcceptInvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { token } = await params;
  const session = await auth();

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { org: true },
  });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    notFound();
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  const requiresAccountSetup = !existingUser && !session?.user?.id;
  const shouldPromptSignIn = Boolean(existingUser && !session?.user?.id);
  const emailMatchesSession =
    session?.user?.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {shouldPromptSignIn ? (
        <div className="surface-card w-full max-w-xl p-6 sm:p-8">
          <p className="text-sm text-muted">הוזמן משתמש קיים</p>
          <h1 className="mt-2 text-3xl font-semibold">יש להתחבר לפני קבלת ההזמנה</h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            קיים כבר חשבון עבור {invitation.email}. יש להתחבר לחשבון הזה ואז לפתוח מחדש את קישור ההזמנה.
          </p>
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent(`/accept-invite/${invitation.token}`)}&email=${encodeURIComponent(invitation.email)}`}
            className="mt-6 inline-flex tap-target items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
          >
            מעבר להתחברות
          </Link>
        </div>
      ) : (
        <AcceptInvitationForm
          token={invitation.token}
          email={invitation.email}
          orgName={invitation.org.name}
          requiresAccountSetup={requiresAccountSetup}
          sessionEmailMatches={session?.user?.id ? emailMatchesSession : true}
        />
      )}
    </main>
  );
}
