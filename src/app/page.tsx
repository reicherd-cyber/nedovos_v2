import type { Metadata } from "next";
import { DirectoryHome } from "@/components/home/DirectoryHome";
import { prisma } from "@/server/prisma";

export const metadata: Metadata = {
  title: "נדבוס | חיפוש בתי כנסת וארגונים",
  description:
    "עמוד בית בסגנון מדריך מוסדות: חיפוש בתי כנסת, ארגונים, אזור אישי וזמני תפילות.",
};

const navItems = [
  "אזור אישי - תורמים",
  "אזור אישי - גבאים",
  "מי אנחנו?",
];

export type DirectoryCard = {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
};

export default async function Home() {
  const publicOrgs = await prisma.org.findMany({
    where: {
      publicListingEnabled: true,
    },
    orderBy: {
      directoryOrder: "asc",
    },
    select: {
      id: true,
      name: true,
      publicSubtitle: true,
      publicCategory: true,
    },
  });

  const directoryCards: DirectoryCard[] = publicOrgs.map((org) => ({
    id: org.id,
    title: org.name,
    subtitle: org.publicSubtitle ?? undefined,
    category: org.publicCategory ?? undefined,
  }));

  return <DirectoryHome navItems={navItems} directoryCards={directoryCards} />;
}
