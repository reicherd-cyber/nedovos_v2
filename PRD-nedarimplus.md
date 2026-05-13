# PRD — Nedarim+ style platform

Draft product requirements for a Hebrew/RTL SaaS for synagogues and Jewish nonprofits, modeled on https://www.matara.pro/nedarimplus/.

## 1. Overview

A Hebrew/RTL SaaS platform for synagogues and Jewish nonprofits that combines donor CRM, multi-channel donation processing (credit card, Bit, bank standing orders), automated communications (SMS + voice), receipt issuance, and synagogue-specific operational tools (prayer times, seating, attendance, smart facility controls). Optional companion modules: physical donation kiosk and a prepaid/loyalty card network.

## 2. Goals

- Replace paper ledgers and ad-hoc spreadsheets used by gabbaim (synagogue administrators).
- Increase recurring giving via standing orders and matching campaigns.
- Provide donors with self-service transparency (history, stored cards).
- Maintain PCI DSS Level 1 + Israeli accessibility/privacy compliance.

## 3. Target users

- **Gabbai / synagogue administrator** — primary admin persona.
- **Nonprofit finance manager** — reports, exports to iCount.
- **Donor** — one-off + recurring.
- **Field/support staff** — kiosk maintenance, remote support.
- **Merchant partners** — NedarimCard loyalty network.

## 4. Functional requirements

### Auth
- Email/password, Google SSO, password reset.
- Role-based access (admin, finance, donor, merchant).

### Donor CRM
- Profile, contact, donation history, stored payment methods, custom tags/categories.

### Payments
- Credit card, Bit (Israeli P2P), bank transfer.
- Recurring standing orders (credit + bank mandate).
- Multi-currency (ILS / USD).

### Receipts
- Auto-generate, email/SMS delivery, downloadable.

### Communications
- SMS broadcast.
- Automated voice calls ("Nedarim Phone"-style).
- Recorded-message library.
- Staff-internal messaging.

### Reporting
- Revenue by category, donor reports, matching campaign progress.
- Export to Excel / APT / iCount.

### Operational modules
- Prayer-times publisher.
- Holiday seating assignment.
- Attendance / time-clock.
- Custom form builder.
- Smart-building (AC / lighting) toggles via API.

### Public surfaces
- Public donation page per organization (white-labelable URL).
- Org / synagogue search directory.
- Donor self-service portal.
- Public Zmanim (prayer-times) map with radius search.

### Optional modules
- Kiosk firmware/backend integration.
- Prepaid/loyalty card module with merchant network and balance lookups.

## 5. Non-functional requirements

- Full RTL Hebrew UI; future English support.
- PCI DSS Level 1 compliance for payment processing.
- Israeli accessibility law (תקן ישראלי 5568 / WCAG 2.0 AA).
- Privacy: GDPR-style + Israeli Privacy Protection Law.
- 99.9% uptime SLA for payment endpoints.
- Mobile-responsive (donors on phones, admins on desktop).
- Audit log for all admin financial actions.

## 6. Pages & components

- **Marketing home** — feature blocks, contact form with department routing, security badges, legal footer.
- **Org/synagogue search** — filter + map.
- **Public donation page** (per org) — form + payment methods + cause selector.
- **Donor portal** — login, dashboard, history, stored cards, standing-order manager, profile.
- **Admin dashboard** — RTL nav exposing the operational modules listed above.
- **Public Zmanim map**.
- **Loyalty card landing** (optional) — merchant map + balance inquiry.
- **Legal pages** — privacy, accessibility, terms.

## 7. Content requirements

- Hebrew copy for all flows; tone: practical, trust-oriented, community-focused.
- Feature blurbs mirroring the capability list in §4.
- Department-routed contact-form copy (marketing/sales, customer service, accounting, admin, field team, technical, management).
- Receipt / SMS / voice templates configurable per organization.
- Legal: privacy + accessibility statements.

## 8. Integrations

- Israeli payment gateway (credit-card tokenization, PCI-compliant).
- Bit (Israeli P2P payments).
- Bank standing-order (הוראת קבע) processor.
- Accounting exports: iCount, APT, Excel/CSV.
- SMS gateway (Israeli provider, e.g. Inforu / Cellact).
- Voice/IVR provider for auto-dial campaigns.
- Google OAuth (admin sign-in).
- *Optional*: smart-building/IoT controllers, kiosk hardware SDK, TeamViewer/AnyDesk handoff for support.

## 9. Reference site map (matara.pro/nedarimplus)

| Page | Purpose |
|---|---|
| Home (`/nedarimplus/`) | Marketing landing, dept-routed contact form |
| Donor portal (`/nedarimplus/online/?ClientZone=1`) | Donation form + logged-in donor self-service |
| Admin reports (`/nedarimplus/reports`) | Login-gated management dashboard |
| Zmanim (`/nedarimplus/zmanim`) | Public map-based minyan finder |
| NedarimCard (`/NedarimCard.html`) | Loyalty/prepaid card hub |
| Org/synagogue search | Find a registered institution to donate to |
| Privacy / Accessibility | Legal |

## 10. Reference feature catalog (from matara.pro)

1. Donor / member CRM
2. Credit-card payment processing
3. Bit & bank-transfer support
4. Standing / recurring orders (credit + bank)
5. Receipt generation & issuance
6. SMS broadcast
7. Voice-call broadcast ("Nedarim Phone")
8. Digital vouchers / digital receipts
9. Prayer-times management & publishing
10. Smart-synagogue electricity / AC control
11. Attendance & time-clock
12. Holiday seating assignment
13. Custom form builder
14. Matching / goal fundraising campaigns
15. Category-based reporting
16. Excel / APT / iCount accounting exports
17. Donor self-service portal (stored cards, history)
18. Physical donation kiosks
19. NedarimCard prepaid/loyalty card + merchant network
20. National prayer-times public directory (map + radius search)
21. Org / synagogue public search & donation routing
22. Google Sign-In for admins
23. Remote support (TeamViewer / AnyDesk)

## 11. UX observations (from reference)

- Hebrew-only, fully RTL.
- Minimalist, utilitarian visual style — white/gray neutrals, no hero banner/video.
- Legacy-feel loading GIFs, no scroll/parallax effects.
- Security signals: Comodo SSL badge, PCI DSS Level 1 noted on payment page.
- No public pricing, plans, trials, testimonials, or stats counters — sales is contact-form/phone driven.

## 12. Open questions

- Pricing model: per-org subscription, per-transaction %, or hybrid?
- Multi-tenant scope: single domain or per-org subdomains for donor portals?
- Kiosk hardware: build, partner, or skip in v1?
- Loyalty network: in-scope for v1 or phase 2?
- Voice-call telephony: build in-house or wrap a CPaaS?
- Receipts: integrate Israeli Tax Authority "חשבונית ישראל" e-invoicing?
- Donor auth: passwords + Google only, or also SMS/OTP login?
- Languages beyond Hebrew at launch (English for diaspora donors)?
- Mobile app vs PWA for gabbaim?
- Data residency: Israel-only hosting required?
