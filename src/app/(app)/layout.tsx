import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
