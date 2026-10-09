# Scaling check - 2026-10-08

## Verified

- Vercel production deployment `9WydrBgK1uvafht9YeC3iQVsikbJ` is Ready, from main commit `06a3fbc`, assigned to `www.vmcmovies.xyz`. This includes the earlier MongoDB pooling fix, not the uncommitted changes below.
- Read-only checks against the locally configured Atlas database succeeded. The queried server reported 7 current / 493 available connections, then 3 current / 497 available on a second check. These are per-server snapshots, not proof of sustained cluster-wide capacity or that the Atlas historical alert has cleared.
- Ping measurements: 138ms and 148ms from this computer. Catalogue contains 12 documents. ID/slug uniqueness, type/date, text-search and featured indexes are present.
- One MongoClient promise is reused per running application instance, including concurrent requests and module reloads. Pool maximum is 5 per server per instance; it is NOT a five-connection cap across all Vercel instances. Monitoring sockets also consume connections.

## Changes prepared locally

- Catalogue lists, featured content and normalized searches use Next's server Data Cache with a 30-second revalidation interval. Admin create/update/delete/feature actions immediately expire the shared catalogue tag.
- Detail reads, account sessions, payment checks and download authorization remain uncached. Revalidation can serve stale catalogue metadata briefly; authorization still checks current data.
- Rate limits share atomic MongoDB counters across instances. Keys are hashed and expired counters have a TTL index. Production fails closed if the counter store is unavailable. This adds a small database write per protected request; consider a dedicated Redis limiter if traffic makes that overhead significant.
- Database-free development uses bounded local counters. Login, signup, admin login, password reset, payments, title requests, support, trial activation and catalogue search await the shared limiter.
- Search outages return 503, not a misleading successful empty result. Search throttling includes a one-minute message and Retry-After header.
- Concurrent catalogue requests share index initialization work.
- Next server errors emit structured `[server-error]` log events containing route templates, method, error digest and timestamp. This hook deliberately excludes headers, query strings, bodies and raw error messages. Existing application logs still require normal access controls.

## Checks

Run from the repository root:

```text
node scripts/check-database-health.cjs
node scripts/test-mongodb-pooling.cjs
node scripts/test-rate-limit.cjs
node scripts/test-catalog-cache.cjs
node scripts/test-catalog-downloads.cjs
node scripts/test-local-load.cjs
npx tsc --noEmit
```

The health check is read-only and closes its client. Other tests use mocks/local data, not production account/payment mutations. The load script owns a temporary server on 127.0.0.1:3101, disables MongoDB access, uses a separate build directory and stops that server on completion. Do not point it at production.

Local development smoke results: 45 search requests at concurrency 4 produced 40 successful responses and 5 expected 429s. Successful response p50 was 296ms and p95 was 620ms, excluding initial compilation. Ten invalid login submissions produced 8 expected 400s and 2 expected 429s. These are NOT production performance or user-capacity estimates. Shared limiter tests simulate 100 concurrent requests across two independent instances; they are not an Atlas load test.

## Remaining operational work

1. Review and deploy these local changes, then smoke-test the production search and normal signed-in download flow. No new credentials are needed for caching or the MongoDB-backed limiter. The application database role must allow its rate_limits collection and TTL index, like the existing content indexes.
2. Inspect Atlas connection graphs across all nodes over a busy period. The browser dashboard timed out during this audit; direct database checks succeeded. Suggested warning: sustained usage above 70% of the node limit, critical above 85%. Also investigate timeouts, rising query latency and pool wait failures. Choose alert settings supported by the current Atlas tier.
3. Review Vercel Runtime Logs and Observability after deployment, especially `[server-error]`, `[catalog/search]`, MongoDB timeouts and payment-webhook errors. Investigate sustained 5xx rates above 1%, while distinguishing expected 400/401/429 responses. These are suggested starting thresholds, not alerts configured by this change.
4. Speed Insights was Not Enabled in Vercel. Real-user performance monitoring and automatic notifications are not configured by this audit. Enabling it requires the Vercel setting and the Speed Insights SDK; review privacy and plan allowances before enabling telemetry. See https://vercel.com/docs/speed-insights/quickstart.
5. The team is on Hobby. Vercel restricts Hobby to non-commercial personal use; a paid subscription service needs an appropriate commercial hosting plan. No plan or billing changes were made. See https://vercel.com/docs/plans/hobby.
6. On a suitable commercial plan, set a user-approved spending budget/alerts and review compute, transfer, image transformations and database usage. No automatic monitoring job or paid services were started.
7. Before a larger campaign, load-test a staging deployment with a separate database and representative catalogue size. Measure throughput, p95/p99 latency, errors and database connections while gradually increasing concurrency. Expand capacity based on those results, not registered-user totals alone.

The cache and rate limiter reduce avoidable work but do not provide unlimited capacity. Vercel handles infrastructure traffic distribution; an additional custom load balancer is not the immediate priority.
