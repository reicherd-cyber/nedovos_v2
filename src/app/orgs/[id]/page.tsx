import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicOptionsFromDefinition,
  type PublicOption,
} from "@/lib/public-org-options";
import { prisma } from "@/server/prisma";

type OrgPublicPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OrgPublicPage({ params }: OrgPublicPageProps) {
  const { id } = await params;

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#595959_0%,#3a3a3a_28%,#2f2f2f_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[820px] rounded-[18px] bg-white px-5 py-8 shadow-[0_24px_50px_rgba(0,0,0,0.32)] sm:px-8 sm:py-10">
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
        </header>

        <section className="mt-8">
          <h2 className="text-center text-3xl font-semibold text-[#4b868c]">
            למה מיועדת תרומתך
          </h2>

          <div className="mt-6 grid gap-4">
            {options.map((option) => (
              <PublicOptionCard key={option.key} option={option} orgId={org.id} />
            ))}
          </div>
        </section>

        <footer className="mt-8 flex justify-center">
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

function PublicOptionCard({
  option,
  orgId,
}: {
  option: PublicOption;
  orgId: string;
}) {
  const progress =
    option.currentAmount && option.targetAmount
      ? Math.min(100, Math.round((option.currentAmount / option.targetAmount) * 100))
      : 0;

  const toneClass =
    option.tone === "progress-coral"
      ? "bg-[#fb7e80]"
      : option.tone === "progress-amber"
        ? "bg-[#f4bd58]"
        : option.tone === "soft"
          ? "bg-[#fff0f0]"
          : "bg-white";

  return (
    <Link
      href={`/orgs/${orgId}/donate?option=${option.key}`}
      className="block rounded-[8px] border border-[#c9d6da] bg-white px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.8)] transition hover:bg-[#fbfdfd]"
    >
      <h3 className="text-center text-[19px] font-semibold leading-9 text-[#31565a]">
        {option.title}
      </h3>

      {option.description ? (
        <p className="mt-2 text-center text-sm text-[#698488]">{option.description}</p>
      ) : null}

      {option.currentAmount && option.targetAmount ? (
        <div className="mt-4 rounded-[6px] bg-[#ebebeb] p-1">
          <div
            className={`h-[30px] rounded-[4px] ${toneClass}`}
            style={{ width: `${progress}%` }}
          />
          <p className="mt-[-24px] text-center text-sm text-[#1f1f1f]">
            עד כה נתרם {formatCurrency(option.currentAmount)} מתוך{" "}
            {formatCurrency(option.targetAmount)}
          </p>
        </div>
      ) : (
        <div
          className={`mt-4 rounded-[6px] px-4 py-4 text-center text-[17px] font-semibold text-[#31565a] ${toneClass}`}
        >
          מעבר למסלול תרומה
        </div>
      )}
    </Link>
  );
}
