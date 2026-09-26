"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  Radio,
  MapPin,
  Trophy,
  AlertCircle,
  XCircle,
  PauseCircle,
  CheckCircle2,
} from "lucide-react";

import { MatchDTO, MatchStatus } from "../../../utils/match.types";

interface MatchTableProps {
  onEdit: (match: MatchDTO) => void;
  onDelete: (match: MatchDTO) => void;
  matches?: MatchDTO[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  MatchStatus,
  {
    label: string;
    badgeStyle: string;
    dotStyle: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  SCHEDULED: {
    label: "Scheduled",
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100/60",
    dotStyle: "bg-sky-500",
    icon: Calendar,
  },
  LIVE: {
    label: "Live",
    badgeStyle:
      "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/20",
    dotStyle: "bg-emerald-500 animate-ping",
    icon: Radio,
  },
  FINISHED: {
    label: "Finished",
    badgeStyle: "bg-slate-100/80 text-slate-600 border-slate-200",
    dotStyle: "bg-slate-400",
    icon: CheckCircle2,
  },
  POSTPONED: {
    label: "Postponed",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
    dotStyle: "bg-amber-500",
    icon: Clock,
  },
  CANCELLED: {
    label: "Cancelled",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotStyle: "bg-rose-500",
    icon: XCircle,
  },
  ABANDONED: {
    label: "Abandoned",
    badgeStyle: "bg-orange-50 text-orange-700 border-orange-200/80",
    dotStyle: "bg-orange-500",
    icon: AlertCircle,
  },
  SUSPENDED: {
    label: "Suspended",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80",
    dotStyle: "bg-purple-500",
    icon: PauseCircle,
  },
};

export default function MatchTable({
  onEdit,
  onDelete,
  matches = [],
  isLoading = false,
}: MatchTableProps) {
  const hasMatches = matches.length > 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-100">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-6 py-3.5 w-[36%]">
                Fixture
              </th>
              <th scope="col" className="px-5 py-3.5 w-[22%]">
                Date & Time
              </th>
              <th scope="col" className="px-4 py-3.5 text-center w-[16%]">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 text-center w-[14%]">
                Score
              </th>
              <th scope="col" className="px-6 py-3.5 text-right w-[12%]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100/80">
            {isLoading ? (
              <TableSkeleton />
            ) : !hasMatches ? (
              <EmptyState />
            ) : (
              matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MatchRowProps {
  match: MatchDTO;
  onEdit: (match: MatchDTO) => void;
  onDelete: (match: MatchDTO) => void;
}

function MatchRow({ match, onEdit, onDelete }: MatchRowProps) {
  const statusInfo = STATUS_CONFIG[match.status] || STATUS_CONFIG.SCHEDULED;
  const StatusIcon = statusInfo.icon;

  const { dateStr, timeStr } = useMemo(() => {
    if (!match.matchDate) return { dateStr: "—", timeStr: "—" };
    const d = new Date(match.matchDate);
    return {
      dateStr: d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      timeStr: d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [match.matchDate]);

  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const isLive = match.status === "LIVE";
  const isScheduled = match.status === "SCHEDULED";

  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/80">
      <td className="px-6 py-4">
        {match.competitionName && (
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 truncate">
            <Trophy size={11} className="shrink-0 text-slate-400" />
            <span className="truncate">{match.competitionName}</span>
          </div>
        )}

        <Link
          href={`/match/${match.id}`}
          className="group/link inline-flex items-center gap-2 max-w-full text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          <div className="flex items-center gap-2 truncate text-[13px] font-semibold tracking-tight text-slate-800 group-hover/link:text-blue-600 transition-colors">
            <span className="truncate">{match.homeTeamName}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              VS
            </span>
            <span className="truncate">{match.awayTeamName}</span>
          </div>

          <ChevronRight
            size={15}
            className="text-slate-300 transition-all duration-200 group-hover/link:translate-x-1 group-hover/link:text-blue-600 shrink-0"
          />
        </Link>

        {match.stadium && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 font-normal truncate">
            <MapPin size={11} className="shrink-0 text-slate-400" />
            <span className="truncate">{match.stadium}</span>
          </div>
        )}
      </td>

      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-700">
            {dateStr}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock size={11} className="text-slate-400" />
            {timeStr}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 text-center whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all ${statusInfo.badgeStyle}`}
        >
          <span className="relative flex h-2 w-2 items-center justify-center">
            {isLive && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusInfo.dotStyle}`}
            />
          </span>
          <span>{statusInfo.label}</span>
          {StatusIcon && isLive && (
            <StatusIcon size={12} className="ml-0.5 text-emerald-600 animate-pulse" />
          )}
        </span>
      </td>

      <td className="px-4 py-4 text-center whitespace-nowrap">
        {isScheduled ? (
          <span className="text-xs font-medium text-slate-300">—</span>
        ) : hasScore ? (
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 font-mono text-xs font-bold tabular-nums shadow-2xs transition-colors ${
              isLive
                ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                : "border-slate-200/60 bg-slate-50 text-slate-700"
            }`}
          >
            <span>{match.homeScore}</span>
            <span className="text-slate-300 font-normal">•</span>
            <span>{match.awayScore}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>

      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {isScheduled ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(match)}
                title="Edit Match"
                aria-label={`Edit ${match.homeTeamName} vs ${match.awayTeamName}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(match)}
                title="Delete Match"
                aria-label={`Delete ${match.homeTeamName} vs ${match.awayTeamName}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition-all hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <span className="text-[11px] font-medium text-slate-300 italic px-2">
              Locked
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-20 text-center">
        <div className="mx-auto flex flex-col items-center justify-center max-w-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 text-slate-400 shadow-2xs">
            <Calendar size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No matches scheduled
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            There are no match records matching your criteria. Create a new
            fixture to get started.
          </p>
        </div>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-3 w-24 rounded bg-slate-50" />
            <div className="mt-1.5 h-4 w-48 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-50" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-1.5 h-3 w-16 rounded bg-slate-50" />
          </td>
          <td className="px-4 py-4 text-center">
            <div className="mx-auto h-6 w-20 rounded-full bg-slate-100" />
          </td>
          <td className="px-4 py-4 text-center">
            <div className="mx-auto h-6 w-12 rounded-lg bg-slate-100" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="ml-auto flex h-8 w-16 justify-end gap-1.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100" />
              <div className="h-8 w-8 rounded-lg bg-slate-100" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}