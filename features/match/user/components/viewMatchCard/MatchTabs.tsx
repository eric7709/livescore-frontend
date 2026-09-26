"use client";

import { useGetMatchById } from "@/features/match/utils/match.api";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const TABS1 = [
  { key: "", label: "Summary" },
  { key: "stats", label: "Stats" },
  { key: "lineup", label: "Lineups" },
  { key: "standings", label: "Standings" },
  { key: "history", label: "H2H" },
] as const;

const TABS2 = [
  { key: "", label: "Summary" },
  { key: "lineup", label: "Lineups" },
  { key: "standings", label: "Standings" },
  { key: "history", label: "H2H" },
] as const;

export default function MatchTabs() {
  const params = useParams<{ matchId: string }>();
  const pathname = usePathname();

  const matchId = params?.matchId;
  const basePath = `/match/${matchId}`;
  const {data} = useGetMatchById(Number(matchId));
  
  const TABS = data?.status == "SCHEDULED" ? TABS2 : TABS1
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-[#f3f6f3] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      {TABS.map((tab) => {
        const href = tab.key ? `${basePath}/${tab.key}` : basePath;

        // Check active state safely for both root summary tab and sub-routes
        const isActive = tab.key === ""
          ? pathname === basePath
          : pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link
            key={tab.key}
            href={href}
            className={`min-w-[76px] flex-1 rounded-xl px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.08em] transition-colors ${
              isActive
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}