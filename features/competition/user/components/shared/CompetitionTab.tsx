"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface CompetitionTabProps {
  competitionId: number;
}

export default function CompetitionTab({ competitionId }: CompetitionTabProps) {
  const tabs = [
    { title: "Fixtures", link: `/competition/${competitionId}/fixtures` },
    { title: "Ranking", link: `/competition/${competitionId}/rankings` },
    { title: "Results", link: `/competition/${competitionId}/results` },
  ];

  const pathname = usePathname();
  const isActive = (link: string) => pathname.includes(link);

  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1.5 shadow-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-center gap-1.5">
        {tabs.map((tab) => {
          const active = isActive(tab.link);
          return (
            <Link key={tab.link} href={tab.link}>
              <button
                className={`cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition-all duration-150 ${active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  } active:scale-95`}
              >
                {tab.title}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}