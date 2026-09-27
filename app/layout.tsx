import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import "@/app/globals.css";
import { Providers } from "@/features/shared/providers/Provider";
import UserPageHeader from "@/features/shared/components/UserPageHeader";
import { AuthProvider } from "@/features/shared/providers/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "LiveScore Pro",
    template: "%s | LiveScore Pro",
  },
  description:
    "Follow live football scores, fixtures, standings, match statistics, and real-time sports updates from leagues around the world.",
  keywords: [
    "live scores",
    "football scores",
    "soccer scores",
    "sports updates",
    "match results",
    "fixtures",
    "league standings",
    "Premier League",
    "Champions League",
    "live football",
  ],
  authors: [{ name: "LiveScore Pro Team" }],
  applicationName: "LiveScore Pro",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} `}>
        <Providers>
          <div className="h-screen flex flex-col bg-slate-50 text-slate-900">
            <Suspense fallback={<div className="h-16 w-full border-b border-slate-200 bg-white" />}>
              <UserPageHeader />
            </Suspense>
            <main className="flex-1 overflow-y-auto">
              <Suspense fallback={null}>
                <AuthProvider>{children}</AuthProvider>
              </Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}