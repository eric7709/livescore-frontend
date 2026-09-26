"use client";

import { Clock, MapPin } from "lucide-react";

interface Result {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  homeScore: number;
  awayScore: number;
  badge: "W" | "D" | "L";
  venue?: string;
}

interface ResultCardProps {
  result: Result;
}

const BADGE_CONFIG: Record<
  Result["badge"],
  {
    label: string;
    stubBg: string;
    stubBorder: string;
    stubText: string;
    pillClass: string;
    scoreBorder: string;
  }
> = {
  W: {
    label: "Win",
    stubBg: "bg-emerald-50/60",
    stubBorder: "border-emerald-200",
    stubText: "text-emerald-700",
    pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    scoreBorder: "border-emerald-500",
  },
  D: {
    label: "Draw",
    stubBg: "bg-amber-50/60",
    stubBorder: "border-amber-200",
    stubText: "text-amber-700",
    pillClass: "bg-amber-50 text-amber-700 border border-amber-100",
    scoreBorder: "border-amber-400",
  },
  L: {
    label: "Loss",
    stubBg: "bg-red-50/60",
    stubBorder: "border-red-200",
    stubText: "text-red-700",
    pillClass: "bg-red-50 text-red-700 border border-red-100",
    scoreBorder: "border-red-500",
  },
};

export default function ResultCard({ result }: ResultCardProps) {
  const config = BADGE_CONFIG[result.badge];

  const parsedDate = new Date(result.date);

  const isValidDate = !Number.isNaN(parsedDate.getTime());

  const weekday = isValidDate
    ? parsedDate.toLocaleDateString("en-US", {
        weekday: "short",
      })
    : "";

  const day = isValidDate ? parsedDate.getDate() : "";

  const month = isValidDate
    ? parsedDate
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase()
    : "";

  return (
    <div className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm">
      {/* Date */}
      <div
        className={`flex w-[4.25rem] shrink-0 flex-col items-center justify-center border-r border-dashed px-2 py-3 ${config.stubBg} ${config.stubBorder}`}
      >
        <span
          className={`text-[9px] font-bold uppercase tracking-wider ${config.stubText}`}
        >
          {weekday}
        </span>

        <span
          className={`mt-0.5 font-mono text-2xl font-bold leading-none tabular-nums ${config.stubText}`}
        >
          {day}
        </span>

        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
          {month}
        </span>

        <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-500">
          <Clock size={10} className="text-gray-400" />
          {result.time}
        </div>
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1 px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
            Full Time
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${config.pillClass}`}
          >
            {config.label}
          </span>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-gray-900">
            {result.home}
          </p>

          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-md border-t-2 bg-gray-900 px-2.5 py-1 ${config.scoreBorder}`}
          >
            <span className="font-mono text-base font-bold leading-none tabular-nums text-white">
              {result.homeScore}
            </span>

            <span className="text-[10px] text-gray-500">–</span>

            <span className="font-mono text-base font-bold leading-none tabular-nums text-white">
              {result.awayScore}
            </span>
          </div>

          <p className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gray-900">
            {result.away}
          </p>
        </div>

        {/* Venue */}
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-100 pt-2 text-[11px] text-gray-400">
          <MapPin size={11} className="shrink-0" />

          <span className="truncate">
            {result.venue || "Venue TBD"}
          </span>
        </div>
      </div>
    </div>
  );
}