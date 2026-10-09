import type { Metadata } from "next";
import Link from "next/link";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — VMC",
  description: "The terms that govern your use of VMC.",
};

const LAST_UPDATED = "9 October 2026";

export default function TermsPage() {
  return (
    <SitePage>
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Legal</p>
          <h1
            className="mt-3 text-[1.9rem] font-bold leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-white/45">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-8 text-[15px] leading-7 text-white/70">
            <Section title="1. Acceptance of terms">
              By creating an account or browsing VMC (Vintage Movie Channel), you agree to these
              Terms of Service. If you do not agree, please do not use the service.
            </Section>

            <Section title="2. What VMC provides">
              VMC lets you browse a catalog of movies and series free of charge. Downloading a
              title requires an active Premium subscription and is fulfilled through a linked
              Telegram bot, not through this website directly.
            </Section>

            <Section title="3. Accounts">
              You are responsible for keeping your account credentials secure and for all
              activity under your account. You must provide accurate information when signing up,
              including a Telegram username used for downloads.
            </Section>

            <Section title="4. Premium subscriptions & payments">
              Premium plans are billed once per plan period (1, 3, 6, or 12 months). Access is
              activated after payment is verified and expires at the end of the paid period unless
              renewed. Card and bank details are handled by our payment provider — VMC does not
              store them. Fees are shown at checkout and are non-refundable except where required
              by law.
            </Section>

            <Section title="5. Acceptable use">
              You agree not to redistribute or resell downloaded content, attempt to bypass the
              Premium gate, scrape or abuse the catalog or APIs, or use the service for any
              unlawful purpose. We may suspend or terminate accounts that violate these terms.
            </Section>

            <Section title="6. Content & copyright">
              We do not own any movie or content listed on VMC or delivered through our Telegram
              channel or bot. All titles, artwork, and files belong to their respective copyright
              owners. Catalog items may be added or removed at our discretion, and we do not
              guarantee that any specific title will remain available for the full length of your
              subscription.
              <br />
              <br />
              For copyright claims, contact us through{" "}
              <Link href="/support" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Support
              </Link>
              . Include enough detail to identify the material (title, link, or reference). We will
              review the request and remove or disable access where appropriate.
            </Section>

            <Section title="7. Disclaimer & limitation of liability">
              The service is provided &quot;as is&quot; without warranties of any kind. To the
              fullest extent permitted by law, VMC is not liable for indirect, incidental, or
              consequential damages arising from your use of the service.
            </Section>

            <Section title="8. Changes to these terms">
              We may update these terms from time to time. Continued use of VMC after a change
              means you accept the updated terms.
            </Section>

            <Section title="9. Contact">
              Questions about these terms can be sent through{" "}
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
