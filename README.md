# Nedovos v2

Hebrew/RTL multi-tenant SaaS for synagogues and Jewish nonprofits.

This repository is being built in the order defined in [BUILD-PLAN.md](./BUILD-PLAN.md). The current implementation is focused on **Stage 1: Foundation and RTL skeleton**.

## Current state

- `Next.js 16` App Router application in the repo root
- `TypeScript` + `Tailwind CSS`
- Root layout configured for `dir="rtl"` and `lang="he"`
- `Heebo` loaded as the primary Hebrew UI font
- First mobile-first Hebrew landing page in `src/app/page.tsx`
- Prisma initialized for MySQL
- CI workflow scaffolded for lint, typecheck, build, and Prisma schema validation

## Current runtime facts

- App runs locally on `http://localhost:3005`
- Prisma uses `MySQL`
- Database host is on `DigitalOcean`
- Active database name is `nedovos_v2`
- Local TLS workaround in the connection string is `sslaccept=accept_invalid_certs`

## Planned stack

- `Next.js` + `TypeScript`
- `Tailwind CSS` + `shadcn/ui`
- `MySQL` + `Prisma`
- `Auth.js`
- `next-intl`
- `Resend`, `Inforu`, `Tranzila`, `Inngest`, `Sentry`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
copy .env.example .env
```

3. Set `DATABASE_URL` to your DigitalOcean MySQL connection string.
   If your local Windows trust store rejects the managed MySQL certificate chain, use `sslaccept=accept_invalid_certs`.

4. Start the dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Useful commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run prisma:validate
```

## Stage 1 checklist

- Done: App scaffold, RTL layout, Hebrew font, starter landing page
- Done: Prisma initialization
- Done: CI scaffold
- Done: DigitalOcean MySQL connection source identified
- Pending: Vercel deployment
- Pending: Sentry setup
- Pending: shadcn/ui initialization

## Key project rules

- Every tenant-bound query must be scoped by `org_id`
- Never log payment card data or sensitive PII
- Monetary values will be stored in minor units
- Hebrew UI strings should live outside JSX

See [CLAUDE.md](./CLAUDE.md), [PRD-nedarimplus.md](./PRD-nedarimplus.md), and [BUILD-PLAN.md](./BUILD-PLAN.md) for the full project context.
