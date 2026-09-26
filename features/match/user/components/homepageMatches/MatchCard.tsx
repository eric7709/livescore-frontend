"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { scoreMono } from "@/public/fonts/fonts";
import { Clock } from "lucide-react";
import { MatchPeriod, MatchSummary } from "@/features/match/utils/match.types";

interface MatchCardProps {
  match: MatchSummary;
}
// How long the score-changed highlight stays visible.
const SCORE_FLASH_DURATION_MS = 2500;

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isPostponedOrCancelled =
    match.status === "POSTPONED" ||
    match.status === "CANCELLED" ||
    match.status === "ABANDONED" ||
    match.status === "SUSPENDED";

  const [elapsedMinute, setElapsedMinute] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) return;

    const calculateMinute = () => {
      switch (match.period) {
        case "PRE_MATCH":
          return "0'";
        case "HALF_TIME":
          return "HT";
        case "EXTRA_TIME_HALF_TIME":
          return "ET HT";
        case "PENALTIES":
          return "PEN";
        case "FULL_TIME":
          return "FT";
      }

      if (!match.periodStartedAt) {
        if (match.period === "SECOND_HALF") return "46'";
        if (match.period === "EXTRA_TIME_FIRST_HALF") return "91'";
        if (match.period === "EXTRA_TIME_SECOND_HALF") return "106'";
        return "1'";
      }

      const startTime = new Date(match.periodStartedAt).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 60000);

      // baseMinute = start of this period, cap = regulation end of this period
      let baseMinute = 1;
      let cap = 45;
      if (match.period === "SECOND_HALF") {
        baseMinute = 46;
        cap = 90;
      } else if (match.period === "EXTRA_TIME_FIRST_HALF") {
        baseMinute = 91;
        cap = 105;
      } else if (match.period === "EXTRA_TIME_SECOND_HALF") {
        baseMinute = 106;
        cap = 120;
      }
      const currentMinute = Math.max(1, baseMinute + elapsed);
      // Once the period runs past its regulation length, show stoppage time
      // as "45+N'" instead of ticking past the cap.
      if (currentMinute > cap) {
        return `${cap}+${currentMinute - cap}'`;
      }
      return `${currentMinute}'`;
    };

    setElapsedMinute(calculateMinute());

    const interval = setInterval(() => {
      setElapsedMinute(calculateMinute());
    }, 10000);

    return () => clearInterval(interval);
  }, [isLive, match.period, match.periodStartedAt]);

  // --- Score-change flash ---------------------------------------------------
  // Tracks each team's previous score so we can detect a change on re-render
  // (e.g. after a WebSocket-triggered refetch pushes new props in) and flash
  // just that team's row, independent of the other team's.
  const prevHomeScore = useRef<number | null | undefined>(match.homeScore);
  const prevAwayScore = useRef<number | null | undefined>(match.awayScore);

  const [homeFlashing, setHomeFlashing] = useState(false);
  const [awayFlashing, setAwayFlashing] = useState(false);

  useEffect(() => {
    if (prevHomeScore.current !== match.homeScore) {
      // Only flash on an actual increase, not on the first render or a reset.
      if (prevHomeScore.current != null && (match.homeScore ?? 0) > prevHomeScore.current) {
        setHomeFlashing(true);
        const timeout = setTimeout(() => setHomeFlashing(false), SCORE_FLASH_DURATION_MS);
        prevHomeScore.current = match.homeScore;
        return () => clearTimeout(timeout);
      }
      prevHomeScore.current = match.homeScore;
    }
  }, [match.homeScore]);

  useEffect(() => {
    if (prevAwayScore.current !== match.awayScore) {
      if (prevAwayScore.current != null && (match.awayScore ?? 0) > prevAwayScore.current) {
        setAwayFlashing(true);
        const timeout = setTimeout(() => setAwayFlashing(false), SCORE_FLASH_DURATION_MS);
        prevAwayScore.current = match.awayScore;
        return () => clearTimeout(timeout);
      }
      prevAwayScore.current = match.awayScore;
    }
  }, [match.awayScore]);
  // ---------------------------------------------------------------------------

  const formatKickoffTime = (dateIso?: string) => {
    if (!dateIso) return "";
    return new Date(dateIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatPeriodLabel = (period: MatchPeriod) => {
    switch (period) {
      case "HALF_TIME":
        return "HT";
      case "EXTRA_TIME_FIRST_HALF":
        return "ET1";
      case "EXTRA_TIME_HALF_TIME":
        return "ET HT";
      case "EXTRA_TIME_SECOND_HALF":
        return "ET2";
      case "PENALTIES":
        return "PEN";
      case "PRE_MATCH":
        return "PRE";
      default:
        return "LIVE";
    }
  };

  const isIntervalPeriod =
    match.period === "HALF_TIME" ||
    match.period === "EXTRA_TIME_HALF_TIME" ||
    match.period === "PENALTIES" ||
    match.period === "PRE_MATCH";

  return (
    <Link
      href={`/match/${match.id}`}
      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm md:p-2"
    >
      {/* Teams Info */}
      <div className="flex flex-1 flex-col gap-1.5 pr-3 min-w-0">
        {/* Home Team */}
        <div
          className={`flex items-center justify-between gap-2 rounded-md px-1 -mx-1 transition-colors duration-700 ${homeFlashing ? "bg-rose-100" : "bg-transparent"
            }`}
        >
          <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[12px]">
            {match.homeTeamName}
          </span>
          {(isLive || isFinished) && (
            <span className={`${scoreMono.className} text-xs font-bold text-slate-900 md:text-[11px]`}>
              {match.homeScore ?? 0}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div
          className={`flex items-center justify-between gap-2 rounded-md px-1 -mx-1 transition-colors duration-700 ${awayFlashing ? "bg-rose-100" : "bg-transparent"
            }`}
        >
          <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[12px]">
            {match.awayTeamName}
          </span>
          {(isLive || isFinished) && (
            <span className={`${scoreMono.className} text-xs font-bold text-slate-900 md:text-[11px]`}>
              {match.awayScore ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Status & Time Widget */}
      <div className="flex shrink-0 min-w-[70px] flex-col items-end justify-center border-l border-slate-100 pl-3 md:min-w-[60px] md:pl-2.5">
        {/* LIVE State */}
        {isLive && (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5">
              {!isIntervalPeriod && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
              )}
              <span className={`${scoreMono.className} text-[9px] font-extrabold uppercase text-rose-600 tracking-wider`}>
                {formatPeriodLabel(match.period)}
              </span>
            </div>
            {/* Minute Display */}
            {elapsedMinute && (
              <span className={`${scoreMono.className} text-[9px] font-bold text-rose-600`}>
                {elapsedMinute}
              </span>
            )}
          </div>
        )}

        {/* SCHEDULED State */}
        {match.status === "SCHEDULED" && (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={11} />
              <span className={`${scoreMono.className} text-[11px] font-bold text-slate-700 md:text-[10px]`}>
                {formatKickoffTime(match.matchDate)}
              </span>
            </div>
            <span className={`${scoreMono.className} text-[9px] font-semibold uppercase tracking-wider text-slate-400`}>
              Sched
            </span>
          </div>
        )}

        {/* FINISHED State */}
        {isFinished && (
          <div className="flex flex-col items-end">
            <span className={`${scoreMono.className} text-[10px] font-extrabold uppercase tracking-wider text-slate-400 md:text-[9px]`}>
              FT
            </span>
          </div>
        )}

        {/* POSTPONED / CANCELLED State */}
        {isPostponedOrCancelled && (
          <div className="flex flex-col items-end">
            <span className={`${scoreMono.className} rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700`}>
              {match.status}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}