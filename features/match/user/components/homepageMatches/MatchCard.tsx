"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { scoreMono } from "@/public/fonts/fonts";
import { MatchPeriod, MatchSummary } from "@/features/match/utils/match.types";

interface MatchCardProps {
  match: MatchSummary;
}

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

  const prevHomeScore = useRef<number | null | undefined>(match.homeScore);
  const prevAwayScore = useRef<number | null | undefined>(match.awayScore);

  const [homeFlashing, setHomeFlashing] = useState(false);
  const [awayFlashing, setAwayFlashing] = useState(false);

  useEffect(() => {
    if (prevHomeScore.current !== match.homeScore) {
      if (
        prevHomeScore.current != null &&
        (match.homeScore ?? 0) > prevHomeScore.current
      ) {
        setHomeFlashing(true);
        const timeout = setTimeout(
          () => setHomeFlashing(false),
          SCORE_FLASH_DURATION_MS
        );
        prevHomeScore.current = match.homeScore;
        return () => clearTimeout(timeout);
      }
      prevHomeScore.current = match.homeScore;
    }
  }, [match.homeScore]);

  useEffect(() => {
    if (prevAwayScore.current !== match.awayScore) {
      if (
        prevAwayScore.current != null &&
        (match.awayScore ?? 0) > prevAwayScore.current
      ) {
        setAwayFlashing(true);
        const timeout = setTimeout(
          () => setAwayFlashing(false),
          SCORE_FLASH_DURATION_MS
        );
        prevAwayScore.current = match.awayScore;
        return () => clearTimeout(timeout);
      }
      prevAwayScore.current = match.awayScore;
    }
  }, [match.awayScore]);

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

  const showScore = isLive || isFinished;

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const isHomeWinner = isFinished && homeScore > awayScore;
  const isAwayWinner = isFinished && awayScore > homeScore;

  const cornerStatus = isLive
    ? formatPeriodLabel(match.period)
    : isFinished
    ? "FT"
    : isPostponedOrCancelled
    ? match.status
    : "SCHEDULED";

  return (
    <Link
      href={`/match/${match.id}`}
      className={`group relative flex overflow-hidden rounded-xl border bg-white transition-all duration-150 hover:shadow-[0_6px_18px_-8px_rgba(20,83,45,0.2)] ${
        isLive
          ? "border-rose-200 hover:border-rose-400"
          : "border-slate-200 hover:border-[#14532D]/40"
      }`}
    >
      {/* ── Left Content Block ────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Bar */}
        <div
          className={`flex items-center gap-1.5 border-b px-3 py-1 ${
            isLive
              ? "border-rose-200 bg-rose-50/70"
              : isPostponedOrCancelled
              ? "border-amber-200 bg-amber-50"
              : "border-slate-100 bg-slate-50/60"
          }`}
        >
          {isLive && !isIntervalPeriod && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-600 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-600" />
            </span>
          )}
          <span
            className={`${scoreMono.className} text-[9px] font-extrabold uppercase tracking-[0.18em] ${
              isLive
                ? "text-rose-600"
                : isPostponedOrCancelled
                ? "text-amber-700"
                : "text-slate-400"
            }`}
          >
            {cornerStatus}
          </span>

          {isLive && elapsedMinute && (
            <>
              <span className="text-rose-300">·</span>
              <span
                className={`${scoreMono.className} text-[9px] font-bold tabular-nums text-rose-600`}
              >
                {elapsedMinute}
              </span>
            </>
          )}

          {!isLive && !isFinished && !isPostponedOrCancelled && (
            <span
              className={`${scoreMono.className} ml-auto text-[10px] font-bold tabular-nums text-slate-500`}
            >
              {formatKickoffTime(match.matchDate)}
            </span>
          )}
        </div>

        {/* Team Names */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`min-w-0 flex-1 truncate text-[13px] transition-colors group-hover:text-[#14532D] ${
                homeFlashing
                  ? "font-bold text-rose-600"
                  : isFinished
                  ? isHomeWinner
                    ? "font-bold text-slate-900"
                    : "font-normal text-slate-400"
                  : "font-semibold text-slate-800"
              }`}
            >
              {match.homeTeamName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span
              className={`min-w-0 flex-1 truncate text-[13px] transition-colors group-hover:text-[#14532D] ${
                awayFlashing
                  ? "font-bold text-rose-600"
                  : isFinished
                  ? isAwayWinner
                    ? "font-bold text-slate-900"
                    : "font-normal text-slate-400"
                  : "font-semibold text-slate-800"
              }`}
            >
              {match.awayTeamName}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Score Rail ──────────────────────── */}
      <div
        className={`flex w-[54px] shrink-0 flex-col items-center justify-center gap-1 border-l ${
          isLive
            ? "border-rose-200 bg-rose-50/70"
            : isFinished
            ? "border-slate-200 bg-slate-100/70"
            : isPostponedOrCancelled
            ? "border-amber-200 bg-amber-50"
            : "border-slate-100 bg-slate-50/60"
        }`}
      >
        {showScore ? (
          <>
            <span
              className={`${scoreMono.className} text-[16px] font-extrabold leading-none tabular-nums transition-colors ${
                homeFlashing
                  ? "text-rose-600"
                  : isFinished && !isHomeWinner
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
            >
              {homeScore}
            </span>
            <span
              aria-hidden
              className={`h-px w-3 ${
                isLive ? "bg-rose-200" : "bg-slate-300"
              }`}
            />
            <span
              className={`${scoreMono.className} text-[16px] font-extrabold leading-none tabular-nums transition-colors ${
                awayFlashing
                  ? "text-rose-600"
                  : isFinished && !isAwayWinner
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
            >
              {awayScore}
            </span>
          </>
        ) : isPostponedOrCancelled ? (
          <span
            className={`${scoreMono.className} text-[10px] font-bold uppercase tracking-wider text-amber-700`}
            style={{ writingMode: "vertical-rl" }}
          >
            {match.status}
          </span>
        ) : (
          <span
            className={`${scoreMono.className} text-[13px] font-extrabold uppercase text-slate-400`}
          >
            VS
          </span>
        )}
      </div>
    </Link>
  );
}