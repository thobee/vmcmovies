/** VMC transactional email HTML — table layout + inline styles for client support. */

const C = {
  bg: "#0e1116",
  card: "#1c2128",
  cardBorder: "#2a3340",
  inset: "#14171c",
  insetBorder: "#232b36",
  gold: "#f5c518",
  goldDim: "#c9a012",
  goldSoft: "rgba(245,197,24,0.12)",
  text: "#dde6ed",
  textDim: "#9db2bf",
  textMuted: "#6b7a89",
  blue: "#5b8def",
  blueSoft: "rgba(91,141,239,0.12)",
  success: "#3ecf8e",
  successSoft: "rgba(62,207,142,0.12)",
  divider: "#2a3340",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function greetingFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  const name = local.replace(/[._-]/g, " ").split(/\s+/)[0];
  if (!name) return "there";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function emailShell(input: {
  preheader: string;
  title: string;
  body: string;
  footer?: string;
}): string {
  const preheader = escapeHtml(input.preheader);
  const title = escapeHtml(input.title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 24px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:10px 20px;border:1px solid ${C.cardBorder};border-radius:12px;background-color:${C.inset};">
                    <span style="font-size:24px;font-weight:800;letter-spacing:0.22em;color:${C.gold};">VMC</span>
                  </td>
                </tr>
              </table>
              <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:${C.textMuted};margin-top:12px;">Vintage Movie Channel</div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:${C.card};border:1px solid ${C.cardBorder};border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.35);">
              <div style="height:3px;background:linear-gradient(90deg,${C.goldDim},${C.gold},${C.goldDim});"></div>
              <div style="padding:36px 32px;">
                ${input.body}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:28px 12px 0;text-align:center;font-size:11px;line-height:1.7;color:${C.textMuted};">
              ${input.footer ?? `© ${new Date().getFullYear()} Vintage Movie Channel. All rights reserved.`}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="border-top:1px solid ${C.divider};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function sectionTitle(title: string, subtitle?: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.gold};margin-bottom:6px;">${escapeHtml(title)}</div>
          ${subtitle ? `<div style="font-size:13px;color:${C.textMuted};line-height:1.5;">${escapeHtml(subtitle)}</div>` : ""}
        </td>
      </tr>
    </table>`;
}

function statusBadge(label: string, tone: "success" | "info" = "success"): string {
  const bg = tone === "success" ? C.successSoft : C.blueSoft;
  const color = tone === "success" ? C.success : C.blue;
  return `<span style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:${bg};font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${color};">${escapeHtml(label)}</span>`;
}

function detailTable(rows: { label: string; value: string; mono?: boolean }[]): string {
  const items = rows
    .map((row, i) => {
      const border =
        i < rows.length - 1
          ? `border-bottom:1px solid ${C.insetBorder};`
          : "";
      const valueStyle = row.mono
        ? `font-family:Consolas,'Courier New',monospace;font-size:12px;word-break:break-all;`
        : "";
      return `
      <tr>
        <td style="padding:14px 0;${border}font-size:12px;color:${C.textMuted};width:36%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:14px 0;${border}font-size:14px;color:${C.text};font-weight:600;vertical-align:top;${valueStyle}">${escapeHtml(row.value)}</td>
      </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.inset};border:1px solid ${C.insetBorder};border-radius:12px;">
      <tr>
        <td style="padding:2px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${items}
          </table>
        </td>
      </tr>
    </table>`;
}

function stepsList(steps: { title: string; body: string }[]): string {
  const items = steps
    .map(
      (step, i) => `
      <tr>
        <td style="padding:0 0 ${i < steps.length - 1 ? "16" : "0"}px 0;vertical-align:top;width:32px;">
          <div style="width:24px;height:24px;border-radius:50%;background-color:${C.goldSoft};color:${C.gold};font-size:12px;font-weight:700;line-height:24px;text-align:center;">${i + 1}</div>
        </td>
        <td style="padding:0 0 ${i < steps.length - 1 ? "16" : "0"}px 12px;vertical-align:top;">
          <div style="font-size:14px;font-weight:600;color:${C.text};margin-bottom:3px;">${escapeHtml(step.title)}</div>
          <div style="font-size:13px;line-height:1.55;color:${C.textDim};">${step.body}</div>
        </td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${items}
    </table>`;
}

function primaryButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="border-radius:10px;background-color:${C.gold};">
          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#111111;text-decoration:none;letter-spacing:0.02em;">${safeLabel}</a>
        </td>
      </tr>
    </table>`;
}

function secondaryLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" target="_blank" style="font-size:13px;font-weight:600;color:${C.blue};text-decoration:none;">${escapeHtml(label)} →</a>`;
}

function calloutBox(html: string, tone: "gold" | "blue" = "gold"): string {
  const border = tone === "gold" ? C.goldDim : C.blue;
  const bg = tone === "gold" ? C.goldSoft : C.blueSoft;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="padding:16px 18px;border-left:3px solid ${border};background-color:${bg};border-radius:0 10px 10px 0;">
          <div style="font-size:13px;line-height:1.6;color:${C.textDim};">${html}</div>
        </td>
      </tr>
    </table>`;
}

export function userReceiptEmail(input: {
  userEmail: string;
  planName: string;
  amount: string;
  expiry: string;
  paidAt: string;
  reference: string;
  appUrl: string;
  telegramBotUrl: string;
  telegramChannelUrl: string;
}): string {
  const name = greetingFromEmail(input.userEmail);
  const moviesUrl = `${input.appUrl}/movies`;
  const accountUrl = `${input.appUrl}/account`;
  const supportUrl = `${input.appUrl}/support`;

  const body = `
    <!-- Hero -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:8px;">${statusBadge("Payment confirmed")}</td>
      </tr>
      <tr>
        <td style="font-size:26px;font-weight:700;color:${C.text};line-height:1.3;padding:8px 0 6px;">
          Welcome to VMC Premium
        </td>
      </tr>
      <tr>
        <td style="font-size:15px;line-height:1.65;color:${C.textDim};">
          Hi ${escapeHtml(name)}, thank you for your purchase. Your subscription is now active and all premium downloads are unlocked.
        </td>
      </tr>
    </table>

    ${divider()}

    ${sectionTitle("Order summary", "Please keep this email for your records.")}
    ${detailTable([
      { label: "Subscription", value: input.planName },
      { label: "Amount paid", value: input.amount },
      { label: "Payment date", value: input.paidAt },
      { label: "Valid until", value: input.expiry },
      { label: "Reference", value: input.reference, mono: true },
    ])}

    ${divider()}

    ${sectionTitle("Getting started", "Follow these steps to start downloading.")}
    ${stepsList([
      {
        title: "Browse the catalogue",
        body: `Explore our full library of movies and series on <a href="${escapeHtml(moviesUrl)}" style="color:${C.blue};text-decoration:none;">vmc</a>.`,
      },
      {
        title: "Open a title and tap Download",
        body: "On any movie or episode page, use the download button to get your file via Telegram.",
      },
      {
        title: "Start the Telegram bot",
        body: `First time? Open <a href="${escapeHtml(input.telegramBotUrl)}" style="color:${C.blue};text-decoration:none;">@${escapeHtml(input.telegramBotUrl.split("/").pop() ?? "vmcmovies_bot")}</a> and tap <strong style="color:${C.text};">Start</strong> so deliveries reach you.`,
      },
      {
        title: "Join our channel",
        body: `Stay updated on new releases — <a href="${escapeHtml(input.telegramChannelUrl)}" style="color:${C.blue};text-decoration:none;">join the VMC channel</a>.`,
      },
    ])}

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
      <tr>
        <td style="padding-right:12px;">${primaryButton(moviesUrl, "Start watching")}</td>
      </tr>
      <tr>
        <td style="padding-top:14px;">${secondaryLink(accountUrl, "View your account")}</td>
      </tr>
    </table>

    ${calloutBox(
      `Your premium access expires on <strong style="color:${C.text};">${escapeHtml(input.expiry)}</strong>. Renew before then to keep uninterrupted access to downloads.`,
      "gold"
    )}

    ${divider()}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;line-height:1.65;color:${C.textMuted};">
          Need help with a download or payment? Our support team is here for you —
          ${secondaryLink(supportUrl, "Contact support")}
        </td>
      </tr>
    </table>`;

  return emailShell({
    preheader: `Payment confirmed — your VMC Premium access is active until ${input.expiry}.`,
    title: "VMC Premium — Payment confirmed",
    body,
    footer: `
      This is a transactional email sent to ${escapeHtml(input.userEmail)}.<br/>
      If you did not make this purchase, please <a href="${escapeHtml(supportUrl)}" style="color:${C.textMuted};text-decoration:underline;">contact us immediately</a>.<br/><br/>
      <a href="${escapeHtml(input.appUrl)}" style="color:${C.textMuted};text-decoration:underline;">vmc</a> · Vintage Movie Channel`,
  });
}

export function adminPaymentAlertEmail(input: {
  userEmail: string;
  telegram: string;
  planName: string;
  amount: string;
  reference: string;
  expiry: string;
  paidAt: string;
  appUrl: string;
}): string {
  const adminUrl = `${input.appUrl}/admin/payments`;
  const telegramHandle = input.telegram.replace(/^@/, "");

  const body = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding-bottom:8px;">${statusBadge("New subscriber", "info")}</td>
    </tr>
    <tr>
      <td style="font-size:26px;font-weight:700;color:${C.text};line-height:1.3;padding:4px 0;">
        ${escapeHtml(input.amount)} <span style="font-size:16px;font-weight:500;color:${C.textDim};">received</span>
      </td>
    </tr>
    <tr>
      <td style="font-size:14px;line-height:1.6;color:${C.textDim};">
        A new premium subscription was successfully processed. Review the details below.
      </td>
    </tr>
  </table>

  ${divider()}

  ${sectionTitle("Customer")}
  ${detailTable([
    { label: "Email", value: input.userEmail },
    { label: "Telegram", value: telegramHandle === "—" ? "Not provided" : `@${telegramHandle}` },
  ])}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td>${sectionTitle("Transaction")}</td></tr>
    <tr><td>
      ${detailTable([
        { label: "Plan", value: input.planName },
        { label: "Amount", value: input.amount },
        { label: "Paid at", value: input.paidAt },
        { label: "Premium until", value: input.expiry },
        { label: "Payment ref", value: input.reference, mono: true },
      ])}
    </td></tr>
  </table>

  ${calloutBox(
    `Premium has been activated automatically. The subscriber should receive a confirmation email with download instructions. If they report issues, check their payment status in the admin panel.`,
    "blue"
  )}

  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr>
      <td>${primaryButton(adminUrl, "Open payments dashboard")}</td>
    </tr>
  </table>`;

  return emailShell({
    preheader: `New payment: ${input.userEmail} · ${input.amount} · ${input.planName}`,
    title: "VMC Admin — New payment",
    body,
    footer: `
      Internal admin notification · ${escapeHtml(new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }))}<br/>
      <a href="${escapeHtml(adminUrl)}" style="color:${C.textMuted};text-decoration:underline;">Admin payments</a>`,
  });
}

export function adminResetOtpEmail(otp: string): string {
  const digits = escapeHtml(otp);
  const body = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:22px;font-weight:700;color:#fff;padding-bottom:8px;">Reset your admin password</td>
    </tr>
    <tr>
      <td style="font-size:14px;line-height:1.6;color:${C.textDim};">
        Use this code in the admin console. It expires in 10 minutes. If you didn’t ask for a reset, ignore this email.
      </td>
    </tr>
  </table>
  ${divider()}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 20px;">
        <div style="display:inline-block;letter-spacing:0.35em;font-size:28px;font-weight:800;color:#fff;background:${C.inset};border:1px solid ${C.insetBorder};border-radius:12px;padding:16px 28px 16px 36px;">
          ${digits}
        </div>
      </td>
    </tr>
  </table>
  ${calloutBox("Never share this code. VMC staff will never ask you for it.", "blue")}`;

  return emailShell({
    preheader: "Your VMC admin password reset code",
    title: "VMC Admin — Password reset",
    body,
  });
}

export function userResetOtpEmail(otp: string): string {
  const digits = escapeHtml(otp);
  const body = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:22px;font-weight:700;color:#fff;padding-bottom:8px;">Reset your password</td>
    </tr>
    <tr>
      <td style="font-size:14px;line-height:1.6;color:${C.textDim};">
        Use this code on the VMC site. It expires in 10 minutes. If you didn’t ask for a reset, ignore this email.
      </td>
    </tr>
  </table>
  ${divider()}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 20px;">
        <div style="display:inline-block;letter-spacing:0.35em;font-size:28px;font-weight:800;color:#fff;background:${C.inset};border:1px solid ${C.insetBorder};border-radius:12px;padding:16px 28px 16px 36px;">
          ${digits}
        </div>
      </td>
    </tr>
  </table>
  ${calloutBox("Never share this code. VMC staff will never ask you for it.", "blue")}`;

  return emailShell({
    preheader: "Your VMC password reset code",
    title: "VMC — Password reset",
    body,
  });
}

