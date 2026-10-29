# Reminders

Things decided for now that are worth revisiting later.

## Homepage "Top 10" row ranking (added 2026-10-29)

The homepage "Top Rated Films" row (`src/app/page.tsx`, `topTen`) shows a Top 10 with rank numbers, **ranked by TMDB/admin rating** (`sortByRating`), because VMC does not track views or downloads yet. The row is labelled "Top 10 by rating" so it doesn't claim to be "this week".

When you want a real "Top 10 this week":

1. Record an event per download request (e.g. a `downloads` collection: `contentId`, `userId`, `createdAt`), written where the Telegram deep link is issued.
2. Aggregate the last 7 days by `contentId`, cached like the homepage catalog (revalidate tag).
3. Swap `topTen` in `src/app/page.tsx` to use that list, fall back to rating when there isn't enough data, and change the subtitle in `ContentRail` (`ranked` mode) to "Top 10 this week".
