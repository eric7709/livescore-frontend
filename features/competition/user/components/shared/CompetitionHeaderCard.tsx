"use client";

import { Trophy, Users, CalendarDays, Layers3 } from "lucide-react";

import { CompetitionStatus } from "@/features/competition/utils/competition.types";
import { useGetCompetitionById } from "@/features/competition/utils/competition.api";

const STATUS_STYLES: Record<CompetitionStatus, string> = {
  SCHEDULED: "bg-sky-50 text-sky-700 ring-sky-600/15",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/15",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string) {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface CompetitionHeaderCardProps {
  competitionId: number;
}

export default function CompetitionHeaderCard({
  competitionId,
}: CompetitionHeaderCardProps) {
  const {
    data: competition,
    isLoading,
    isError,
  } = useGetCompetitionById(competitionId);

  if (isLoading) return <CompetitionHeaderCardSkeleton />;

  if (isError || !competition) return <CompetitionHeaderCardEmpty />;

  const {
    name,
    competitionCode,
    logoUrl,
    scope,
    status,
    registeredTeamCount,
    totalTeams,
    legFormat,
    totalRounds,
    startDate,
    endDate,
  } = competition;

  const fillPct =
    totalTeams > 0
      ? Math.min(100, Math.round((registeredTeamCount / totalTeams) * 100))
      : 0;

  return (
    <div className="mt-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Trophy className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-bold text-gray-900 sm:text-base">
              {name}
            </h1>

            <span
              className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:inline-flex ${STATUS_STYLES[status]}`}
            >
              {formatLabel(status)}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">
            {competitionCode} <span className="mx-1 text-gray-300">•</span>{" "}
            {formatLabel(scope)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:hidden ${STATUS_STYLES[status]}`}
        >
          {formatLabel(status)}
        </span>
      </div>

      {/* Details */}
      <div className="grid border-t border-gray-100 sm:grid-cols-3">
        {/* Competition Window */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            <CalendarDays className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Competition
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-gray-800">
              {formatDate(startDate)} – {formatDate(endDate)}
            </p>
          </div>
        </div>

        {/* Format */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:border-b-0 sm:border-r">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            <Layers3 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Format
            </p>
            <p className="mt-0.5 text-xs font-semibold text-gray-800">
              {totalRounds} rounds
              <span className="mx-1 text-gray-300">•</span>
              {formatLabel(legFormat)}
            </p>
          </div>
        </div>

        {/* Teams */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <Users className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Teams
                </p>

                <p className="text-xs font-bold tabular-nums text-gray-800">
                  {registeredTeamCount}
                  <span className="font-medium text-gray-400">
                    /{totalTeams}
                  </span>
                </p>
              </div>

              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitionHeaderCardSkeleton() {
  return (
    <div className="mt-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-100" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>

      <div className="grid border-t border-gray-100 sm:grid-cols-3">
        <div className="h-14 animate-pulse border-b border-gray-100 bg-gray-50/50 sm:border-b-0 sm:border-r" />
        <div className="h-14 animate-pulse border-b border-gray-100 bg-gray-50/50 sm:border-b-0 sm:border-r" />
        <div className="h-14 animate-pulse bg-gray-50/50" />
      </div>
    </div>
  );
}

function CompetitionHeaderCardEmpty() {
  return (
    <div className="mt-4 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Trophy className="h-4 w-4 text-gray-400" />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700">
          Competition unavailable
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400">
          Competition details could not be loaded.
        </p>
      </div>
    </div>
  );
}