# VMC production setup

Never put real credentials in this repository, tickets, screenshots, or chat messages. Store
them in Vercel Production Environment Variables instead.

## Required production variables

- `MONGODB_URI` and optional `MONGODB_DB_NAME`
- `AUTH_SECRET` - a unique random value with at least 32 characters
- `PAYSTACK_SECRET_KEY` - the live Paystack secret key only
- `PAYSTACK_RETURN_BASE_URL=https://www.vmcmovies.xyz`
- `NEXT_PUBLIC_APP_URL=https://www.vmcmovies.xyz`
- `NEXT_PUBLIC_TELEGRAM_BOT`

Set these when their features are enabled:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`
- `ADMIN_GATE` if the optional private admin-entry gate is used

## Provider setup

- Paystack webhook: `https://www.vmcmovies.xyz/api/payments/webhook`
- Google OAuth callback: `https://www.vmcmovies.xyz/api/auth/google/callback`
- Resend: verify the sending domain before using a public receipt address.
- Cloudinary: configure before uploading images from the production admin panel.

## If a secret was committed

1. Rotate the affected provider credential immediately.
2. Replace it in Vercel Production Environment Variables.
3. Redeploy the site.
4. Keep the repository private until the exposed history has been removed or the credentials are
   confirmed revoked. Removing a file in a new commit does not erase it from older commits.
