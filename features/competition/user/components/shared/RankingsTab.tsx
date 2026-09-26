"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RankingsTabProps {
  competitionId: number;
}

export default function RankingsTab({ competitionId }: RankingsTabProps) {
  const basePath = `/competition/${competitionId}/rankings`;

  const tabs = [
    { title: "Standings", link: `${basePath}/standings` },
    { title: "Live Standings", link: `${basePath}/live-standings` },
    { title: "Top Scorers", link: `${basePath}/top-scorers` },
    { title: "Top Assists", link: `${basePath}/top-assists` },
    { title: "Most Saves", link: `${basePath}/most-saves` },
    { title: "Most Yellow Card", link: `${basePath}/most-yellow-cards` },
    { title: "Most Red Card", link: `${basePath}/most-red-cards` },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const storageKey = `rankings-tab:${competitionId}`;

  const isActive = (link: string) => pathname === link;
  const matchesAnyTab = tabs.some((tab) => isActive(tab.link));

  useEffect(() => {
    if (matchesAnyTab) return;
    if (pathname !== basePath) return;

    let target = tabs[0].link;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && tabs.some((tab) => tab.link === stored)) {
        target = stored;
      }
    } catch {
      // Local storage fallback
    }

    router.replace(target);
  }, [pathname, matchesAnyTab, basePath, storageKey, router, tabs]);

  const handleTabClick = (link: string) => {
    try {
      localStorage.setItem(storageKey, link);
    } catch {
      // Storage quota fallback
    }
  };

  return (
    <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1.5 shadow-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-1.5">
        {tabs.map((el) => {
          const active = isActive(el.link);
          return (
            <Link key={el.link} href={el.link} onClick={() => handleTabClick(el.link)}>
              <button
                className={`cursor-pointer whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all duration-150 ${active
                    ? "bg-slate-800 text-white shadow-xs"
                    : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  } active:scale-95`}
              >
                {el.title}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}