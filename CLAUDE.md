# CLAUDE.md — project-wide rules

This file is read by Claude Code on every prompt in this repo. Keep it short and sharp.

## What this is

Nedovos v2 — Hebrew/RTL multi-tenant SaaS for synagogues and Jewish nonprofits. Donor CRM + payments + receipts + ops modules. See `PRD-nedarimplus.md` and `BUILD-PLAN.md` for full context.

## Tech stack

- Next.js 14 App Router + TypeScript (strict)
- Tailwind CSS + shadcn/ui + `tailwindcss-rtl`
- PostgreSQL on Neon, Prisma ORM
- Auth.js (NextAuth) + Prisma adapter
- `next-intl` for i18n (Hebrew default)
- Resend (email), Inforu (SMS), Tranzila (card payments — hosted iframe)
- Inngest for scheduled/background jobs
- Sentry for errors

## Hard rules (must never break)

1. **Every query must be scoped by `org_id`.** Use the repository layer in `src/server/repositories/*`. Never write `prisma.donor.findMany(...)` directly — use `donorRepo.list(orgId, ...)`. Cross-tenant leaks are unforgivable.
2. **Never log card numbers, CVVs, or PII.** Webhook payloads from Tranzila are logged with `redact()` from `src/lib/redact.ts`.
3. **All money in agorot (integers), not shekels (floats).** `Transaction.amount_minor: Int`. Never store `1.5` for ₪1.50.
4. **All dates in UTC at the DB layer.** Convert to Asia/Jerusalem only in the UI.
5. **No `any` in TypeScript.** Use `unknown` and narrow, or define the type.
6. **Server actions only mutate via Zod-validated input.** No `formData.get('amount') as string` without parsing through a schema.
7. **Idempotency on every payment-related webhook handler.** Key on the gateway's transaction ID.
8. **Hebrew strings live in `messages/he.json`.** Never hardcode Hebrew in JSX.

## Code conventions

- Server Components by default; mark `'use client'` only when needed
- Server actions in `src/app/**/actions.ts`, imported into client components
- Repositories in `src/server/repositories/*` enforce `org_id`
- Schemas in `src/lib/schemas/*` (Zod) — share between server actions and forms
- Tests live next to source: `foo.ts` + `foo.test.ts` (Vitest)
- Run `npm run typecheck && npm run lint && npm test` before committing
- File names: `kebab-case.ts`; React components: `PascalCase.tsx`

## Hebrew / RTL

- Root layout sets `<html dir="rtl" lang="he">` — never override per-page
- Use `tailwindcss-rtl` logical properties (`ms-2` not `ml-2`)
- Test every UI change at both 320px (mobile) and 1280px (desktop)
- When mixing Hebrew + LTR (e.g., English brand names inside Hebrew text), wrap LTR with `<bdi>` or use Unicode `‪` / `‬`

## Israeli integrations — do not trust agent memory

Tranzila, Yaad Sarig, Inforu, Cellact, Bit, Masav — these APIs are **not in training data accurately**. Always:
1. Open the official PDF docs (often Hebrew) before writing integration code
2. Test against the sandbox first
3. Save the gateway's exact response shapes to `docs/integrations/<provider>-samples.json` for future reference

If you can't find the docs, stop and ask — do not invent the API shape.

## What agents may do freely

- CRUD scaffolding (lists, forms, edit pages) under `src/app/(app)/*`
- Marketing copy iteration in `messages/he.json`
- Test generation
- Refactoring within a single file
- Adding shadcn components

## What requires human review before merge

- Anything touching `src/server/payments/*`
- Anything touching `src/server/auth.ts` or middleware
- Anything touching the Prisma schema
- Anything in `src/server/repositories/*` (org_id scoping)
- Any change to webhook handlers
- Any cron/Inngest function that moves money

## Stage-specific rules

When working in `stages/stage-NN-*/`, also read that folder's `CLAUDE.md` — it overrides or extends this file for that stage's work.

## References

- `PRD-nedarimplus.md` / `PRD-nedarimplus-he.md` — product requirements
- `BUILD-PLAN.md` — 10-stage roadmap with current stage marked
- `docs/integrations/*` — saved API response samples
- `docs/PCI.md` — PCI scoping posture (SAQ A via hosted iframe)
