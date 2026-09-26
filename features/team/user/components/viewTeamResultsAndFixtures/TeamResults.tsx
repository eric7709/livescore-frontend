"use client";

import Link from "next/link";
import { useTeamResults } from "@/features/team/utils/team.api";
import { inter, scoreMono } from "@/public/fonts/fonts";

interface TeamResultsProps {
  teamId: number;
  date?: string;
  competitionId?: number;
}

export default function TeamResults({ teamId, date, competitionId }: TeamResultsProps) {
  const { data, isLoading, isError } = useTeamResults(teamId, { date, competitionId });
  const results = data?.content ?? [];

  return (
    <div className={`${inter.variable} mt-3 space-y-2`}>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100/80" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-center">
          <p className="text-xs font-medium text-rose-600">Couldn&apos;t load results. Try refreshing.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs">
          <p className="text-xs text-slate-400">No results found.</p>
        </div>
      ) : (
        results.map((result) => {
          const isWin = result.badge === "W";
          const isLoss = result.badge === "L";

          return (
            <Link
              key={result.matchId}
              href={`/match/${result.matchId}`}
              className="group grid grid-cols-3 items-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-150 hover:border-slate-300 hover:shadow-md"
            >
              {/* Competition & Badge (Left Col) */}
              <div className="flex items-center gap-2.5 justify-self-start min-w-0">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    isWin
                      ? "bg-emerald-500 text-white"
                      : isLoss
                      ? "bg-rose-500 text-white"
                      : "bg-slate-400 text-white"
                  }`}
                >
                  {result.badge}
                </span>
                <span
                  className={`${scoreMono.className} rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate`}
                >
                  {result.competitionCode}
                </span>
              </div>

              {/* Matchup & Score (Center Col - Strictly Centered) */}
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 justify-self-center">
                <span className="w-10 text-right truncate">{result.homeTeamCode}</span>
                <span className={`${scoreMono.className} shrink-0 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white shadow-2xs`}>
                  {result.homeScore} - {result.awayScore}
                </span>
                <span className="w-10 text-left truncate">{result.awayTeamCode}</span>
              </div>

              {/* Date (Right Col) */}
              <div className={`${scoreMono.className} shrink-0 justify-self-end text-right text-[10px] font-medium text-slate-400`}>
                <p>{result.matchDate}</p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}