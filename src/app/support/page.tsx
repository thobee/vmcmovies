import Link from "next/link";
import { Suspense } from "react";
import { HelpCircle, Mail } from "lucide-react";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import SupportForm from "@/components/support/SupportForm";
import { getSession } from "@/lib/auth/session";

export default async function SupportPage() {
  const session = await getSession();

  return (
    <SitePage>
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">

        <div className="relative grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              <HelpCircle className="h-4 w-4" />
              Support
            </p>
            <h1
              className="mt-4 text-[1.9rem] font-bold leading-tight text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              Contact support
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/70">
              Paid but downloads won&apos;t unlock? Telegram link not working? Send a message — we
              reply by email.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                  1
                </span>
                Pick a category so we know what broke.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                  2
                </span>
                For payments, paste your reference if you have it.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                  3
                </span>
                We answer on the email you use here.
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101214] px-4 py-3.5 text-sm text-white/60">
              <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
              {session?.user.email ? (
                <span>
                  Logged in as{" "}
                  <span className="font-medium text-white">{session.user.email}</span>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <Link
                    href="/login?next=/support"
                    className="font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Log in
                  </Link>{" "}
                  so we can see your premium status.
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <Suspense
              fallback={
                <div className="h-80 rounded-[28px] border border-white/10 bg-[#101214] skeleton" />
              }
            >
              <SupportForm
                loggedIn={!!session}
                email={session?.user.email}
                telegramUsername={session?.user.telegramUsername}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <Footer />
    </SitePage>
  );
}
