# Nedovos v2

Hebrew/RTL multi-tenant SaaS for synagogues and Jewish nonprofits.

This repository is being built in the order defined in [BUILD-PLAN.md](./BUILD-PLAN.md). The current codebase now covers the local implementation of **Stage 1** and **Stage 2**.

## Current state

- `Next.js 16` App Router application in the repo root
- `TypeScript` + `Tailwind CSS` + shadcn-style shared UI primitives
- Root layout configured for `dir="rtl"` and `lang="he"`
- `Heebo` loaded as the primary Hebrew UI font
- Mobile-first Hebrew landing page in `src/app/page.tsx`
- Prisma initialized for MySQL with multi-tenant auth models and migrations
- Auth.js email/password flow, optional Google sign-in, org switcher, invitations, audit logging
- Password reset, email verification, and local dev-email outbox flows
- CI workflow scaffolded for lint, typecheck, build, and Prisma schema validation
- Sentry package and minimal app wiring are in place; DSN/project values still come from environment

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

5. Open `http://localhost:3005`

## Useful commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run prisma:validate
```

## Auth and Dev Email Flow

- `GET /sign-up` creates a new org and queues a verification email into `GET /dev/outbox`
- `GET /sign-in` supports credentials and optional Google sign-in
- `GET /forgot-password` queues a password reset email into the local outbox
- `GET /verify-email/request` queues a fresh verification email into the local outbox
- `GET /accept-invite/[token]` supports both new invited users and existing invited users

## Stage Status

- Stage 1 done locally: app scaffold, RTL layout, Hebrew font, shared UI primitives, Prisma setup, CI, Sentry wiring, README
- Stage 2 done locally: auth, organizations, roles, invitations, password reset, email verification, audit logging
- External follow-up: Vercel project connection and production env vars
- External follow-up: replace local Sentry placeholder env values with real DSNs/project settings
- External follow-up: replace `sslaccept=accept_invalid_certs` with proper CA verification before production or CI DB access

## Key project rules

- Every tenant-bound query must be scoped by `org_id`
- Never log payment card data or sensitive PII
- Monetary values will be stored in minor units
- Hebrew UI strings should live outside JSX

See [CLAUDE.md](./CLAUDE.md), [PRD-nedarimplus.md](./PRD-nedarimplus.md), and [BUILD-PLAN.md](./BUILD-PLAN.md) for the full project context.
