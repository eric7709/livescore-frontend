"use client";

import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { MatchStatus, MatchType } from "@/features/match/utils/match.types";

export interface MatchCardData {
  id: number;
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  stadium: string | null;
  matchDate: string;
  matchType: MatchType;
}

const STATUS_STYLES: Record<
  MatchStatus,
  {
    ribbon: string;
    ribbonText: string;
    label: string;
    scoreColor: string;
    pulse?: boolean;
  }
> = {
  SCHEDULED: {
    ribbon: "bg-[#F4F6F1]",
    ribbonText: "text-[#6B7566]",
    label: "Scheduled",
    scoreColor: "text-[#C4CCC0]",
  },
  LIVE: {
    ribbon: "bg-[#C93B40]",
    ribbonText: "text-white",
    label: "Live",
    scoreColor: "text-[#C93B40]",
    pulse: true,
  },
  FINISHED: {
    ribbon: "bg-[#14532D]",
    ribbonText: "text-white",
    label: "FT",
    scoreColor: "text-[#14181C]",
  },
  POSTPONED: {
    ribbon: "bg-amber-400",
    ribbonText: "text-amber-950",
    label: "Postponed",
    scoreColor: "text-[#A0A89A]",
  },
  CANCELLED: {
    ribbon: "bg-[#D9DED2]",
    ribbonText: "text-[#6B7566]",
    label: "Cancelled",
    scoreColor: "text-[#C4CCC0]",
  },
  ABANDONED: {
    ribbon: "bg-[#C4CCC0]",
    ribbonText: "text-[#4A515B]",
    label: "Abandoned",
    scoreColor: "text-[#A0A89A]",
  },
  SUSPENDED: {
    ribbon: "bg-orange-400",
    ribbonText: "text-white",
    label: "Suspended",
    scoreColor: "text-orange-500",
  },
};

const SCORED_STATUSES: MatchStatus[] = [
  "LIVE",
  "FINISHED",
  "SUSPENDED",
  "ABANDONED",
];

function formatDateParts(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function MatchCard({ match }: { match: MatchCardData }) {
  const {
    id,
    homeTeamName,
    awayTeamName,
    homeScore,
    awayScore,
    status,
    stadium,
    matchDate,
    matchType,
  } = match;

  const hasScore =
    SCORED_STATUSES.includes(status) &&
    homeScore !== null &&
    awayScore !== null;

  const { ribbon, ribbonText, label, scoreColor, pulse } = STATUS_STYLES[status];
  const { date, time } = formatDateParts(matchDate);

  return (
    <Link
      href={`/moderator/matches/${id}/record-stats`}
      className="group relative grid grid-cols-[36px_1fr_auto] items-stretch overflow-hidden rounded-lg border border-[#E2E7DD] bg-white transition-all duration-150 hover:border-[#14532D]/30 hover:shadow-[0_4px_14px_-8px_rgba(20,83,45,0.32)]"
    >
      {/* ── Left ribbon: status word, vertical ─────────── */}
      <div
        className={`relative flex items-center justify-center ${ribbon} ${ribbonText}`}
      >
        <span
          className="flex flex-col items-center gap-1"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {pulse && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-90" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          )}
          <span className="text-[9.5px] font-bold uppercase tracking-[0.18em]">
            {label}
          </span>
        </span>
      </div>

      {/* ── Middle: teams + meta ───────────────────────── */}
      <div className="flex min-w-0 flex-col justify-center gap-1 px-3 py-2">
        {/* Row 1: match type + date/time */}
        <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#A0A89A]">
          <span className="text-[#8B9388]">{matchType}</span>
          <span className="text-[#D9DED2]">·</span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Calendar className="h-2.5 w-2.5" />
            {date}
          </span>
          <span className="text-[#D9DED2]">·</span>
          <span className="font-mono tabular-nums">{time}</span>
        </div>

        {/* Row 2: home team */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-[#14181C] transition-colors group-hover:text-[#14532D]">
            {homeTeamName ?? "TBD"}
          </span>
        </div>

        {/* Row 3: away team */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-[#14181C] transition-colors group-hover:text-[#14532D]">
            {awayTeamName ?? "TBD"}
          </span>
        </div>

        {/* Row 4: venue */}
        {stadium && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#8B9388]">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{stadium}</span>
          </div>
        )}
      </div>

      {/* ── Right: stacked scores ──────────────────────── */}
      <div className="flex flex-col items-center justify-center gap-1.5 border-l border-[#EDF0E8] bg-[#FAFBF7] px-3">
        {hasScore ? (
          <>
            <span
              className={`font-mono text-[18px] font-bold leading-none tabular-nums ${scoreColor}`}
            >
              {homeScore}
            </span>
            <span
              aria-hidden
              className="h-px w-4 bg-[#D9DED2]"
            />
            <span
              className={`font-mono text-[18px] font-bold leading-none tabular-nums ${scoreColor}`}
            >
              {awayScore}
            </span>
          </>
        ) : (
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#C4CCC0]">
            vs
          </span>
        )}
      </div>
    </Link>
  );
}