import { getEmailFrom, getResendApiKey } from "./config";

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return false;
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
    return false;
  }

  const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;
  console.log("[email] sent:", input.subject, "→", to);
  return true;
}
