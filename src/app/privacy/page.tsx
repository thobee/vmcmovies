import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — VMC",
  description: "How VMC collects, uses, and protects your data.",
};

const LAST_UPDATED = "9 October 2026";

export default function PrivacyPage() {
  return (
    <SitePage>
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Legal</p>
          <h1
            className="mt-3 text-[1.9rem] font-bold leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-white/45">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-8 text-[15px] leading-7 text-white/70">
            <Section title="1. What we collect">
              When you create an account, we store your email address, Telegram username, and a
              securely hashed password (never the plain-text password). When you subscribe to
              Premium, we store the plan, amount, payment reference, and status of each
              transaction. We do not store your card or bank details — those are handled by our
              payment provider. Support messages you send (including username and optional payment
              reference) are also stored so we can respond.
            </Section>

            <Section title="2. How we use your data">
              Your data is used to authenticate you, track Premium status and expiry, process and
              verify payments, deliver download links via Telegram, and respond to support
              requests. We do not sell your personal data to third parties.
            </Section>

            <Section title="3. Cookies & local storage">
              VMC uses essential HTTP-only cookies to keep members and administrators signed in.
              If the optional admin gate is enabled, it also stores a short-lived essential cookie
              after the correct private access link is used. We store a Telegram setup preference
              in your browser&apos;s local storage so the download guide can be shown again when you
              ask for it. These are functional settings, not advertising or analytics trackers.
            </Section>

            <Section title="4. Third parties">
              We share the minimum data necessary with our payment provider (to process payments),
              email delivery (for receipts and alerts), and Telegram (to deliver downloads to
              Premium members via a bot, which receives the content you requested — not your full
              account profile).
            </Section>

            <Section title="5. Data retention">
              Account and payment records are kept for as long as your account is active, and for
              a reasonable period afterward for accounting and fraud-prevention purposes.
            </Section>

            <Section title="6. Your rights">
              You may request a copy of your data or ask us to delete your account through{" "}
              <Link href="/support" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Support
              </Link>
              . Some payment records may be retained where required by law.
            </Section>

            <Section title="7. Security">
              Passwords are hashed, sessions are signed and HTTP-only, and payment verification
              happens server-to-server with our payment provider — your payment details never pass
              through our servers as card numbers.
            </Section>

            <Section title="8. Changes to this policy">
              We may update this policy as the service evolves. Material changes will be reflected
              here with an updated date.
            </Section>

            <Section title="9. Contact">
              Privacy questions can be sent through{" "}
              <Link href="/support" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Support
              </Link>
              .
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-white">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
