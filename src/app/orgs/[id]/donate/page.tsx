import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicDonationForm } from "@/components/public/PublicDonationForm";
import {
  getPublicOptionByKey,
  getPublicOptionsFromDefinition,
} from "@/lib/public-org-options";
import { prisma } from "@/server/prisma";

type OrgDonatePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrgDonatePage({
  params,
  searchParams,
}: OrgDonatePageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const org = await prisma.org.findFirst({
    where: {
      id,
      publicListingEnabled: true,
    },
    select: {
      id: true,
      name: true,
      publicSubtitle: true,
      publicCategory: true,
      publicDonationOptions: true,
    },
  });

  if (!org) {
    notFound();
  }

  const options = getPublicOptionsFromDefinition(org.publicDonationOptions);
  const optionKey = typeof query.option === "string" ? query.option : undefined;
  const selectedOption = getPublicOptionByKey(options, optionKey);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#5e5e5e_0%,#3b3b3b_28%,#2d2d2d_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[920px] rounded-[18px] bg-white px-5 py-8 shadow-[0_24px_50px_rgba(0,0,0,0.32)] sm:px-8 sm:py-10">
        <header className="flex flex-col items-center text-center">
          <div className="flex h-[150px] w-full max-w-[320px] items-center justify-center">
            <div className="flex w-full flex-col items-center justify-center rounded-[28px] border border-[#d8dde8] bg-[linear-gradient(180deg,#f9fbff_0%,#eef3fb_100%)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="rounded-full bg-[#eaf0fb] px-4 py-1 text-[12px] font-semibold text-[#58729a]">
                {org.publicCategory ?? "מוסד"}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1">
                <span className="text-[18px] leading-none text-[#df5a55]">♪</span>
                <span className="text-[38px] font-black tracking-tight text-[#3d5f92]">
                  נדבוס
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#7b8496]">לבתי כנסת וארגונים</div>
            </div>
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-[#4b868c]">{org.name}</h1>
          <p className="mt-2 text-sm text-[#7f8d8f]">{org.publicSubtitle ?? org.id}</p>
          <p className="mt-5 text-center text-2xl font-semibold text-[#31565a]">
            {selectedOption.title}
          </p>
        </header>

        <section className="mt-8">
          <PublicDonationForm
            orgId={org.id}
            options={options}
            selectedOptionKey={selectedOption.key}
          />
        </section>

        <footer className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/orgs/${org.id}`}
            className="inline-flex tap-target items-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground"
          >
            חזרה לעמוד הארגון
          </Link>
          <Link
            href="/"
            className="inline-flex tap-target items-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground"
          >
            חזרה לרשימת המוסדות
          </Link>
        </footer>
      </div>
    </main>
  );
}
