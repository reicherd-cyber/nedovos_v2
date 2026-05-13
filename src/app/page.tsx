import type { Metadata } from "next";
import messages from "@/messages/he.json";

export const metadata: Metadata = {
  title: messages.metadata.title,
  description: messages.metadata.description,
};

export default function Home() {
  const { navigation, home } = messages;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="surface-card flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">
            NV
          </div>
          <div>
            <p className="text-sm text-muted">{home.eyebrow}</p>
            <p className="text-lg font-semibold">{navigation.brand}</p>
          </div>
        </div>

        <a
          href="/sign-in"
          className="tap-target hidden items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground sm:inline-flex"
        >
          התחברות
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <section className="surface-card overflow-hidden">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-center lg:gap-10 lg:px-10">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-accent px-3 py-2 text-sm font-medium text-primary-strong">
                {home.eyebrow}
              </span>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                  {home.title}
                </h1>
                <p className="max-w-xl text-base leading-8 text-muted sm:text-lg">
                  {home.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/sign-up"
                  className="tap-target inline-flex items-center justify-center rounded-full bg-primary px-5 text-base font-semibold text-white hover:bg-primary-strong"
                >
                  {navigation.primaryCta}
                </a>
                <a
                  href="/sign-in"
                  className="tap-target inline-flex items-center justify-center rounded-full border border-border bg-surface-secondary px-5 text-base font-semibold text-foreground hover:bg-surface"
                >
                  התחברות
                </a>
              </div>

              <ul className="grid gap-3 text-sm text-muted sm:grid-cols-3">
                {home.heroPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 leading-7"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(243,247,244,0.96)_100%)] p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3">
                  <div>
                    <p className="text-sm text-muted">מסך יעד ראשון</p>
                    <p className="text-lg font-semibold">תרומה במובייל</p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary-strong">
                    v2
                  </span>
                </div>

                {home.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-border bg-surface px-4 py-4"
                  >
                    <p className="text-3xl font-semibold text-primary">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="highlights" className="grid gap-4 lg:grid-cols-3">
          {home.highlights.map((highlight) => (
            <article key={highlight.title} className="surface-card p-5 sm:p-6">
              <p className="text-sm font-medium text-primary">{home.highlightsTitle}</p>
              <h2 className="mt-3 text-2xl font-semibold">{highlight.title}</h2>
              <p className="mt-3 text-base leading-8 text-muted">{highlight.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="surface-card p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">{home.principlesTitle}</h2>
            <ul className="mt-4 grid gap-3">
              {home.principles.map((principle) => (
                <li
                  key={principle}
                  className="rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm leading-7 text-foreground"
                >
                  {principle}
                </li>
              ))}
            </ul>
          </article>

          <article id="roadmap" className="surface-card p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">{home.roadmapTitle}</h2>
            <ol className="mt-4 grid gap-3">
              {home.roadmap.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-7 text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 text-sm text-muted sm:px-6 lg:px-8">
        {home.footer}
      </footer>
    </div>
  );
}
