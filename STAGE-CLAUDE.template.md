# CLAUDE.md template — per-stage

Copy this file to `stages/stage-NN-<slug>/CLAUDE.md` and fill in the placeholders. Keep it short — the root `CLAUDE.md` already has project-wide rules; this file only adds stage-specific context. If a section has nothing to say for this stage, delete it.

---

```markdown
# CLAUDE.md — Stage {{NN}}: {{stage name}}

## Goal

{{One sentence. e.g., "Donors can pay a one-time card donation; money lands in the org's gateway account."}}

## What's in scope this stage

- {{deliverable 1}}
- {{deliverable 2}}
- {{deliverable 3}}

## What's explicitly out of scope (do not build this stage)

- {{thing that will come in a later stage — e.g., "recurring payments (Stage 7)"}}
- {{thing you've decided to skip entirely}}

## Stage-specific rules (additions to root CLAUDE.md)

{{Rules unique to this stage. Examples:
- "All webhook handlers must be idempotent by gateway transaction ID."
- "Receipt PDF generation must support Hebrew and English donor names side by side."
- "Never store the gateway's raw card token in plaintext — use the `encrypt()` helper."}}

## Files you may create or modify

- `src/app/(app)/{{path}}/*`
- `src/server/{{module}}/*`
- `prisma/migrations/{{date}}_{{name}}/`
- `messages/he.json` (Hebrew strings only)

## Files off-limits this stage

{{Any code you should not touch. Examples:
- "`src/server/auth.ts` — auth is locked from Stage 2"
- "Other orgs' migrations — only add new ones, never edit existing"}}

## External integrations this stage

| Provider | Docs | Sandbox set up? | Sample saved? |
|---|---|---|---|
| {{Tranzila}} | {{url or path to PDF}} | {{yes/no}} | {{path to JSON sample}} |
| {{Inforu}} | {{url}} | {{yes/no}} | {{path}} |

If "Sample saved" is no, save real response shapes to `docs/integrations/<provider>-samples.json` before writing client code. Do not invent the shape.

## Tests required to ship this stage

- {{Critical paths to cover. e.g., "happy-path donation → webhook → receipt"}}
- {{Failure modes. e.g., "duplicate webhook delivery → no double-charge"}}
- {{Tenant isolation. e.g., "org A admin cannot read org B's transactions"}}

## Definition of done

- [ ] {{Concrete observable outcome 1}}
- [ ] {{Outcome 2}}
- [ ] All tests pass (`npm test`)
- [ ] Typecheck + lint clean (`npm run typecheck && npm run lint`)
- [ ] Preview deploy works end-to-end against the sandbox provider
- [ ] {{Stage-specific check, e.g., "PCI doc updated in docs/PCI.md"}}

## Known risks for this stage

{{Things that have historically gone wrong or are easy to get wrong. Examples:
- "Tranzila webhooks retry on 5xx — make sure handlers return 2xx even on validation errors after first successful processing"
- "RTL text in PDF: react-pdf needs explicit `direction: 'rtl'` per Text node"}}

## When to ask the human instead of guessing

- {{Any decision that should not be made by the agent. Examples:
- "Choice of payment provider (Tranzila vs Yaad) — confirmed Tranzila at start of stage"
- "Refund policy — needs business decision, not technical default"}}
```

---

## Example: filled in for Stage 5

Here's what a real per-stage CLAUDE.md looks like, so you can see the template in use.

```markdown
# CLAUDE.md — Stage 5: One-time card payments

## Goal

Donors can pay a one-time card donation through the public donation form; charges land in the org's Tranzila account; receipts are queued for Stage 6.

## What's in scope this stage

- Tranzila hosted-iframe integration on the donation page
- `Transaction` Prisma model + migration
- `/api/webhooks/tranzila` handler with HMAC verification and idempotency
- Success / failure pages
- Admin transactions list page (filter by org, date, status)
- `docs/PCI.md` updated (SAQ A, hosted iframe)

## What's explicitly out of scope (do not build this stage)

- Recurring payments (Stage 7)
- Receipt PDF generation (Stage 6)
- Refunds UI (manual via Tranzila portal for now)
- Bit payments (Stage 9)

## Stage-specific rules

- Every webhook handler must be idempotent — key on Tranzila's transaction ID. Replay-safe.
- Amounts stored as agorot (Int), never as float shekels.
- Webhook signature verification is mandatory — never accept an unsigned payload, even in dev.
- Never log card numbers, CVVs, or full webhook bodies. Use `redact()` from `src/lib/redact.ts`.
- Failed payments still write a `Transaction` row with `status: 'failed'` — never silently drop.

## Files you may create or modify

- `src/app/(public)/orgs/[slug]/donate/*`
- `src/app/api/webhooks/tranzila/route.ts`
- `src/server/payments/tranzila/*`
- `src/server/repositories/transaction.ts`
- `prisma/schema.prisma` (Transaction model)
- `messages/he.json`

## Files off-limits this stage

- `src/server/auth.ts`
- `src/server/repositories/donor.ts` (lock the donor write API; if you need to upsert a donor on payment, add a method through the existing repo)

## External integrations this stage

| Provider | Docs | Sandbox set up? | Sample saved? |
|---|---|---|---|
| Tranzila | `docs/integrations/tranzila-iframe-v2.pdf` | yes | `docs/integrations/tranzila-samples.json` |

## Tests required to ship this stage

- Happy path: form submit → iframe → success webhook → transaction row + donor upserted
- Idempotency: same webhook delivered twice → one transaction, one donor
- Bad signature: webhook rejected with 401, no DB write
- Failed payment: status=failed transaction row, no donor side effect
- Tenant isolation: admin of org A cannot see org B's transactions in list page

## Definition of done

- [ ] Sandbox card produces a successful charge end-to-end on preview deploy
- [ ] Webhook handler passes 5 test cases above
- [ ] Admin transactions page lists charges, filters work
- [ ] `docs/PCI.md` written and committed
- [ ] All tests pass, typecheck + lint clean
- [ ] Manual refund through Tranzila portal reflects in admin page within 10 minutes (via webhook)

## Known risks for this stage

- Tranzila webhooks retry on 5xx — return 2xx after first successful processing even on duplicate
- Tranzila sandbox uses a different signing key than production — store both in Vercel env, switch by `NODE_ENV`
- RTL number formatting: amounts in success page must use `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`

## When to ask the human instead of guessing

- Any change to the iframe URL parameters — verify against current Tranzila docs, not memory
- Adding new transaction statuses beyond `pending/success/failed/refunded`
- Anything that touches money handling outside what's in this scope list
```
