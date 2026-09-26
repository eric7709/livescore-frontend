"use client";

import Link from "next/link";
import { Shield, Clock } from "lucide-react";
import { Fixture } from "@/features/competition/utils/competition.types";
import { MatchStatus } from "@/features/match/utils/match.types";
import { scoreMono } from "@/public/fonts/fonts";

const STATUS_STYLES: Record<MatchStatus, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600 ring-slate-200",
  LIVE: "bg-rose-50 text-rose-600 ring-rose-200",
  FINISHED: "bg-slate-100 text-slate-500 ring-slate-200",
  POSTPONED: "bg-amber-50 text-amber-700 ring-amber-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  ABANDONED: "bg-rose-50 text-rose-700 ring-rose-200",
  SUSPENDED: "bg-amber-50 text-amber-700 ring-amber-200",
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  SCHEDULED: "Sched",
  LIVE: "Live",
  FINISHED: "FT",
  POSTPONED: "PPD",
  CANCELLED: "Canc",
  ABANDONED: "Aban",
  SUSPENDED: "Susp",
};

interface FixtureCardProps {
  fixture: Fixture;
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
  const {
    matchId,
    matchTime,
    homeTeamName,
    homeTeamCode,
    homeTeamLogoUrl,
    awayTeamName,
    awayTeamCode,
    awayTeamLogoUrl,
    status,
  } = fixture;

  const isLive = status === "LIVE";

  return (
    <Link
      href={`/match/${matchId}`}
      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm md:p-2"
    >
      {/* Teams Stack */}
      <div className="flex flex-1 flex-col gap-1.5 pr-3 min-w-0">
        {/* Home Team */}
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60 md:h-3.5 md:w-3.5">
            {homeTeamLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeTeamLogoUrl} alt={homeTeamCode} className="h-full w-full object-cover" />
            ) : (
              <Shield className="h-2.5 w-2.5 text-slate-400" />
            )}
          </div>
          <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[11px]">
            {homeTeamName}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60 md:h-3.5 md:w-3.5">
            {awayTeamLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awayTeamLogoUrl} alt={awayTeamCode} className="h-full w-full object-cover" />
            ) : (
              <Shield className="h-2.5 w-2.5 text-slate-400" />
            )}
          </div>
          <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[11px]">
            {awayTeamName}
          </span>
        </div>
      </div>

      {/* Right Time/Status Pill Widget */}
      <div className="flex shrink-0 min-w-[65px] flex-col items-end justify-center border-l border-slate-100 pl-3 md:min-w-[55px] md:pl-2.5">
        <div className="flex items-center gap-1 text-slate-400">
          {!isLive && <Clock className="h-3 w-3 text-slate-400 md:h-2.5 md:w-2.5" />}
          <span className={`${scoreMono.className} text-[11px] font-bold text-slate-700 md:text-[10px]`}>
            {matchTime}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-1">
          {isLive && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
          )}
          <span
            className={`${scoreMono.className} rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>
    </Link>
  );
}