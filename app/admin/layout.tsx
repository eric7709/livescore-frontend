import type { Metadata } from "next";
import Sidebar from "@/features/shared/components/Sidebar";
import TopNav from "@/features/shared/components/TopNav";
import "@/app/globals.css";
import { Providers } from "@/features/shared/providers/Provider";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel",
    template: "%s | Admin",
  },
  description: "Admin dashboard for LiveScore Pro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="grid grid-cols-[auto_1fr]" suppressHydrationWarning>
        <Sidebar />
        <main className="h-screen flex flex-col">
          <TopNav />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </Providers>
  );
}