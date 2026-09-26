"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetMatchById, useGetMatchOverview } from "@/features/match/utils/match.api";
import { scoreMono } from "@/public/fonts/fonts";
import Link from "next/link";

type MatchOverviewProps = {
  className?: string;
};

// Result badge configuration
const RESULT_CONFIG = {
  WIN: { label: "W", color: "bg-emerald-500 text-white" },
  LOSS: { label: "L", color: "bg-rose-500 text-white" },
  DRAW: { label: "D", color: "bg-slate-400 text-white" },
} as const;

function formatMatchDate(dateString?: string): string {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "2-digit" : undefined,
  });
}

function getResultLabel(result: "WIN" | "LOSS" | "DRAW"): string {
  return RESULT_CONFIG[result]?.label ?? "-";
}

function getResultColor(result: "WIN" | "LOSS" | "DRAW"): string {
  return RESULT_CONFIG[result]?.color ?? "bg-slate-300 text-white";
}

function formatScore(homeScore?: number, awayScore?: number): string {
  if (homeScore === undefined || awayScore === undefined) return "VS";
  return `${homeScore} - ${awayScore}`;
}

export default function History({ className = "" }: MatchOverviewProps) {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const { data: match, isLoading: matchLoading, isError: matchError } = useGetMatchById(validMatchId ? matchId : undefined);
  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useGetMatchOverview(validMatchId ? matchId : undefined);

  const [homeFormPage, setHomeFormPage] = useState(0);
  const [awayFormPage, setAwayFormPage] = useState(0);
  const [h2hPage, setH2hPage] = useState(0);

  const ITEMS_PER_PAGE = 5;

  const homeTeamCode = match?.homeTeamCode ?? "Home";
  const awayTeamCode = match?.awayTeamCode ?? "Away";

  const paginatedHomeForm = useMemo(() => {
    if (!overview?.homeTeamForm) return [];
    const start = homeFormPage * ITEMS_PER_PAGE;
    return overview.homeTeamForm.slice(start, start + ITEMS_PER_PAGE);
  }, [overview?.homeTeamForm, homeFormPage]);

  const paginatedAwayForm = useMemo(() => {
    if (!overview?.awayTeamForm) return [];
    const start = awayFormPage * ITEMS_PER_PAGE;
    return overview.awayTeamForm.slice(start, start + ITEMS_PER_PAGE);
  }, [overview?.awayTeamForm, awayFormPage]);

  const paginatedH2h = useMemo(() => {
    if (!overview?.headToHead) return [];
    const start = h2hPage * ITEMS_PER_PAGE;
    return overview.headToHead.slice(start, start + ITEMS_PER_PAGE);
  }, [overview?.headToHead, h2hPage]);

  const totalHomeFormPages = Math.ceil((overview?.homeTeamForm?.length ?? 0) / ITEMS_PER_PAGE);
  const totalAwayFormPages = Math.ceil((overview?.awayTeamForm?.length ?? 0) / ITEMS_PER_PAGE);
  const totalH2hPages = Math.ceil((overview?.headToHead?.length ?? 0) / ITEMS_PER_PAGE);

  const isLoading = matchLoading || overviewLoading;
  const isError = matchError || overviewError;

  if (!validMatchId) {
    return (
      <OverviewEmptyState
        icon={<AlertCircle className="h-5 w-5" />}
        title="Invalid Match"
        message="Open this history from a valid match page."
      />
    );
  }

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (isError || !match) {
    return (
      <OverviewEmptyState
        icon={<AlertCircle className="h-5 w-5" />}
        title="Match History Not Found"
        message="We couldn't find the history data for this match."
      />
    );
  }

  return (
    <div className={`space-y-3 md:space-y-4 ${className}`}>
      {/* 1. Home Form Row */}
      <FormCard
        title={`${homeTeamCode} Recent Form`}
        entries={paginatedHomeForm}
        currentPage={homeFormPage}
        totalPages={totalHomeFormPages}
        onPageChange={setHomeFormPage}
        teamColor="emerald"
        showCompetition
      />

      {/* 2. Away Form Row */}
      <FormCard
        title={`${awayTeamCode} Recent Form`}
        entries={paginatedAwayForm}
        currentPage={awayFormPage}
        totalPages={totalAwayFormPages}
        onPageChange={setAwayFormPage}
        teamColor="sky"
        showCompetition
      />

      {/* 3. Head-to-Head Row */}
      <FormCard
        title="Head to Head"
        entries={paginatedH2h}
        currentPage={h2hPage}
        totalPages={totalH2hPages}
        onPageChange={setH2hPage}
        teamColor="purple"
        showCompetition
        isH2H
      />
    </div>
  );
}

function FormCard({
  title,
  entries,
  currentPage,
  totalPages,
  onPageChange,
  teamColor,
  showCompetition = false,
  isH2H = false,
}: {
  title: string;
  entries: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  teamColor: "emerald" | "sky" | "purple";
  showCompetition?: boolean;
  isH2H?: boolean;
}) {
  const dotColorMap = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    purple: "bg-purple-500",
  };

  if (entries.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="border-b border-slate-100 bg-slate-50/60 px-3 py-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 md:text-[10px]">
            {title}
          </h3>
        </div>
        <div className="flex min-h-[80px] items-center justify-center p-4">
          <p className="text-xs text-slate-400 md:text-[11px]">No match history recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-3 py-2 md:py-1.5">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColorMap[teamColor]}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 md:text-[11px] md:font-semibold">
            {title}
          </h3>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className={`${scoreMono.className} text-[10px] font-medium text-slate-400`}>
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Entries Stack */}
      <div className="divide-y divide-slate-100/70">
        {entries.map((entry, index) => {
          const matchHref = `/match/${entry.matchId}`;

          return (
            <Link
              key={entry.matchId || index}
              href={matchHref}
              className="group block px-3 py-2 transition-colors hover:bg-slate-50/80 md:py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Home Team */}
                <div className="flex flex-1 items-center justify-end gap-1.5 min-w-0">
                  <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[11px]">
                    {entry.homeTeamName}
                  </span>
                  {entry.homeTeamLogo && (
                    <img
                      src={entry.homeTeamLogo}
                      alt={entry.homeTeamName}
                      className="h-4 w-4 shrink-0 rounded-full object-cover md:h-3.5 md:w-3.5"
                    />
                  )}
                </div>

                {/* Center Score & Result */}
                <div className="flex items-center gap-1.5 shrink-0 px-1">
                  {!isH2H && entry.result && (
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-extrabold ${getResultColor(
                        entry.result
                      )}`}
                    >
                      {getResultLabel(entry.result)}
                    </span>
                  )}
                  <span
                    className={`${scoreMono.className} min-w-[42px] rounded bg-slate-900 px-1.5 py-0.5 text-center text-[11px] font-bold text-white md:text-[10px]`}
                  >
                    {formatScore(entry.homeScore, entry.awayScore)}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-1 items-center justify-start gap-1.5 min-w-0">
                  {entry.awayTeamLogo && (
                    <img
                      src={entry.awayTeamLogo}
                      alt={entry.awayTeamName}
                      className="h-4 w-4 shrink-0 rounded-full object-cover md:h-3.5 md:w-3.5"
                    />
                  )}
                  <span className="truncate text-xs font-medium text-slate-800 transition-colors group-hover:text-emerald-600 md:text-[11px]">
                    {entry.awayTeamName}
                  </span>
                </div>
              </div>

              {/* Competition & Date Metadata */}
              {showCompetition && entry.competitionName && (
                <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 md:text-[9px]">
                  {entry.competitionLogoUrl && (
                    <img
                      src={entry.competitionLogoUrl}
                      alt={entry.competitionName}
                      className="h-3 w-3 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <span className="truncate font-medium text-slate-500">{entry.competitionName}</span>
                  <span>·</span>
                  <span>{formatMatchDate(entry.matchDate)}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function OverviewEmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white p-6 text-center shadow-2xs">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
        {icon}
      </span>
      <h3 className="mt-3 text-xs font-bold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-xs text-[11px] text-slate-500">{message}</p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="border-b border-slate-100 bg-slate-50/60 px-3 py-2">
            <span className="block h-3 w-28 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100/70 p-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between py-1.5">
                <span className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                <span className="h-4 w-10 animate-pulse rounded bg-slate-200" />
                <span className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}