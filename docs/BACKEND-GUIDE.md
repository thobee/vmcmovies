# VMC Backend Guide

> **⚠️ Contains real credentials.** You said you'd delete this file before it sits in git long-term — do that once you've noted everything down, or at minimum rotate every secret below before making the repo public. Anyone with read access to this file can log into your admin panel, your database, and your Paystack account.

This is the companion to `docs/API.md`. It covers everything backend/infra: where secrets live, how to change them, and how to fix the things that commonly break.

**Rotation status:** `AUTH_SECRET` and the admin password were rotated. User login needs Mongo running — use `npm run mongo:local` until Atlas is fixed (see §3).

Current demo user (local Mongo, for testing login):

- **Email:** `demo@vmc.com`
- **Password:** `DemoPass123!`

---

## 1. Where configuration lives

Every secret is read from environment variables, loaded from `.env.local` (gitignored, never committed) via Next.js. `.env.example` documents every key with blank/placeholder values.

| File | Purpose | Committed? |
|---|---|---|
| `.env.local` | Real secrets for your machine | No (gitignored) |
| `.env.example` | Template, no real values | Yes |

To change any credential: edit `.env.local`, then restart `npm run dev` (env vars are only read at process start).

---

## 2. Admin panel login

Paths: `/admin/login` · `/admin/signup` (first admin only)

Admin accounts live in **MongoDB** (`users` collection, `role: "admin"`). Public users sign up at `/signup` (`role: "user"`).

`/admin/signup` works **once**. After any admin exists, the API returns 403 and the page only links to login. Extra staff accounts are not created through this route.

### Create the first admin

1. Open **http://localhost:3000/admin/signup** while no admin exists yet
2. Email + password (min 8 chars)
3. Lands on `/admin` dashboard

### Sign in

**http://localhost:3000/admin/login** — Mongo admin email/password from signup above.

### Legacy env bootstrap (optional)

If no Mongo admin exists, `/admin/login` still accepts `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` once — it creates the Mongo admin on first successful login.

```
ADMIN_EMAIL=admin@vmc.com
ADMIN_PASSWORD_HASH="$2b$12$snouzNNF/9peVHFzyMvUdecvSFSbIuK3rQDiESTrfnNH2v8eN6ye2"
```

**Windows:** wrap `ADMIN_PASSWORD_HASH` in double quotes.

### How admin sessions work

`src/lib/admin/session.ts` signs a JWT (using `jose`) with the `AUTH_SECRET` env var, prefixed `admin:` so it can never be confused with a regular user session token. It's stored in an HTTP-only cookie. Logging out (`/api/admin/logout`) just clears the cookie.

---

## 3. Database — MongoDB

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?appName=vmc
MONGODB_DB_NAME=vmc
```

Keep the real URI in `.env.local` only — never commit it.

### Local Mongo (only if Atlas is down)

1. In a second terminal: `npm run mongo:local`
2. Temporarily set `MONGODB_URI=mongodb://127.0.0.1:27017` in `.env.local`
3. Restart `npm run dev`

### How to change the Atlas password later

1. [Atlas](https://cloud.mongodb.com) → **Database Access** → edit your database user password.
2. Update `MONGODB_URI` in `.env.local` (avoid `@ : / ? #` in the password).
3. Restart `npm run dev`.

### Fallback behavior

If `MONGODB_URI` is missing or unreachable, `src/lib/catalog/index.ts` automatically falls back to in-memory mock data (`src/lib/catalog/mock.ts`) so the site still runs and looks populated. Real users, payments, and admin-created content all require Mongo to actually work — the fallback is browse-only.

---

## 4. Payments — Paystack

```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxx
```

These are **test-mode** keys (`sk_test_` / `pk_test_` prefixes) — no real money moves. Get your live keys from [Paystack Dashboard → Settings → API Keys & Webhooks](https://dashboard.paystack.com/#/settings/developer) when you're ready to accept real payments, and:

1. Replace both keys in `.env.local` (and in your Vercel project env vars once deployed).
2. In the Paystack dashboard, set the webhook URL to `https://yourdomain.com/api/payments/webhook`.
3. Test with a real low-value transaction before announcing publicly.

Plans and pricing live in `src/lib/payments/plans.ts` — edit the `amountKobo` and `months` there if you want to change pricing (amounts are in **kobo**, so ₦700 = `70000`).

---

## 5. TMDB helper (admin panel autofill)

```
TMDB_API_KEY=
```

Used by the "Fill from TMDB" box on the **Add Movie** / **Add Series** admin pages — search a title, pick the right result, and it autofills description, poster, backdrop, genres, year, rating and runtime for you.

### How to get a key (free, instant)

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** → request a **Developer** key (personal/hobby use is fine).
3. Copy the **API Key (v3 auth)** value (not the "Read Access Token").
4. Paste it into `TMDB_API_KEY` in `.env.local` and restart `npm run dev`.

Without this key set, the admin forms still work fully — you just won't see the TMDB search box (it fails gracefully with a 503 if you try to hit the endpoint directly).

---

## 6. Cloudinary (admin image uploads)

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=vmc
```

Poster/backdrop uploads from the admin panel go to **Cloudinary** when these three vars are set. Mongo stores the returned `https://res.cloudinary.com/...` URL — nothing is written to your app server disk.

**Why not `public/uploads/` in production?** On Vercel (and most serverless hosts) the filesystem is ephemeral and tiny. Local files disappear on redeploy, aren't on a CDN, and every image byte hits your app. Cloudinary gives you a CDN, automatic WebP/resize, and a generous free tier.

- **Dev without Cloudinary:** uploads fall back to `public/uploads/` (fine locally).
- **Production:** Cloudinary is required — upload returns 503 with a clear message if keys are missing.

Get keys from [console.cloudinary.com](https://console.cloudinary.com) → **Settings → API Keys**. Add the same vars to Vercel project settings before go-live.

---

## 7. Session secret

```
AUTH_SECRET=replace-with-a-long-random-string-at-least-32-chars
```

*(Rotated as of this update — every previously logged-in user/admin was signed out by this change, which is expected.)*

Used to sign **both** user sessions and admin sessions (with different cookie prefixes). If you rotate this, every logged-in user and admin is logged out immediately — that's expected and safe to do any time. Generate a new one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 8. Telegram bot (not built yet)

```
NEXT_PUBLIC_TELEGRAM_BOT=VmcfileBot
NEXT_PUBLIC_TELEGRAM_CHANNEL=https://t.me/+mwgLjKLBwYZkZmY0
```

These control deep links on download buttons:

| Series season | Your link (paste in admin) | Whatever you set in **Telegram bot link** per season |

**Movies:** one button → your movie bot link.

**Series:** you create each season link in Telegram, paste it in admin under **Telegram bot link**. The site shows **Season 1**, **Season 2**, etc. — no auto-generated URLs. Episodes inside a season are handled in the bot.

---

## 9. Quick reference — restart checklist after any env change

```bash
# stop the dev server (Ctrl+C), then:
npm run dev
```

Next.js only reads `.env.local` on process start, so edits won't take effect in a running server.
