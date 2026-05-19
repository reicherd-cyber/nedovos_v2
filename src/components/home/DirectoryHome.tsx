"use client";

import Link from "next/link";
import { useState } from "react";
import type { DirectoryCard } from "@/app/page";

type DirectoryHomeProps = {
  navItems: string[];
  directoryCards: DirectoryCard[];
};

export function DirectoryHome({
  navItems,
  directoryCards,
}: DirectoryHomeProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCards = directoryCards.filter((card) => {
    if (!normalizedQuery) {
      return true;
    }

    return [card.title, card.subtitle]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });

  return (
    <main className="min-h-screen bg-[#efefef] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col rounded-[24px] bg-[#ececec] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-6 sm:py-7 lg:px-10">
        <header className="relative flex flex-col items-center gap-4 pb-4 sm:pb-6">
          <div className="absolute left-0 top-0 hidden lg:block">
            <MemorialBadge />
          </div>

          <DirectoryLogo />

          <nav className="flex w-full justify-center">
            <div className="flex w-full max-w-[780px] gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="shrink-0 rounded-[8px] border border-[#e6e6e6] bg-white px-4 py-2 text-[15px] font-medium text-[#313131] shadow-[0_1px_0_rgba(255,255,255,0.85)] transition hover:bg-[#fafafa]"
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>

          <div className="lg:hidden">
            <MemorialBadge compact />
          </div>
        </header>

        <section className="mx-auto mt-1 w-full max-w-[1020px] rounded-[18px] bg-white px-4 py-5 shadow-[0_8px_24px_rgba(145,145,145,0.08)] sm:px-8 sm:py-7 lg:px-10">
          <div className="flex justify-center">
            <form
              className="flex w-full max-w-[420px] flex-row-reverse items-center gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="חיפוש מוסד או קהילה"
                className="h-[38px] flex-1 rounded-[6px] border border-[#444] bg-white px-4 text-center text-[18px] text-[#333] outline-none placeholder:text-[#9b9b9b]"
              />
              <button
                type="submit"
                className="inline-flex h-[38px] items-center justify-center rounded-[6px] border border-[#cad8d9] bg-[#f9ffff] px-3 text-[14px] text-[#7ca1a4] transition hover:bg-[#f2fbfc]"
              >
                חיפוש
              </button>
            </form>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredCards.map((card) => (
              <DirectoryTile key={card.id} card={card} />
            ))}
          </div>

          {filteredCards.length === 0 ? (
            <div className="mt-8 rounded-[14px] border border-[#ddd] bg-[#fafafa] px-4 py-8 text-center text-[16px] text-[#7a7a7a]">
              לא נמצאו מוסדות תואמים לחיפוש.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function DirectoryLogo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[4px] border-[#8bc7f1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <NedovosLogo mode="hero" />
      </div>
    </div>
  );
}

function MemorialBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-full border-[3px] border-[#b69249] bg-[radial-gradient(circle_at_30%_30%,#f9e8b6_0%,#d6b15f_45%,#ac8032_100%)] p-[4px] shadow-[0_8px_20px_rgba(125,94,29,0.22)] ${
        compact ? "h-[88px] w-[88px]" : "h-[100px] w-[100px]"
      }`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_45%_35%,#fefefe_0%,#f5efe3_100%)]">
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-full bg-[linear-gradient(180deg,#6aa0d2_0%,#31598a_100%)]" />
          <div className="mt-1 text-[9px] font-semibold text-[#7a5b26]">
            לעילוי נשמת
          </div>
        </div>
      </div>
      {!compact ? (
        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 rounded-full bg-[#e9d6a6] px-2 py-[2px] text-[8px] font-semibold text-[#5b4417]">
          מוקד סיוע וזכרון
        </div>
      ) : null}
    </div>
  );
}

function DirectoryTile({ card }: { card: DirectoryCard }) {
  return (
    <Link
      href={`/orgs/${card.id}`}
      className="flex min-h-[190px] flex-col items-center justify-start rounded-[14px] border border-[#d8d8d8] bg-white px-4 py-5 text-center shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(0,0,0,0.18)] sm:min-h-[196px]"
    >
      <div className="flex h-[112px] w-full items-center justify-center rounded-[18px] border-[3px] border-[#c7ced8] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fb_100%)]">
        <NedovosLogo mode="tile" label={card.category} />
      </div>

      <div className="mt-5 max-w-[148px] text-[14px] font-semibold leading-7 text-[#78553f] sm:text-[15px]">
        <div>{card.title}</div>
        {card.subtitle ? (
          <div className="text-[13px] leading-6 text-[#8b6b57]">{card.subtitle}</div>
        ) : null}
      </div>
    </Link>
  );
}

function NedovosLogo({
  mode,
  label,
}: {
  mode: "hero" | "tile";
  label?: string;
}) {
  const isHero = mode === "hero";

  return (
    <div className="flex flex-col items-center">
      {label ? (
        <span className="rounded-full bg-[#eef3fb] px-3 py-1 text-[10px] font-semibold text-[#5f78a0]">
          {label}
        </span>
      ) : null}
      <div className={label ? "mt-2" : ""}>
        <div className="flex items-center justify-center gap-1">
          <span
            className={
              isHero
                ? "text-[20px] leading-none text-[#df5a55]"
                : "text-[16px] leading-none text-[#df5a55]"
            }
          >
            ♪
          </span>
          <span
            className={
              isHero
                ? "text-[28px] font-black tracking-tight text-[#3d5f92]"
                : "text-[22px] font-black tracking-tight text-[#3d5f92]"
            }
          >
            נדבוס
          </span>
        </div>
        <div
          className={
            isHero
              ? "mt-1 text-center text-[9px] text-[#7a7a7a]"
              : "mt-1 text-center text-[8px] text-[#83899a]"
          }
        >
          לבתי כנסת וארגונים
        </div>
      </div>
    </div>
  );
}
