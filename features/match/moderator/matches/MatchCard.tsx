"use client";

import Link from "next/link";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
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
    badge: string;
    dot: string;
    label: string;
    stripe: string;
    pulse?: boolean;
  }
> = {
  SCHEDULED: {
    badge: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200",
    dot: "bg-gray-400",
    label: "Scheduled",
    stripe: "bg-gray-200",
  },
  LIVE: {
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    dot: "bg-red-500",
    label: "Live",
    stripe: "bg-[#E5484D]",
    pulse: true,
  },
  FINISHED: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Finished",
    stripe: "bg-emerald-400",
  },
  POSTPONED: {
    badge: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    dot: "bg-yellow-500",
    label: "Postponed",
    stripe: "bg-yellow-400",
  },
  CANCELLED: {
    badge: "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200",
    dot: "bg-gray-300",
    label: "Cancelled",
    stripe: "bg-gray-300",
  },
  ABANDONED: {
    badge: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
    dot: "bg-gray-400",
    label: "Abandoned",
    stripe: "bg-gray-400",
  },
  SUSPENDED: {
    badge: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    dot: "bg-orange-500",
    label: "Suspended",
    stripe: "bg-orange-400",
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

  const { badge, dot, label, stripe, pulse } = STATUS_STYLES[status];
  const { date, time } = formatDateParts(matchDate);

  return (
    <Link
      href={`/moderator/matches/${id}/record-stats`}
      className="group relative flex overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-px hover:border-gray-300 hover:shadow-md"
    >
      {/* Left status stripe */}
      <span className={`w-1 shrink-0 ${stripe}`} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3.5">
        {/* Header: type + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 ring-1 ring-inset ring-gray-100">
            {matchType}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {pulse && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dot} opacity-75`}
                />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`}
              />
            </span>
            {label}
          </span>
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">
            {homeTeamName ?? "TBD"}
          </span>

          <span
            className={`shrink-0 rounded-md px-2 py-1 font-mono text-sm font-bold tabular-nums ${
              hasScore
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-[10px] font-medium uppercase tracking-wider text-gray-500"
            }`}
          >
            {hasScore ? `${homeScore}–${awayScore}` : "vs"}
          </span>

          <span className="truncate text-right text-sm font-semibold text-gray-900">
            {awayTeamName ?? "TBD"}
          </span>
        </div>

        {/* Footer: date + venue */}
        <div className="flex items-center justify-between gap-2 border-t border-dashed border-gray-100 pt-2.5">
          <div className="flex min-w-0 items-center gap-3 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="font-mono tabular-nums">{date}</span>
            </span>
            <span className="font-mono tabular-nums text-gray-400">
              {time}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            {stadium && (
              <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{stadium}</span>
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500" />
          </div>
        </div>
      </div>
    </Link>
  );
}