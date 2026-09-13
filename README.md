# VMC — Vintage Movie Channel

Mobile-friendly movie & series catalog with **premium-gated Telegram downloads**.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **MongoDB Atlas** (step 2+) for users, content, access requests
- **Telegram bot deep links** for downloads

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TELEGRAM_BOT` | Bot username for `t.me/bot?start=...` links |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | Channel URL for join instructions |

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home + browse rails |
| `/movies` | Movie grid |
| `/series` | TV series grid |
| `/movie/[id]` | Movie detail + download panel |
| `/series/[id]` | Series detail + episode downloads |
| `/search` | Search catalog |
| `/get-access` | Premium pricing (step 3) |

## Project structure

```text
src/
├── app/
│   ├── movie/[id]/       # Movie detail
│   ├── series/[id]/      # Series detail
│   ├── movies/           # Browse movies
│   ├── series/           # Browse series
│   ├── get-access/       # Premium request
│   └── api/catalog/      # Search API
├── components/
│   ├── access/           # DownloadPanel
│   ├── home/             # Hero, ContentRail
│   └── media/            # MovieCard, grids
├── data/catalog/         # Mock catalog (step 1)
└── lib/catalog/          # Types + data access
```

## Build order

1. ✅ Content model + browse/detail (mock catalog)
2. ✅ Auth (signup/login, sessions, account page)
3. `/get-access` request flow + admin approval
4. Gate downloads on `premiumStatus`
5. Admin dashboard + expiry tracking

## Auth setup

Add to `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=vmcmovies
MONGODB_DB_NAME=vmc
AUTH_SECRET=your-secret-at-least-32-characters-long
```

Generate a secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Routes: `/signup`, `/login`, `/account`, `/api/auth/*`
