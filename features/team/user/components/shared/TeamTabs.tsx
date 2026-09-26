"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scoreMono, inter } from "@/public/fonts/fonts";

interface TeamTabsProps {
  teamId: number | string;
}

export default function TeamTabs({ teamId }: TeamTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { title: "Squad", link: `/team/${teamId}/squad` },
    { title: "Fixtures", link: `/team/${teamId}/fixtures` },
    { title: "Results", link: `/team/${teamId}/results` },
  ];

  return (
    <nav className={`${inter.variable} relative mx-auto w-full  rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 shadow-xs backdrop-blur-md`}>
      <ul className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.link;

          return (
            <li key={tab.link} className="relative">
              <Link
                href={tab.link}
                aria-current={isActive ? "page" : undefined}
                className={`${scoreMono.className} relative flex h-9 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white shadow-2xs border border-slate-200/60 transition-all" />
                )}
                {/* Tab Label */}
                <span className="relative z-10 select-none">{tab.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}