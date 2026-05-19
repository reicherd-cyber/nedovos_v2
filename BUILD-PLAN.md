# Build Plan — 10 Stages (Solo)

A phased plan to take the Nedarim+ style platform from empty repo to feature-complete v1. Each stage produces something deployable and demoable. Sequenced so payment processing — the riskiest piece — lands early and everything else builds on a proven foundation.

---

## Current status

- `[x]` Stage 1 local foundation complete
- `[x]` Stage 2 local auth, organizations, roles, invitations, and verification flows complete
- `[x]` Homepage reference pass complete with a directory-style institutional layout at `/`
- `[x]` Homepage directory entries moved into the `Org` table and loaded from MySQL
- `[~]` Stage 3 donor CRM has started: schema, list page, detail page, tags, notes, and CSV import are in place, but delete/archive and deeper polish are still pending
- `[~]` Stage 4 has partial groundwork only: the public home page, directory presentation, first `/orgs/[slug]` public page, and first `/orgs/[slug]/donate` intent-saving flow are in place, but full payment, contact persistence, and SEO/public pages are still pending
- `[ ]` External production setup still pending: Vercel production wiring, real Sentry DSN, production-grade DB TLS verification

### Homepage reference spec (implemented)

The home page at `/` should stay close to the provided reference image:

- outer light-gray shell with a centered rounded container
- centered circular `Nedovos` logo at the top
- memorial / support badge area near the top edge
- white pill navigation buttons in one desktop row and horizontal scroll on mobile
- a large white central panel for search and results
- centered RTL search box with a compact search button
- a dense results grid of matching institution cards
- every card must use the same shape:
  - white outer tile
  - inner rounded square logo frame
  - default `Nedovos` logo inside the frame
  - institution name under the frame
- card data now comes from `Org` rows where `publicListingEnabled = true`
- homepage ordering now comes from `Org.directoryOrder`, which should stay unique for curated entries
- homepage search currently matches `title` and `subtitle` only, and intentionally ignores category
- clicking a card now leads to `/orgs/[slug]`
- public org option cards now lead to `/orgs/[slug]/donate?option=...`
- mobile layout keeps the same visual language and collapses the grid to 2 columns
- tone should feel institutional, simple, dense, and service-oriented rather than promotional

---

## Recommended tech stack

Picked for a **solo developer** building a Hebrew/RTL multi-tenant SaaS with payments, marketing pages, and a donor portal.

| Layer | Pick | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | One language top-to-bottom, server components, SSR for SEO on public pages (Zmanim map, org search, donation pages) |
| UI | **Tailwind CSS + shadcn/ui** | Fast iteration; first-class RTL support via `tailwindcss-rtl` |
| Fonts | **Heebo** or **Rubik** (Google Fonts) | Good Hebrew coverage |
| Auth | **Auth.js (NextAuth) + Prisma adapter** | Email/password + Google SSO out of the box; role middleware |
| DB | **PostgreSQL** (Neon or Supabase) | Strong relational model fits CRM + payments; serverless tier on Neon |
| ORM | **Prisma** | Type-safe queries, migrations, seed scripts |
| i18n | **next-intl** | Hebrew default, English-ready for diaspora later |
| Payments | **Tranzila** or **Yaad Sarig** (hosted iframe / tokenization) | Israeli gateway; iframe model keeps you off PCI Level 1 audit |
| Email | **Resend** | Transactional email, simple SDK |
| SMS | **Inforu** or **Cellact** | Israeli SMS providers; APIs in Hebrew docs |
| Voice/IVR | **Twilio** or a local IL provider | Programmable voice for "Nedarim Phone"-style broadcasts |
| Background jobs | **Inngest** or **Trigger.dev** | Scheduled standing orders, retries, bulk SMS |
| PDF | **react-pdf** or **@react-pdf/renderer** | Hebrew receipts |
| Hosting | **Vercel** (app) + **Neon** (DB) | Zero-ops; easy preview deploys |
| Monitoring | **Sentry** + Vercel Analytics | Errors + perf |
| Code | **GitHub** + GitHub Actions | CI: typecheck, lint, build |

**One critical decision up front:** keep your app **out of PCI Level 1 scope** by using a hosted-iframe gateway — never let card numbers touch your servers. This is non-negotiable.

---

## Stage 1 — Foundation & RTL skeleton

**Goal:** A deployed, blank Hebrew/RTL Next.js app on a custom domain with auth-ready DB.

**Deliverables**
- Next.js + TS + Tailwind + shadcn/ui project
- PostgreSQL on Neon, Prisma initialized
- RTL configured globally (`<html dir="rtl" lang="he">`)
- Hebrew font loaded
- Vercel deploy on `nedovos.dev` (or your domain) with HTTPS
- GitHub Actions CI (typecheck, lint, prisma validate)
- Sentry wired up
- `README` with local-dev instructions

**How to begin (concrete first steps)**

```powershell
cd C:\git\my-projects\nedovos_v2
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install tailwindcss-rtl lucide-react next-intl zod
npm install -D @types/node
npx prisma init
npx shadcn@latest init
```

Then:
1. Sign up at neon.tech, create a project, copy the connection string into `.env` as `DATABASE_URL`.
2. In `src/app/layout.tsx`, set `<html dir="rtl" lang="he">` and import Heebo from `next/font/google`.
3. Add `require('tailwindcss-rtl')` to `tailwind.config.ts` plugins.
4. Push to GitHub, connect repo to Vercel, add env vars in the Vercel dashboard.
5. Add a GitHub Actions workflow that runs `npm run typecheck && npm run lint && npx prisma validate`.
6. Create a Sentry project, run `npx @sentry/wizard@latest -i nextjs`.
7. If local DB access temporarily uses `sslaccept=accept_invalid_certs`, add a follow-up task to replace it with proper CA verification before production or CI access to the database.

**Definition of done:** you can `git push` → Vercel builds → the deployed URL shows a Hebrew "Hello world" in RTL.

**Why first:** every later stage depends on this. Don't skip the deploy step — solving "it works locally but not on Vercel" early prevents pain in stage 5.

---

**Current repo marker:** `[x]` Local implementation complete. This repo now has the RTL app shell, MySQL-backed Prisma setup, shared UI primitives, CI, README, and local Sentry wiring. External production deployment tasks remain open.

## Stage 2 — Auth, organizations, and roles

**Goal:** Multi-tenant authentication. Users belong to organizations (`Org`) with roles.

**Deliverables**
- Prisma models: `User`, `Org`, `Membership`, `AuditLog`
- Auth.js providers: email/password (via credentials + bcrypt) + Google
- Sign-up, sign-in, password reset, email verification flows
- Org switcher in header (for users in multiple orgs)
- Middleware: `requireRole('admin' | 'finance' | 'donor' | 'merchant')`
- Invitation flow (admin invites user by email → magic link)
- Audit-log helper that writes to `AuditLog` on every privileged action

**Homepage design direction locked in:** when Stage 4 is built out, keep the current home-page reference direction rather than switching back to a generic startup hero:
- centered circular logo
- institutional top pill navigation
- white search/results panel
- uniform institution tiles with the shared Nedovos logo card pattern
- mobile 2-column grid
- restrained gray/white palette with minimal accents

**How to begin**
1. Define Prisma schema (User, Org, Membership with role enum, AuditLog).
2. `npx prisma migrate dev --name init`.
3. Implement Auth.js config in `src/auth.ts` with credentials + Google providers.
4. Build sign-in / sign-up pages in `(public)` route group.
5. Create `(app)` route group with a layout that calls `auth()` and redirects if no session.
6. Build org switcher: dropdown listing the user's `Membership` records.

**Definition of done:** you can sign up with email or Google, the user is auto-assigned to a freshly-created `Org` with `admin` role, you can invite a second user, switch between orgs, and every action lands in `AuditLog`.

**Why now:** every other module needs `org_id` scoping. Get the tenant model right before adding data tables.

---

**Current repo marker:** `[x]` Local implementation complete. Password reset, email verification, invitation acceptance, audit logging, org switching, and protected dashboard routing are implemented. Email sending currently uses a local dev outbox instead of a live provider.

## Stage 3 — Donor CRM (core)

**Goal:** The admin can manage donors. Donor data is the trunk everything else hangs off.

**Deliverables**
- Prisma: `Donor`, `DonorTag`, `DonorNote` (all scoped to `org_id`)
- Donor list page: search, filter by tag, paginate
- Donor detail page: profile, tags, notes, placeholder for "donation history"
- Add / edit donor forms with React Hook Form + Zod validation
- CSV import (basic): map columns → create donors
- All queries enforce `org_id` filter via a Prisma extension or repository layer

**How to begin**
1. Sketch donor fields: name, ID number, email, phone, address, city, language, tags, custom fields (JSON).
2. Migrate schema.
3. Build a `donors` route under `(app)` with a table (use shadcn `<DataTable>`).
4. Implement server actions for create/edit/delete (no separate API needed).
5. Wire `org_id` enforcement at the repository layer — one wrong query here leaks tenants.

**Definition of done:** admin can add a donor, find them via search, edit their profile, tag them, and import a 100-row CSV.

**Why now:** the public donation page (stage 4) will create donors on the fly; you need the data model first.

**Current repo marker:** `[~]` Started. The repo now includes donor models, org-scoped repository functions, `/dashboard/donors`, donor detail/edit pages, internal notes, and a basic CSV import path. Delete/archive, pagination, and richer import UX are still open.

---

## Stage 4 — Marketing site + public donation page (no payments yet)

**Goal:** Public-facing pages exist and look polished. Donation form collects details but doesn't yet charge.

**Deliverables**
- Marketing landing (`/`) — Hebrew, RTL, hero, feature blocks, contact form
- Org public profile (`/orgs/[slug]`) — name, mission, donate CTA
- Donation form page (`/orgs/[slug]/donate`) — amount, currency, cause, donor details, recurring toggle (disabled placeholder)
- Org search directory (`/orgs`) — list + search by name/city
- Privacy + accessibility statement pages
- `sitemap.xml`, `robots.txt`, OpenGraph meta
- Contact form persists to DB and sends an email to the right department

**Current repo marker:** `[~]` Partial implementation only. The `/` page exists now, follows the approved reference layout, is backed by public `Org` rows from MySQL, links into `/orgs/[slug]`, and those public organization pages now route into a first `/orgs/[slug]/donate` form that stores `DonationIntent` rows. The rest of Stage 4 is still open: `/orgs`, richer public copy, contact persistence, SEO pages, sitemap, robots, and the later Stage 5 payment gateway flow.

**How to begin**
1. Design system: pick color palette, typography scale; build base components (button, input, card).
2. Mock the landing page content; iterate on copy with stakeholder.
3. Build the donation form with React Hook Form + Zod (no payment integration yet — just persist to a `DonationIntent` table).
4. Use Next.js `generateStaticParams` for org profile pages to get SSG performance.

**Definition of done:** a non-logged-in visitor can land on `/`, navigate to an org, fill the donation form, and you can see the captured intent in the admin dashboard. SEO meta validates with [opengraph.xyz](https://opengraph.xyz).

**Why now:** the donation form is the gateway to revenue. Building it before payments forces you to nail the UX without the distraction of gateway debugging.

---

## Stage 5 — One-time card payments (the big one)

**Goal:** A donor can actually pay with a credit card. Money lands in the org's account.

**Deliverables**
- Tranzila (or Yaad) account onboarded; sandbox + production keys
- `Transaction` Prisma model
- Server-rendered hosted iframe in the donation flow (the iframe is gateway-served — card data never touches you)
- Webhook handler for `payment.success` / `payment.failed`
- Success and failure pages
- On success: create/update `Donor`, write `Transaction`, fire receipt-trigger event (placeholder until stage 6)
- Admin transactions page: list, filter, refund (manual)
- PCI scoping note in repo: "we use hosted iframe → SAQ A applies"

**How to begin**
1. Open a Tranzila sandbox account; read their iframe docs.
2. Build a thin server action that creates a `TransactionIntent` row and returns a signed iframe URL.
3. Embed the iframe on the donation success route.
4. Build the webhook endpoint (`/api/webhooks/tranzila`) — verify HMAC signature, idempotency by transaction ID.
5. Test end-to-end with a sandbox card.
6. Document the PCI compliance posture in `docs/PCI.md`.

**Definition of done:** sandbox card charges go through, the webhook updates the DB, an admin sees the transaction, and you can refund manually via Tranzila's portal.

**Why now:** this is the highest-risk stage technically and legally. Doing it before stages 6+ means everything else can assume a working payments pipeline. Build the rest of the value on solid revenue rails.

---

## Stage 6 — Receipts + email/SMS notifications

**Goal:** Every successful transaction triggers a Hebrew receipt by email and an SMS confirmation.

**Deliverables**
- Receipt template (PDF) — Hebrew, RTL, org logo, donor name, amount, cause, date, receipt number
- `Receipt` Prisma model with sequential numbering per org
- Email integration (Resend) — receipt PDF attached
- SMS integration (Inforu) — short Hebrew message with link to receipt
- Template editor in admin (basic): edit Hebrew copy for receipt email + SMS per org
- Donor preference: prefers email / SMS / both
- Retry logic on email/SMS failures

**How to begin**
1. Sign up for Resend and Inforu, get API keys.
2. Build a `ReceiptPdf` React component with `@react-pdf/renderer`.
3. Add a server action: `sendReceipt(transactionId)`.
4. Wire it as a side effect of the webhook handler (queue via Inngest if you want retries).
5. Test with both Hebrew and English donor names (RTL/LTR mixing).

**Definition of done:** a sandbox donation produces an emailed PDF receipt in Hebrew + an SMS to the donor's phone, both arrive within a minute.

**Why now:** legal/operational requirement in Israel — donors expect a receipt for tax purposes. Don't go to production without it.

---

## Stage 7 — Recurring donations + donor portal

**Goal:** Donors can set up monthly standing orders and self-serve via a logged-in portal.

**Deliverables**
- `StandingOrder` Prisma model (donor, amount, frequency, payment method ref, next_run_at)
- Tokenized recurring: store gateway token at first charge → reuse for monthly charges
- Bank standing-order (הוראת קבע) integration (Masav or your gateway's offering)
- Scheduled job (Inngest cron): each day, find due standing orders, charge them, write transaction, send receipt
- Donor portal (`/portal`) — login (email + OTP code), view history, manage standing orders (pause, cancel, update card), download receipts
- Failed-charge handling: retry policy, notify donor

**How to begin**
1. Decide token strategy with your gateway (most IL gateways support tokens for recurring billing).
2. Build the standing-order data model; design the retry policy on paper first.
3. Build the cron job in Inngest; test by setting `next_run_at` to "now" on a test record.
4. Donor portal auth: separate from admin login. Use OTP-by-SMS (preferred in IL) instead of password.
5. Build the bank הוראת קבע flow as a separate sub-track (lots of paperwork, separate from card recurring).

**Definition of done:** a sandbox standing order auto-charges next day, receipt is sent, donor can pause/cancel from the portal, a failed charge produces a retry on day 3 and an SMS to the donor.

**Why now:** standing orders are the #1 revenue lever for synagogues. Without recurring, you're a payment form — with it, you're a SaaS.

---

## Stage 8 — Reporting, exports, audit

**Goal:** Admins get actionable data and accountants get clean exports.

**Deliverables**
- Admin dashboard: KPIs (today, MTD, YTD), top donors, revenue by category
- Reports page: filter by date range, category, campaign; chart + table
- Exports: Excel (with `exceljs`), iCount-format CSV, APT-format CSV
- Donor reports: donations per donor, retention cohorts
- Audit log UI for admins (read-only view of `AuditLog`)
- Reconciliation report: gateway transactions vs DB transactions

**How to begin**
1. Map out the 5 reports admins ask for most (validate with a stakeholder if available).
2. Use Recharts inside Server Components for chart rendering.
3. Build one export format end-to-end (iCount), then replicate the pattern.
4. Reconciliation: build a server action that pulls last 7 days from gateway API and diffs against DB.

**Definition of done:** a finance manager can generate the prior-month donation report, export it to iCount-ready CSV, and reconcile against the gateway's export with zero diffs.

**Why now:** once standing orders are running (stage 7), volume picks up. Without reports, the admin is flying blind. Without exports, the accountant is doing manual data entry.

---

## Stage 9 — Synagogue ops modules + Bit

**Goal:** Differentiating modules that turn a generic donation SaaS into a synagogue platform.

**Deliverables**
- Bit (Israeli P2P) payment integration — second payment method on the donation form
- Prayer times publisher (per org): admin enters times, public page renders them
- Public Zmanim map (`/zmanim`): all participating orgs, search by location + radius
- Custom form builder: admin defines form fields → public form on org's URL → submissions to DB
- Holiday seating (basic): admin uploads seat map, assigns donors to seats, donor sees their seat in portal

**How to begin**
1. Bit integration (similar pattern to Tranzila webhook).
2. Pick ONE ops module to ship first — recommend prayer times (lowest complexity, highest visible value).
3. Public Zmanim map: use MapLibre + the prayer-times data; cluster pins.
4. Custom form builder: don't over-engineer. Start with a JSON-schema-driven renderer (5 field types).

**Definition of done:** 3 of the 5 ops modules are live, each linked from the org admin nav.

**Why now:** these are the features that win contracts vs. generic donor CRMs. But they only matter once payments + recurring + receipts work — otherwise you're building features on a leaky bucket.

---

## Stage 10 — Voice campaigns + campaigns + polish

**Goal:** Mass communication, matching campaigns, and the long tail of v1 features.

**Deliverables**
- Voice broadcast ("Nedarim Phone"): admin records a message → schedules a campaign → Twilio dials a list → playbacks
- Recorded message library
- Matching/goal campaigns: live progress page (donated / target), public sharing
- Internal staff messaging (basic Slack-style channel per org)
- SMS broadcast UI (use the Inforu integration from stage 6)
- Smart-building API (toggle AC) — only if a specific customer asks
- Accessibility pass: WCAG 2.0 AA against Israeli standard
- Performance pass: lighthouse > 90 on public pages
- Soft-launch readiness checklist

**How to begin**
1. Twilio account, buy an Israeli number, build a `VoiceCampaign` model.
2. Test voice with a recorded Hebrew message to your own phone first.
3. Matching campaigns: dedicated public page with progress bar and shareable link.
4. Soft-launch checklist: backups verified, monitoring + alerts, runbook for top 5 failure modes, support email/phone.

**Definition of done:** you can run a voice + SMS campaign to a saved donor list, track matching-campaign progress in real time on a public page, and pass an accessibility audit.

**Why now:** these are last because they're high-effort and not strictly required for revenue. Ship a working v1 (stages 1-8), let real customers tell you which of these matters most, then prioritize.

---

## Cross-cutting concerns (don't skip)

Treat these as ongoing tracks running alongside every stage, not as separate stages:

- **Security**: secrets in Vercel env vars only, rate-limit auth endpoints, CSRF on server actions, regular `npm audit`, dependabot.
- **Backups**: Neon's PITR is on by default — verify retention. Test a restore in stage 2.
- **Observability**: Sentry from stage 1, structured logging by stage 3, alerts (Slack/SMS) by stage 5.
- **Legal**: Terms of Service + Privacy Policy live before stage 4 ships publicly. Accessibility statement before stage 4. Tax-receipt compliance details with an Israeli accountant before stage 6.
- **Customer feedback loop**: even solo, get one real synagogue gabbai using a sandbox account by end of stage 5. Their feedback should reshape stages 7-10.

## How to think about pacing

Solo, expect:
- **Stages 1-2**: ~1 week each — well-trodden territory.
- **Stages 3-4**: ~2 weeks each — UI-heavy, lots of small decisions.
- **Stage 5**: ~3-4 weeks — payments always slip.
- **Stage 6**: ~2 weeks.
- **Stage 7**: ~3 weeks — recurring + bank הוראת קבע is its own beast.
- **Stage 8**: ~2 weeks.
- **Stages 9-10**: ~3 weeks each.

That's ~6 months solo at a steady pace. Compress by deferring stage 9 ops modules until after a v1 launch.

## What to do right now (today)

1. Buy the domain you want.
2. Open accounts (in this order): GitHub, Vercel, Neon, Sentry. Free tiers are fine.
3. Run the Stage 1 setup commands at the top of this doc.
4. Get to "Hello world in Hebrew RTL on the production URL" before moving to anything else.
5. Open `STAGE-01-checklist.md` in this folder (create it from the Stage 1 deliverables list) and start checking items off.

If you want, I can scaffold Stage 1 right now — generate the Next.js project, drop in the RTL config and base layout, and get you to a working deploy. Just say the word.
