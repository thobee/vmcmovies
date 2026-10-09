const developmentEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const contentSecurityPolicy = `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${developmentEval}; connect-src 'self' https:; form-action 'self' https://checkout.paystack.com; upgrade-insecure-requests`;

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

export const ADMIN_SECURITY_HEADERS: { key: string; value: string }[] = [
  ...SECURITY_HEADERS,
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "no-store" },
];

export const HSTS = {
  key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains",
};

export function applySecurityHeaders(
  headers: Headers,
  opts: { admin?: boolean; https?: boolean } = {},
) {
  const list = opts.admin ? ADMIN_SECURITY_HEADERS : SECURITY_HEADERS;
  for (const { key, value } of list) headers.set(key, value);
  if (opts.https) headers.set(HSTS.key, HSTS.value);
}
