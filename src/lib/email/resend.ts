import { getEmailFrom, getResendApiKey } from "./config";

export type SendEmailResult = { ok: true } | { ok: false; detail: string };

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return { ok: false, detail: "RESEND_API_KEY is not set" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
    return { ok: false, detail: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }

  const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;
  console.log("[email] sent:", input.subject, "→", to);
  return { ok: true };
}
