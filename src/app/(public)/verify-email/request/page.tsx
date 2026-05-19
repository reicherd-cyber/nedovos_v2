import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { VerificationRequestForm } from "@/components/auth/VerificationRequestForm";

type VerificationRequestPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerificationRequestPage({
  searchParams,
}: VerificationRequestPageProps) {
  const session = await auth();

  if (session?.user?.id && session.user.role) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <VerificationRequestForm defaultEmail={email} />
    </main>
  );
}
