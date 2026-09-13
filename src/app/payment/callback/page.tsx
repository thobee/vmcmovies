import { Suspense } from "react";
import SitePage from "@/components/layout/SitePage";
import Footer from "@/components/layout/Footer";
import PaymentCallbackClient from "@/components/access/PaymentCallbackClient";

function CallbackFallback() {
  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-white/10 bg-[#101214] px-4 py-14 text-center sm:rounded-[28px] sm:px-8">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-emerald-400/25 border-t-emerald-400" />
      <p className="mt-5 text-sm text-white/50">Checking your payment…</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <SitePage>
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pb-20 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-24 h-64 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_70%)]"
        />
        <Suspense fallback={<CallbackFallback />}>
          <PaymentCallbackClient />
        </Suspense>
        <p className="relative mt-6 max-w-sm text-center text-xs leading-5 text-white/35 sm:mt-8">
          Need help with your payment?{" "}
          <a href="/support?category=payment" className="text-emerald-400/80 hover:text-emerald-300">
            Contact support
          </a>
        </p>
      </div>
      <Footer />
    </SitePage>
  );
}
