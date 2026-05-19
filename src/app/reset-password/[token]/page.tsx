import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { findAuthToken } from "@/server/auth/tokens";

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await params;
  const query = await searchParams;
  const email = typeof query.email === "string" ? query.email.toLowerCase() : "";

  if (!email) {
    notFound();
  }

  const record = await findAuthToken({
    type: "password-reset",
    email,
    token,
  });

  if (!record) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <ResetPasswordForm token={token} email={email} />
    </main>
  );
}
