"use client";

import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, BarChart3, Clock } from "lucide-react";

import { useGetMatchStats } from "../../../../matchEvent/utils/matchEvent.api";
import { EVENT_LABELS, EventTypeCount } from "../../../../matchEvent/utils/matchEvent.types";
import { MatchEventUtils } from "../../../../matchEvent/utils/matchEvent.utils";
import { useGetMatchById } from "@/features/match/utils/match.api";

// Define a consistent display order for event types so rows stay locked in place
const STAT_ORDER: Record<string, number> = {
  GOAL: 1,
  SHOT: 2,
  SHOT_ON_TARGET: 3,
  PENALTY_MISSED: 4,
  CORNER: 5,
  FOUL: 6,
  OFFSIDE: 7,
  YELLOW_CARD: 8,
  RED_CARD: 9,
};

function statLabel(stat: EventTypeCount): string {
  return EVENT_LABELS[stat.eventType] ?? MatchEventUtils.formatLabel(stat.eventType);
}

export default function MatchStatsPanel() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const { data: match, isLoading: isMatchLoading, isError: isMatchError } = useGetMatchById(
    validMatchId ? matchId : undefined,
  );
  const { data, isLoading, isError } = useGetMatchStats(validMatchId ? matchId : undefined);
  const [activePeriod, setActivePeriod] = useState<string | null>(null); // null = overall ("Match")

  const overall = data?.find((s) => s.period === null);
  const periods = (data ?? []).filter((s) => s.period !== null);
  const active = (activePeriod ? periods.find((s) => s.period === activePeriod) : overall) ?? overall;

  if (!validMatchId) {
    return (
      <PanelState
        icon={<AlertCircle size={20} />}
        title="Invalid match"
        message="Open the statistics panel from a valid match page."
        tone="error"
      />
    );
  }

  if (isLoading || isMatchLoading) return <StatsSkeleton />;

  if (isError || isMatchError) {
    return (
      <PanelState
        icon={<AlertCircle size={20} />}
        title="Stats unavailable"
        message="Match statistics could not be loaded right now."
        tone="error"
      />
    );
  }

  // Match hasn't kicked off yet — there's nothing to compare, so skip
  // straight past the stat bars rather than showing a flat 0-0 track.
  if (match?.status === "SCHEDULED") {
    return (
      <PanelState
        icon={<Clock size={20} />}
        title="Match hasn't started"
        message="Statistics will appear here once the match kicks off."
        tone="neutral"
      />
    );
  }

  if (!active || active.statistics.length === 0) {
    return (
      <PanelState
        icon={<BarChart3 size={20} />}
        title="No statistics yet"
        message="Event statistics will appear here as the match is tracked."
        tone="neutral"
      />
    );
  }

  // Sort statistics based on STAT_ORDER to ensure consistent vertical layout across periods
  const sortedStatistics = [...active.statistics].sort((a, b) => {
    const orderA = STAT_ORDER[a.eventType] ?? 99;
    const orderB = STAT_ORDER[b.eventType] ?? 99;
    return orderA - orderB;
  });

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      {periods.length > 0 && (
        <nav
          className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5"
          aria-label="Statistics period"
        >
          <PeriodTab
            label={overall?.periodLabel ?? "Match"}
            active={!activePeriod}
            onClick={() => setActivePeriod(null)}
          />
          {periods.map((period) => (
            <PeriodTab
              key={period.period}
              label={period.periodLabel}
              active={activePeriod === period.period}
              onClick={() => setActivePeriod(period.period)}
            />
          ))}
        </nav>
      )}

      {/* Keying by activePeriod ensures clean DOM transition when changing tabs */}
      <div key={activePeriod ?? "overall"} className="space-y-4 px-4 py-4 sm:px-5">
        {sortedStatistics.map((stat) => (
          <StatLine key={stat.eventType} stat={stat} />
        ))}
      </div>
    </section>
  );
}

function PeriodTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
        active
          ? "border-red-300 bg-red-600 text-white"
          : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-700"
      }`}
    >
      {label}
    </button>
  );
}

function StatLine({ stat }: { stat: EventTypeCount }) {
  const total = stat.homeValue + stat.awayValue;

  // Calculate percentage relative to total (max 100% of their side)
  const homeShare = total > 0 ? (stat.homeValue / total) * 100 : 0;
  const awayShare = total > 0 ? (stat.awayValue / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Stat Label */}
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {statLabel(stat)}
      </span>

      {/* Row with values and center-split track */}
      <div className="grid w-full grid-cols-[28px_1fr_28px] items-center gap-2 sm:gap-3">
        {/* Home Value */}
        <span className="text-right text-xs font-black tabular-nums text-red-700">
          {stat.homeValue}
        </span>
        {/* Center-Split Track Container */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          {/* Left Half (Home - Fills from center towards left) */}
          <div className="flex h-full w-1/2 justify-end">
            <span
              className="h-full rounded-l-full bg-red-500 transition-[width] duration-500 ease-out"
              style={{ width: `${homeShare}%` }}
            />
          </div>

          {/* Right Half (Away - Fills from center towards right) */}
          <div className="flex h-full w-1/2 justify-start">
            <span
              className="h-full rounded-r-full bg-blue-500 transition-[width] duration-500 ease-out"
              style={{ width: `${awayShare}%` }}
            />
          </div>
        </div>

        {/* Away Value */}
        <span className="text-left text-xs font-black tabular-nums text-blue-700">
          {stat.awayValue}
        </span>
      </div>
    </div>
  );
}

function PanelState({
  icon,
  title,
  message,
  tone,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  tone: "error" | "neutral";
}) {
  const styles =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <section className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <span className={`grid h-11 w-11 place-items-center rounded-xl border ${styles}`}>{icon}</span>
      <h2 className="mt-4 text-sm font-bold text-slate-800">{title}</h2>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{message}</p>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-6 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[28px_1fr_28px] items-center gap-3">
            <span className="h-2 animate-pulse rounded bg-red-50" />
            <span className="h-1.5 animate-pulse rounded-full bg-slate-100" />
            <span className="h-2 animate-pulse rounded bg-blue-50" />
          </div>
        ))}
      </div>
    </section>
  );
}