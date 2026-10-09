import type { Metadata } from "next";
import { Baloo_2, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SessionIdleMonitor from "@/components/auth/SessionIdleMonitor";
import { SiteToastProvider } from "@/components/ui/SiteToast";
import AppLaunchScreen from "@/components/loading-ui/AppLaunchScreen";
import { getSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/payments/app-url";
import "./globals.css";

/** Body copy — Plus Jakarta Sans reads warmer and more premium than Inter at small sizes. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Headlines — wide geometric grotesk, replaces Sora for a sharper agency feel. */
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

/** Playful, rounded comic-style face — used only for a handful of fun section headlines. */
const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-comic",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "VMC — Vintage Movie Channel",
  description:
    "Browse movies and series for free. Premium members get direct Telegram downloads.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png?v=2", sizes: "48x48", type: "image/png" },
      { url: "/brand/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "VMC — Vintage Movie Channel",
    description: "Browse free. Download with Premium.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${grotesk.variable} ${baloo.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AuthProvider initialUser={session?.user ?? null}>
          <SiteToastProvider>
            <AppLaunchScreen />
            <SessionIdleMonitor />
            {children}
          </SiteToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
