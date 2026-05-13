import { notFound } from "next/navigation";
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

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { org: true },
  });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <AcceptInvitationForm
        token={invitation.token}
        email={invitation.email}
        orgName={invitation.org.name}
      />
    </main>
  );
}
