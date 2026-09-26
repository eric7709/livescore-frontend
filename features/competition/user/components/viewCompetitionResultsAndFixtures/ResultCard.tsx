"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Result } from "@/features/competition/utils/competition.types";
import { scoreMono } from "@/public/fonts/fonts";

interface ResultCardProps {
  result: Result;
}

export default function ResultCard({ result }: ResultCardProps) {
  const {
    matchId,
    homeTeamName,
    homeTeamCode,
    homeTeamLogoUrl,
    homeScore,
    awayTeamName,
    awayTeamCode,
    awayTeamLogoUrl,
    awayScore,
  } = result;

  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  return (
    <Link
      href={`/match/${matchId}`}
      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm md:p-2"
    >
      {/* Teams Stack */}
      <div className="flex flex-1 flex-col gap-1.5 pr-3 min-w-0">
        {/* Home Team Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60 md:h-3.5 md:w-3.5">
              {homeTeamLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeTeamLogoUrl} alt={homeTeamCode} className="h-full w-full object-cover" />
              ) : (
                <Shield className="h-2.5 w-2.5 text-slate-400" />
              )}
            </div>
            <span
              className={`truncate text-xs transition-colors group-hover:text-emerald-600 md:text-[11px] ${
                homeWon ? "font-bold text-slate-900" : "font-medium text-slate-600"
              }`}
            >
              {homeTeamName}
            </span>
          </div>
          <span
            className={`${scoreMono.className} text-xs md:text-[11px] ${
              homeWon ? "font-bold text-slate-900" : "font-medium text-slate-400"
            }`}
          >
            {homeScore}
          </span>
        </div>

        {/* Away Team Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60 md:h-3.5 md:w-3.5">
              {awayTeamLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awayTeamLogoUrl} alt={awayTeamCode} className="h-full w-full object-cover" />
              ) : (
                <Shield className="h-2.5 w-2.5 text-slate-400" />
              )}
            </div>
            <span
              className={`truncate text-xs transition-colors group-hover:text-emerald-600 md:text-[11px] ${
                awayWon ? "font-bold text-slate-900" : "font-medium text-slate-600"
              }`}
            >
              {awayTeamName}
            </span>
          </div>
          <span
            className={`${scoreMono.className} text-xs md:text-[11px] ${
              awayWon ? "font-bold text-slate-900" : "font-medium text-slate-400"
            }`}
          >
            {awayScore}
          </span>
        </div>
      </div>

      {/* Right FT Status Widget */}
      <div className="flex shrink-0 min-w-[50px] flex-col items-end justify-center border-l border-slate-100 pl-3 md:min-w-[45px] md:pl-2.5">
        <span className={`${scoreMono.className} rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500`}>
          FT
        </span>
      </div>
    </Link>
  );
}