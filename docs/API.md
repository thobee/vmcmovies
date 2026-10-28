# VMC — Routes & API Reference

Base URL: `http://localhost:3000` (dev) or your production domain.

---

## Public pages

| Path | Method | Description |
|------|--------|-------------|
| `/` | GET | Homepage — featured hero, content rails (trending, TV, genres). |
| `/movies` | GET | Movie catalog grid. |
| `/series` | GET | Series catalog grid. |
| `/tv` | GET | Redirects to `/series`. |
| `/movie/[id]` | GET | Movie detail — poster, metadata, download panel (premium-gated). |
| `/series/[id]` | GET | Series detail — metadata + episode list with download links. |
| `/search` | GET | Search page. Query param `?q=` filters catalog. |
| `/login` | GET | User login form. |
| `/signup` | GET | User registration form. |
| `/account` | GET | Protected user profile — email, Telegram, premium status, expiry. |
| `/get-access` | GET | Premium pricing grid + Bachs checkout (login required to pay). |
| `/payment/callback` | GET | Post-Bachs redirect — verifies payment, shows success/failure. |

---

## Admin pages

Admin auth is separate from user accounts. Login at `/admin/login`.

| Path | Method | Description |
|------|--------|-------------|
| `/admin/login` | GET | Admin sign-in (env-based email + password hash). |
| `/admin` | GET | Dashboard — title counts, quick actions. |
| `/admin/movies` | GET | List all movies — edit, delete, set featured. |
| `/admin/movies/new` | GET | Create movie form. |
| `/admin/movies/[id]/edit` | GET | Edit existing movie. |
| `/admin/series` | GET | List all series. |
| `/admin/series/new` | GET | Create series form with episode editor. |
| `/admin/series/[id]/edit` | GET | Edit series and episodes. |
| `/admin/homepage` | GET | Homepage hero slides and section titles. |
| `/admin/users` | GET | Registered users + subscription alerts. |
| `/admin/payments` | GET | Bachs payments, revenue, and activation status. |
| `/admin/support` | GET | Support tickets. |

---

## User auth API

Session cookie: `vmc_session` (HTTP-only, 7 days).

### `POST /api/auth/signup`

Create account and log in.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "min-8-chars",
  "telegramUsername": "username"
}
```

**Success `200`:**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "telegramUsername": "username",
    "premiumStatus": "none",
    "premiumExpiryDate": null
  }
}
```

**Errors:** `400` invalid input · `409` email exists · `503` MongoDB not configured

---

### `POST /api/auth/login`

**Body:**
```json
{ "email": "user@example.com", "password": "..." }
```

**Success `200`:** `{ "user": { ... } }`  
**Errors:** `401` invalid credentials

---

### `POST /api/auth/logout`

Clears session cookie. **Success `200`:** `{ "ok": true }`

---

### `GET /api/auth/me`

Returns current user or null.

**Success `200`:** `{ "user": { ... } | null }`

---

## Payments API (Bachs)

Requires logged-in user session.

### `POST /api/payments/initialize`

Start a hosted Bachs checkout.

**Body:**
```json
{ "planId": "monthly" | "quarterly" | "biannual" | "yearly" }
```

**Plans:** Prices are resolved on the server from **Admin → Billing** at checkout. Do not
hardcode a price in a client, bot, or external integration. The available plan IDs are:

| planId | Duration |
|--------|----------|
| `monthly` | 1 month |
| `quarterly` | 3 months |
| `biannual` | 6 months |
| `yearly` | 12 months |

**Success `200`:**
```json
{
  "authorizationUrl": "https://checkout.bachs.io/...",
  "reference": "vmc_..."
}
```

**Errors:** `401` not logged in · `400` invalid plan

---

### `GET /api/payments/verify?reference=vmc_...`

Verify payment after the Bachs redirect (also used by the callback page). Bachs redirects with
`checkout_id`; the endpoint also accepts VMC's internal `reference` for support and recovery.

**Success `200`:**
```json
{
  "status": "success",
  "alreadyFulfilled": false,
  "reference": "vmc_...",
  "expiryDate": "2026-09-12T00:00:00.000Z"
}
```

**Errors:** `400` failed verification · `401` unauthorized · `404` payment not found

---

### `POST /api/payments/webhook`

Bachs server webhook. Fulfilment events: `checkout.completed` and `collection.succeeded`.

**Headers:** `x-bachs-signature-v2` (preferred) or `x-bachs-timestamp` plus
`x-bachs-signature`. Signatures are HMAC SHA-256 over `{timestamp}.{raw_body}`.

**Success `200`:** `{ "received": true }`

Configure in the Bachs developer portal:
```
https://your-domain.com/api/payments/webhook
```

---

## Catalog API

### `GET /api/catalog/search?q=batman`

Public search endpoint.

**Success `200`:**
```json
{
  "items": [
    {
      "id": "tt0468569",
      "type": "movie",
      "title": "The Dark Knight",
      "posterImageUrl": "...",
      "genres": ["Action", "Crime"],
      ...
    }
  ]
}
```

---

## Admin API

Session cookie: `vmc_admin_session` (HTTP-only, 12 hours).

### `POST /api/admin/login`

**Body:**
```json
{ "email": "admin@vmc.com", "password": "..." }
```

**Success `200`:** `{ "ok": true, "email": "admin@vmc.com" }`  
**Errors:** `401` invalid · `503` admin not configured

---

### `POST /api/admin/logout`

**Success `200`:** `{ "ok": true }`

---

### `GET /api/admin/me`

**Success `200`:** `{ "admin": { "email": "..." } | null }`

---

### `GET /api/admin/content`

List catalog items. Requires admin session.

**Query:** `?type=movie` or `?type=series` (optional filter)

**Success `200`:** `{ "items": [ ...Content ] }`

---

### `POST /api/admin/content`

Create movie or series.

**Body (movie):**
```json
{
  "type": "movie",
  "id": "tt0468569",
  "title": "The Dark Knight",
  "description": "...",
  "posterImageUrl": "https://...",
  "backdropImageUrl": "https://...",
  "genres": ["Action", "Crime"],
  "year": "2008",
  "rating": "9.0",
  "runtime": "152 min",
  "downloadUrl": "https://t.me/bot?start=tt0468569",
  "featured": false
}
```

**Body (series):** same fields + `"episodes": [{ "id", "seriesId", "seasonNumber", "episodeNumber", "title", "downloadUrl" }]`

**Success `201`:** `{ "item": { ... } }`

---

### `GET /api/admin/content/[id]`

**Success `200`:** `{ "item": { ... } }` · **404** not found

---

### `PUT /api/admin/content/[id]`

Update item. ID cannot change.

**Success `200`:** `{ "item": { ... } }`

---

### `DELETE /api/admin/content/[id]`

**Success `200`:** `{ "ok": true }`

---

### `PATCH /api/admin/content/[id]`

**Body:** `{ "action": "featured" }` — sets homepage featured title.

**Success `200`:** `{ "ok": true }`

---

### `GET /api/admin/tmdb?type=movie&q=batman`

Search TMDB by title. Requires admin session and `TMDB_API_KEY`. Returns `503` if the key isn't configured.

**Response `200`:**
```json
{ "results": [{ "tmdbId": 268, "title": "Batman", "year": "1989", "posterImageUrl": "https://..." }] }
```

### `GET /api/admin/tmdb?type=movie&tmdbId=268`

Fetch full details for a specific TMDB result, mapped to the admin form's fields (title, description, poster/backdrop, genres, year, rating, runtime, and a suggested `id` using the IMDb id when available).

**Response `200`:**
```json
{ "details": { "id": "tt0096895", "title": "Batman", "description": "...", "genres": ["Action", "Crime"], "year": "1989", "rating": "7.5", "runtime": "126 min" } }
```

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `vmc`) |
| `AUTH_SECRET` | Session signing (32+ chars) |
| `TMDB_API_KEY` | Enables the "Fill from TMDB" search box in the admin panel |
| `ADMIN_EMAIL` | Admin panel login email |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash — `npm run admin:hash-password` |
| `BACHS_API_KEY` | Bachs sandbox or live secret key |
| `BACHS_WEBHOOK_SECRET` | Bachs webhook signing secret |
| `PAYMENT_RETURN_BASE_URL` | Public app URL for payment callbacks |
| `NEXT_PUBLIC_APP_URL` | Public app URL used by the rest of VMC |
| `NEXT_PUBLIC_TELEGRAM_BOT` | Bot username for download links |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | Telegram channel URL |

---

## Data collections (MongoDB)

| Collection | Purpose |
|------------|---------|
| `users` | Registered users, premium status, expiry |
| `payments` | Provider-neutral payment records (including historical Paystack rows) |
| `content` | Movies, series, episodes |

---

## Premium flow

```
Browse (free) → Sign up → Get Access → Bachs → /payment/callback
  → verify API → activatePremium() → download links unlock
```

Signed Bachs webhooks act as the source-of-truth backup if callback verification fails.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Seed sample catalog into MongoDB |
| `npm run admin:hash-password -- <password>` | Generate `ADMIN_PASSWORD_HASH` |
