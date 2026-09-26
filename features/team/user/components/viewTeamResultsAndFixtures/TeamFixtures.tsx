"use client";

import Link from "next/link";
import { useTeamFixtures } from "@/features/team/utils/team.api";
import { inter, scoreMono } from "@/public/fonts/fonts";

interface TeamFixturesProps {
  teamId: number;
  date?: string;
  competitionId?: number;
}

export default function TeamFixtures({ teamId, date, competitionId }: TeamFixturesProps) {
  const { data, isLoading, isError } = useTeamFixtures(teamId, { date, competitionId });
  const fixtures = data?.content ?? [];

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
          <p className="text-xs font-medium text-rose-600">Couldn&apos;t load fixtures. Try refreshing.</p>
        </div>
      ) : fixtures.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs">
          <p className="text-xs text-slate-400">No upcoming fixtures.</p>
        </div>
      ) : (
        fixtures.map((fixture) => (
          <Link
            key={fixture.matchId}
            href={`/match/${fixture.matchId}`}
            className="group grid grid-cols-3 items-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-150 hover:border-emerald-500/40 hover:bg-slate-50/50 hover:shadow-md"
          >
            {/* Competition Badge (Left Col) */}
            <div className="justify-self-start min-w-0">
              <span
                className={`${scoreMono.className} inline-block shrink-0 rounded-md bg-emerald-50 border border-emerald-200/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate`}
              >
                {fixture.competitionCode}
              </span>
            </div>

            {/* Teams Matchup (Center Col - Strictly Centered) */}
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 justify-self-center">
              <span className="w-10 text-right truncate">{fixture.homeTeamCode}</span>
              <span className={`${scoreMono.className} shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-400`}>
                VS
              </span>
              <span className="w-10 text-left truncate">{fixture.awayTeamCode}</span>
            </div>

            {/* Date & Kickoff Time (Right Col) */}
            <div className={`${scoreMono.className} shrink-0 justify-self-end text-right text-[10px] font-medium text-slate-500`}>
              <p className="font-bold text-slate-700">{fixture.matchTime}</p>
              <p className="text-slate-400">{fixture.matchDate}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}