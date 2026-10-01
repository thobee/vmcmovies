# VMC — agent handoff

Paste this file (or `@AGENT_HANDOFF.md`) at the start of a new Cursor chat. Then say what to build. **Do not invent NextAuth, Prisma, or a `middleware.ts` file** — this repo uses Paystack, custom JWT cookies, MongoDB driver, and Next.js 16 `src/proxy.ts`.

**Product:** Vintage Movie Channel — browse movies/series for free; **premium members get Telegram download links** (not in-browser video). Live repo: `https://github.com/thobee/vmcmovies.git`. Typical branch: `main`. Deploy: Vercel.

---

## How a new agent should work

1. **Ponytail** (`.cursor/rules/ponytail.mdc`): YAGNI, reuse existing helpers, no new deps, smallest correct diff, one shared guard over per-caller patches. Non-trivial logic leaves one small runnable check (`*.check.ts` pattern already exists).
2. **Next.js 16** (`AGENTS.md`): read `node_modules/next/dist/docs/` before assuming App Router APIs. This is **not** Next 14 muscle memory.
3. **Graphify** is mandated by `.cursor/rules/graphify.mdc` but **the `graphify` CLI is not installed** and `graphify-out/` does not exist. Use Read/Grep/Glob. After code edits, skip `graphify update` unless the CLI is installed.
4. **Never commit `.env.local`**. Copy env names from `.env.example` only.
5. **UI verification:** if you change public or admin UI, exercise the flow in the browser (not screenshot-only).
6. Public pages: **Phosphor** (`@phosphor-icons/react`). Admin still uses some Lucide. Fonts: Plus Jakarta Sans (body), Space Grotesk (display), Baloo 2 (comic headlines).

---

## Stack

| Layer | Choice |
|--------|--------|
| App | Next.js **16.3** App Router, React 19, TypeScript, Tailwind **4** |
| DB | MongoDB (`mongodb` driver). DB name `MONGODB_DB_NAME` default `vmc` |
| Auth | Custom **jose** JWT cookies — **not** NextAuth/Clerk |
| Payments | **Paystack** (`src/lib/payments/paystack.ts`) |
| Email | Resend HTTP API (`src/lib/email/resend.ts`) |
| Images | TMDB + Cloudinary; `CatalogImage` / `BackdropImage` wrappers |
| Motion | `motion/react` |
| Video.js | In `package.json` — **not used for member downloads** (Telegram links) |
| Path alias | `@/` → `src/` |

Scripts (`package.json`): `dev`, `build`, `seed`, `migrate:slugs`, `mongo:local`, `admin:hash-password`, `admin:promote`, `email:test`, `payment:smoke`, `email:backfill`.

Local Mongo: `npm run mongo:local` (memory server). Prod: Atlas URI in Vercel.

---

## Product model

- Catalog is public. Downloads are **premium-gated** in `DownloadPanel`: `premiumStatus === "active"` shows Telegram links; `pending` = wait for payment verify; else lock + `/get-access`.
- Movies: one `downloadUrl` (Telegram deep link). Series: `seasons[]` each with `downloadUrl`; episodes live in the bot, not the site.
- Premium is **time-boxed** (`premiumStartDate` / `premiumExpiryDate`). `effectivePremiumStatus()` maps active+past expiry → `expired`.
- Currency in code is **NGN** (kobo = display × 100). Default prices in `src/lib/payments/plans.ts` can be overridden by admin billing (`site_billing` + `resolve.ts`). Plans: `monthly` (₦1,000), `quarterly` (₦2,500), `biannual` (₦4,500). Legacy `yearly` still fulfills 12 months.
- Title requests: members request missing titles (`title_requests`). Support tickets: `support_tickets`.

---

## Public routes

| Route | Role |
|--------|------|
| `/` | Home: `FeaturedStrip` hero, How it works, rails, Why VMC, pricing banner |
| `/movies`, `/series`, `/search`, `/genre/[slug]` | Browse |
| `/movie/[slug]`, `/series/[slug]` | Detail + download panel (`TitleView` + backdrop) |
| `/tv` | Redirects to `/series` |
| `/get-access` | Pricing + Paystack checkout |
| `/payment/callback` | Return from Paystack |
| `/login`, `/signup`, `/forgot-password`, `/account` | Member auth |
| `/support`, `/privacy`, `/terms` | Site pages |

Home ISR: `revalidate = 120` on `src/app/page.tsx`.

Hero slides: admin `settings` document + catalog. `FeaturedStrip` resolves slide `ctaHref` against catalog so the backdrop comes from the **linked title**, not only the slide image URL. Image helpers: `src/lib/catalog/image.ts` (`resolveHeroImage`, placeholders). `CatalogImage` uses Next/Image + `referrerPolicy="no-referrer"` where needed so TMDB/hotlink images load.

---

## Admin routes

Prefix `/admin`. Dashboard group: `(dashboard)` — movies, series, users, requests, payments, billing, homepage, updates, support.

- **Bootstrap:** `/admin/signup` only while `countAdmins() === 0`. After that, closed.
- **Second admin / mini admin:** CLI only — `npm run admin:promote -- email@domain admin` for full admin, or `npm run admin:promote -- email@domain content` for a content admin. The helper calls `promoteUserToAdminRole` in `users.ts`. **Not in the admin UI.**
- Env bootstrap also: `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (`npm run admin:hash-password`).
- Login requires **TOTP** (`totpEnabled` + encrypted secret). Session cookie `vmc_admin_session`, **12h**, JWT secret = `admin:${AUTH_SECRET}`. Admin roles: `admin` = full access; `content_admin` = movies, series, homepage, updates, requests, support only. Content admins are blocked from users, billing, payments, revenue, and finance APIs.
- Optional `ADMIN_GATE`: without `?g=` or cookie `vmc_admin_gate`, `/admin/login` (and related auth APIs) look like 404. Implemented in `src/proxy.ts`.
- Admin **does not** use member idle logout (`SessionIdleMonitor` is root layout for members).

---

## API map (`src/app/api/`)

**Auth:** `auth/signup`, `login`, `logout`, `me`, `forgot-password`, `google`, `google/callback`.

**Payments:** `payments/initialize`, `verify`, `webhook`. Billing plans: `billing/plans`.

**Catalog/search:** `catalog/search`. Requests: `requests`. Support: `support`. Updates/notifications: `updates`, `notifications`.

**Admin:** `admin/login|logout|signup|me|password-reset`, `content`, `content/[id]`, `upload`, `tmdb`, `users`, `requests`, `payments`, `payments/withdraw|balance|recipient`, `billing`, `homepage`, `updates`, `support`.

---

## Mongo collections

| Collection | Purpose |
|------------|---------|
| `users` | Members + admins |
| `content` | Movies/series; unique `id`, unique sparse `slug` |
| `payments` | Paystack checkout records + fulfill flags |
| `site_billing` | Admin price/promo/launch-offer overrides |
| `settings` | Homepage slides + rail titles |
| `site_updates` | Bell / marketing notices |
| `title_requests` | User title requests |
| `support_tickets` | Support form |
| `user_password_resets` | Member OTP hashes, 10 min TTL |
| `admin_password_resets` | Admin reset OTPs |

`getDb()` in `src/lib/db/mongodb.ts`. Catalog accessors in `src/lib/catalog/index.ts` **fall back to mock** (`src/data/catalog/mock.ts`) if Mongo is missing or throws (`safeDb`).

User fields (`src/lib/auth/types.ts`): `email`, `telegramUsername`, `passwordHash` (may be `""` for Google-only), `googleId`, `role` (`user` \| `admin`), `premiumStatus` (`none` \| `active` \| `expired` \| `pending`), dates, `totpEnabled`.

Content (`src/lib/catalog/types.ts`): `slug`, `type`, poster/backdrop, genres, qualities, `featured`, movie `downloadUrl`, series `seasons`.

---

## Member auth (read these files first)

| File | What it does |
|------|----------------|
| `src/lib/auth/session.ts` | Cookie `vmc_session`, HS256, **7d** default / **30d** if remember. Reloads user from DB each request. |
| `src/lib/auth/idle.ts` + `SessionIdleMonitor.tsx` | **Client idle logout**, default **30 min** (`NEXT_PUBLIC_AUTH_IDLE_TIMEOUT_MINUTES`, min 5). Independent of JWT maxAge. |
| `src/lib/validation/password.ts` | **8–12 characters** on signup, reset, admin bootstrap. **Not** enforced on login. |
| `src/lib/auth/password-reset.ts` | OTP email. Sends even if `passwordHash` is empty (**Google-only users**). Admins skipped. Always `{ ok: true }` if user missing (no email enumeration). |
| `src/lib/auth/google.ts` + API routes | OAuth; redirect `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback` |
| `src/lib/auth/users.ts` | CRUD, `activatePremium`, `promoteUserToAdmin`, expiry |

Cookies: `httpOnly`, `sameSite: lax`, `secure` in production or `VERCEL=1` (`src/lib/security/cookies.ts`).

**Not decided / not built:** shortening JWT to 24h; welcome email on signup; admin idle timeout.

---

## Payments (Paystack)

Flow:

1. Logged-in user POSTs `/api/payments/initialize` with `planId`.
2. `resolveChargeForUser` applies `site_billing` + launch offer + first-time vs returning.
3. Pending row in `payments`; Paystack transaction initialize; browser goes to `authorization_url`.
4. Callback URLs should use the live domain — set `PAYSTACK_RETURN_BASE_URL` (or live `NEXT_PUBLIC_APP_URL`). Helper: `paymentReturnBase` in `app-url.ts`.
5. Webhook `/api/payments/webhook` (`charge.success`) + client `/api/payments/verify` → `fulfillPayment` (`fulfill.ts`): match amount/currency/status, `activatePremium`, `markPremiumActivated`, Resend emails.
6. Webhook: permanent fail → 200 (stop retries); retryable → 500.

Test vs live: use `PAYSTACK_SECRET_KEY=sk_test_...` for testing and `sk_live_...` for production.

---

## Email (Resend)

- `sendEmail` returns `{ ok, detail }` — surface `detail` in **dev** only on forgot-password failures.
- `EMAIL_FROM` empty → typically `onboarding@resend.dev`, which **only delivers to the Resend account’s own email** until a domain is verified. Production password-reset must use a verified domain + matching `EMAIL_FROM`.
- Also: payment receipts + `ADMIN_NOTIFY_EMAIL` (fallback `ADMIN_EMAIL`).

---

## Images, TMDB, Cloudinary

- Admin TMDB search: `src/lib/tmdb/client.ts` + `/api/admin/tmdb`.
- Uploads: Cloudinary (`src/lib/cloudinary.ts`) — required on Vercel (no durable local disk).
- `next.config.ts` `images.remotePatterns`: tmdb, cloudinary, amazon, hf.space, localhost.
- Empty poster URLs must go through `CatalogImage` / `resolveCatalogImage` so Next/Image does not break.

---

## Security extras

- `src/proxy.ts` (Next 16 request proxy — **not** `middleware.ts`): HTTPS redirect in prod, security headers, optional admin gate.
- Rate limit: `src/lib/security/rate-limit.ts` (in-memory; fine on one serverless instance, not a cluster lock).
- Honeypot on public forms: `src/lib/security/honeypot.ts`.
- Headers: `src/lib/security/headers.ts`.

---

## UI / layout notes (recent work)

- Root layout: `AuthProvider` + `SiteToastProvider` + `SessionIdleMonitor`.
- Auth screens: `AuthShell.tsx` — avoid stacking `min-h-[100dvh]`; mobile teaser + constrained form.
- Pricing cards: `PricingGrid.tsx` / `PremiumBanner.tsx` — avoid duplicate month labels / savings badges (was iterated).
- Why VMC: `WhyVmcSection.tsx` + copy in `src/lib/marketing/why-vmc.ts` (iterated list vs bento vs panel grid).
- Navbar, notification bell (`/api/notifications` = site updates + personal billing notices).

---

## Env checklist (names only — see `.env.example`)

Required for a real app: `MONGODB_URI`, `MONGODB_DB_NAME`, `AUTH_SECRET` (≥32 chars), `NEXT_PUBLIC_APP_URL`.

Telegram: `NEXT_PUBLIC_TELEGRAM_BOT`, `NEXT_PUBLIC_TELEGRAM_CHANNEL`, optional WhatsApp group.

Payments: `PAYSTACK_SECRET_KEY`, optional `PAYSTACK_RETURN_BASE_URL`.

Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, optional `ADMIN_GATE`.

TMDB: `TMDB_API_KEY`. Cloudinary: `CLOUDINARY_*`. Resend: `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`.

Idle: `NEXT_PUBLIC_AUTH_IDLE_TIMEOUT_MINUTES` (default 30).

---

## Known pitfalls

1. **Resend sandbox** — users will not receive OTPs if `EMAIL_FROM` is still `onboarding@resend.dev` and the recipient is not the Resend owner.
2. **Payment callback + localhost** — use a public HTTPS base for production payment callbacks.
3. **Hero images empty** — use `CatalogImage` + catalog-linked slides, not raw `<img>` / broken `src`.
4. **Admin session** requires TOTP-enabled admin user; env-only hash login still goes through the TOTP setup path in `api/admin/login`.
5. **Catalog without Mongo** silently shows mock data — easy to think a write “worked” locally.
6. **Password max 12** — easy to “fix” by raising it; that was an explicit product choice.
7. Do not reintroduce Bachs unless the product owner explicitly chooses it.
8. Promoting admin is CLI-only by design.

---

## Remaining / optional product work (as of last long session)

- Shorten member JWT `maxAge` (e.g. 24h / 7d remember) — user wanted to understand idle vs JWT first; idle is 30 min, JWT still 7/30 days.
- Welcome email on signup.
- Admin idle logout.
- Confirm production Resend domain + Vercel env for password reset.
- README is **stale** (still mentions mock-only structure and Paystack-era “step 3”); trust this handoff + `.env.example` over README.

---

## High-value file index

```
src/proxy.ts                          # Next 16 edge proxy + admin gate
src/app/layout.tsx                    # fonts, session, idle monitor
src/lib/db/mongodb.ts
src/lib/catalog/{index,db,types,image,paths,telegram}.ts
src/lib/auth/{session,users,idle,password-reset,google,types}.ts
src/lib/validation/password.ts
src/lib/payments/{paystack,fulfill,records,match,plans,app-url,amount}.ts
src/lib/payments/billing/{db,resolve,personal}.ts
src/lib/email/{resend,config,templates,payment-notifications}.ts
src/lib/admin/{session,gate,require,totp}.ts
src/components/access/DownloadPanel.tsx
src/components/home/FeaturedStrip.tsx
src/components/ui/CatalogImage.tsx
scripts/promote-admin.ts
.env.example
```

Self-checks live next to modules as `*.check.ts` (homepage, quality, billing resolve, payment match, totp, gate, security, timeAgo). Prefer adding one of those over a test framework.

---

## Suggested first message for the next agent

> Read `@AGENT_HANDOFF.md` and `.env.example`. Follow ponytail. Then: **[task]**.
>
> Do not expand scope. Trace the real callers before editing. Verify UI in the browser if you touch pages.
