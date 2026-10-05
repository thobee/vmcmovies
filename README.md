# VMC Vintage Movie Channel

VMC is a movie and series catalog app built for a premium media experience. It combines a browsable storefront, user accounts, premium access flows, and admin tooling for managing catalog content, homepage sections, and access requests without exposing the app internals to the public.

## What the app does

- Browse a curated catalog of movies and TV series
- Search and view detail pages with metadata, art, and access status
- Support account signup, login, and profile management
- Offer premium access with secure checkout and account expiry tracking
- Gate downloadable content behind a premium flow
- Give admins a dashboard for catalog updates, homepage management, payments, and user oversight
- Support MongoDB-backed data with a fallback catalog when the database is unavailable

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- MongoDB for app data and user state
- Paystack for premium purchasing
- Telegram deep links for download access

## Project structure

```text
.
├── docs/                 # API and backend references
├── public/               # Static assets
├── scripts/              # Database and admin maintenance scripts
├── src/
│   ├── app/              # App Router pages and API routes
│   ├── components/       # Reusable UI and feature sections
│   ├── data/             # Seed and fallback catalog data
│   ├── lib/              # Business logic, validation, and data access
│   └── ...
├── .env.example          # Template environment variables
├── .gitignore            # Local-only config and AI/editor state
├── package.json          # Project scripts and dependencies
├── README.md             # Project overview
└── tsconfig.json
```

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment variables

The app expects local configuration in `.env.local`. Keep secrets out of git and never commit real credentials. The sample template in `.env.example` includes the required configuration keys for:

- MongoDB connection settings
- authentication secret
- payment keys
- Google auth configuration
- Telegram deep-link settings
- TMDB and media upload config

## Core routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage with featured content rails |
| `/movies` | Movie catalog |
| `/series` | Series catalog |
| `/movie/[slug]` | Movie details + premium access state |
| `/series/[slug]` | Series details + episode info |
| `/search` | Search page |
| `/signup` | New user signup |
| `/login` | User login |
| `/account` | User profile and premium status |
| `/get-access` | Premium purchase flow |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin authentication |

## Admin and content workflow

VMC includes an admin dashboard for:

- adding and editing movie and series data
- managing homepage content and featured items
- reviewing user accounts and premium status
- monitoring payments and support requests
- updating catalog metadata and download settings

## Notes

- This project is designed to use local environment values for dev work.
- Keep `.env.local`, database connection strings, and service secrets out of source control.
- The app gracefully falls back to local catalog data when the database is unavailable, but live user, admin, and payment features still require the configured services.
