"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CircleX,
  ListTree,
  Recycle,
  RectangleVertical,
} from "lucide-react";

import { MatchDTO, MatchPeriod } from "@/features/match/utils/match.types";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchSummaries } from "@/features/matchEvent/utils/matchEvent.api";
import {
  EventType,
  MatchEventDTO,
} from "@/features/matchEvent/utils/matchEvent.types";
import { MatchEventUtils } from "@/features/matchEvent/utils/matchEvent.utils";
import { useMatchLiveUpdates } from "@/features/match/utils/useMatchLiveUpdates";

/** A classic stitched football: centre pentagon, surrounding panels and seams. */
function SoccerBallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.10"
        stroke="currentColor"
        strokeWidth="1.45"
      />
      <path
        d="M12 7.25 15.25 9.62 14.02 13.45H9.98L8.75 9.62 12 7.25Z"
        fill="currentColor"
      />
      <path
        d="M12 7.25V3.15M15.25 9.62l4-1.3M14.02 13.45l2.45 4.18M9.98 13.45l-2.45 4.18M8.75 9.62l-4-1.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="m12 3.15 3.02 1.35 1.25 3.87M19.25 8.32l.42 3.28-3.2 2.58M16.47 17.63 13.38 20.5 10.62 20.5M7.53 17.63 4.33 14.18l.42-2.58M4.75 8.32 7.73 4.5 12 3.15"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A penalty-area outline and penalty spot — used for a penalty being awarded (not yet taken). */
function PenaltyAwardedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 3.5v5.2h9V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="13" r="1.55" fill="currentColor" />
      <path d="M9.2 18h5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A penalty-area outline with the ball travelling from the spot into the net —
 * deliberately distinct from PenaltyAwardedIcon (which shows a dot + flag line)
 * so a scored penalty reads as "goal", not "awarded", at a glance.
 */
function PenaltyGoalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 3.5v5.2h9V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Penalty spot */}
      <circle cx="12" cy="14.2" r="1.1" fill="currentColor" />
      {/* Trajectory from spot into the net */}
      <path
        d="M12 13 L12 9.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.6 1.5"
      />
      {/* Ball, already past the line */}
      <circle cx="12" cy="8" r="1.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Second-yellow-to-red: designed to match the exact size (14px) of standard 
 * Lucide single-card icons so the row icon sizes are completely uniform.
 */
function YellowRedCardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Yellow card (tilted behind) */}
      <rect
        x="3"
        y="4"
        width="11"
        height="16"
        rx="1.5"
        fill="#FACC15"
        stroke="#B45309"
        strokeWidth="1"
        transform="rotate(-15 8.5 12)"
      />
      {/* Red card (straight in front) */}
      <rect
        x="10"
        y="4"
        width="11"
        height="16"
        rx="1.5"
        fill="#E11D48"
        stroke="#9F1239"
        strokeWidth="1"
      />
    </svg>
  );
}

function summaryVisualOverride(
  eventType: EventType,
): { icon: ReactNode; className: string } | null {
  switch (eventType) {
    case "GOAL":
    case "LONG_RANGE_GOAL":
      return {
        icon: <SoccerBallIcon className="h-4 w-4" />,
        className: "border-emerald-200 bg-emerald-50 text-emerald-600",
      };
    case "PENALTY_GOAL":
      return {
        icon: <PenaltyGoalIcon className="h-4 w-4" />,
        className: "border-indigo-200 bg-indigo-50 text-indigo-600",
      };
    case "FREE_KICK_GOAL":
      return {
        icon: <SoccerBallIcon className="h-4 w-4" />,
        className: "border-violet-200 bg-violet-50 text-violet-600",
      };
    case "OWN_GOAL":
      return {
        icon: <SoccerBallIcon className="h-4 w-4" />,
        className: "border-orange-200 bg-orange-50 text-orange-600",
      };
    case "YELLOW_CARD":
      return {
        icon: <RectangleVertical size={14} className="fill-current" />,
        className: "border-amber-300 bg-amber-50 text-amber-500",
      };
    case "RED_CARD":
      return {
        icon: <RectangleVertical size={14} className="fill-current" />,
        className: "border-rose-300 bg-rose-50 text-rose-600",
      };
    case "YELLOW_RED_CARD":
      return {
        icon: <YellowRedCardIcon />,
        className: "border-rose-300 bg-rose-50 text-rose-600",
      };
    case "SUBSTITUTION":
      return {
        icon: <Recycle size={16} />,
        className: "border-sky-200 bg-sky-50 text-sky-600",
      };
    case "PENALTY_MISSED":
      return {
        icon: <CircleX size={16} />,
        className: "border-rose-200 bg-rose-50 text-rose-600",
      };
    case "PENALTY_AWARDED":
      return {
        icon: <PenaltyAwardedIcon className="match-summary-penalty-icon h-4 w-4" />,
        className: "border-indigo-200 bg-indigo-50 text-indigo-600",
      };
    default:
      return null;
  }
}

/** Most event types use MatchEventUtils' shared label; a few read better with a shorter, row-specific label. */
function summaryEventLabel(eventType: EventType): string {
  if (eventType === "PENALTY_GOAL") return "Penalty";
  if (eventType === "YELLOW_RED_CARD") return "Red Card";
  return MatchEventUtils.formatLabel(eventType);
}

/** Normalizes a backend-supplied period label ("1ST HALF", "Match", "Penalties", etc.) to a single consistent case. */
function formatPeriodLabel(label: string): string {
  return label.toUpperCase();
}

// Clock-minute a period started counting from. Adjust to match your backend's
// actual period semantics — this only affects the live ticker's display,
// never the persisted event.minute values.
const PERIOD_BASE_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 0,
  SECOND_HALF: 45,
  EXTRA_TIME_FIRST: 90,
  EXTRA_TIME_SECOND: 105,
} as Partial<Record<MatchPeriod, number>>;

// Periods where the clock should not tick even if periodStartedAt is set
// (e.g. a shootout has no running minute).
const NON_TIMED_PERIODS: MatchPeriod[] = ["PENALTIES"] as MatchPeriod[];

/**
 * Live "current minute" derived from match.periodStartedAt, ticking every
 * minute for better performance. Returns null when there's nothing to tick.
 */
function useLiveMinute(match: MatchDTO | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());

  const isTicking =
    !!match?.periodStartedAt && !NON_TIMED_PERIODS.includes(match.period);

  useEffect(() => {
    if (!isTicking) return;

    // Update every minute
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, [isTicking]);

  return useMemo(() => {
    if (!match?.periodStartedAt || !isTicking) return null;

    const startedAtMs = new Date(match.periodStartedAt).getTime();
    if (Number.isNaN(startedAtMs)) return null;

    const elapsedMinutes = Math.max(0, Math.floor((now - startedAtMs) / 60000));
    const baseMinute = PERIOD_BASE_MINUTE[match.period] ?? 0;

    return baseMinute + elapsedMinutes;
  }, [match?.periodStartedAt, match?.period, isTicking, now]);
}

// Goal types that can carry an assist — mirrors ASSISTABLE_GOAL_TYPES on the backend.
const ASSISTABLE_GOAL_TYPES: EventType[] = ["GOAL", "FREE_KICK_GOAL"];

function EventDescription({ event }: { event: MatchEventDTO }) {
  if (event.eventType === "SUBSTITUTION") {
    return (
      <p className="truncate text-[11px] text-slate-500">
        <span>{event.primaryPlayerName ?? "Unknown"}</span>
        <span className="mx-1 text-slate-300">→</span>
        <span className="font-semibold text-slate-700">{event.secondaryPlayerName ?? "Unknown"}</span>
      </p>
    );
  }

  if (event.eventType === "OWN_GOAL") {
    return (
      <p className="truncate text-[11px] text-slate-500">
        {event.primaryPlayerName ?? "Unknown"}
        <span className="ml-1 font-semibold text-orange-500">(OG)</span>
      </p>
    );
  }

  if (ASSISTABLE_GOAL_TYPES.includes(event.eventType) && event.secondaryPlayerName) {
    return (
      <p className="truncate text-[11px] text-slate-500">
        {event.primaryPlayerName ?? "Unknown"}
        <span className="ml-1 text-slate-400">
          (assist: <span className="font-semibold text-slate-600">{event.secondaryPlayerName}</span>)
        </span>
      </p>
    );
  }

  return <p className="truncate text-[11px] text-slate-500">{event.primaryPlayerName ?? ""}</p>;
}

function getCreditedTeamId(event: MatchEventDTO, match: MatchDTO | undefined): number | null {
  if (event.teamId == null) return null;
  if (event.eventType !== "OWN_GOAL" || !match) return event.teamId;

  return event.teamId === match.homeTeamId
    ? match.awayTeamId
    : match.homeTeamId;
}

export default function MatchSummaryPanel() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

    useMatchLiveUpdates(validMatchId ? matchId : undefined); 


  const { data: match } = useGetMatchById(validMatchId ? matchId : undefined);
  const {
    data: periods,
    isLoading,
    isError,
  } = useGetMatchSummaries(validMatchId ? matchId : undefined);

  const liveMinute = useLiveMinute(match);

  if (!validMatchId) {
    return (
      <PanelState
        icon={<AlertCircle size={20} />}
        title="Invalid match"
        message="Open the match summary from a valid match page."
        tone="error"
      />
    );
  }

  if (isLoading) return <SummarySkeleton />;

  if (isError) {
    return (
      <PanelState
        icon={<AlertCircle size={20} />}
        title="Summary unavailable"
        message="The match summary could not be loaded right now."
        tone="error"
      />
    );
  }

  if (!periods?.length) {
    return (
      <PanelState
        icon={<ListTree size={20} />}
        title="No events yet"
        message="Goals, cards, penalties, and substitutions will appear here as they happen."
        tone="neutral"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <style>{`
        @keyframes match-summary-penalty-flag-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        .match-summary-penalty-icon {
          animation: match-summary-penalty-flag-scale 900ms ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .live-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="flex items-center justify-between border-b border-slate-100 bg-[#102c25] px-4 py-4 text-white sm:px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Match report</p>
          <h2 className="mt-1 text-base font-black">Timeline</h2>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-100">{periods.reduce((count, period) => count + period.summaries.length, 0)} events</span>
      </div>
      <div className="divide-y divide-slate-100">
        {periods.map((period) => {
          const isCurrentPeriod = match?.period === period.period;
          const showLiveMinute = isCurrentPeriod && liveMinute !== null;

          return (
            <section key={period.period}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.15em] text-slate-500">
                    {formatPeriodLabel(period.periodLabel)}
                  </span>
                </div>
                <span className="text-[11px] font-black tabular-nums text-slate-600">
                  {period.homeScore} - {period.awayScore}
                </span>
              </div>

              {period.summaries.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {period.summaries.map((event) => (
                    <SummaryRow key={event.id} event={event} match={match} />
                  ))}
                </div>
              ) : (
                <div className="flex h-10 items-center">
                  <p className="px-4 py-3 text-[11px] text-slate-400 sm:px-5">No events in this period.</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function SummaryRow({
  event,
  match,
}: {
  event: MatchEventDTO;
  match: MatchDTO | undefined;
}) {
  const isPenaltyAwarded = event.eventType === "PENALTY_AWARDED";
  const override = summaryVisualOverride(event.eventType);
  const fallback = override ? null : MatchEventUtils.getVisuals(event.eventType);
  const badgeClassName = override?.className
    ?? fallback?.className
    ?? "border-slate-200 bg-slate-50 text-slate-500";

  const creditedTeamId = getCreditedTeamId(event, match);
  const isHome = match != null && creditedTeamId === match.homeTeamId;
  const teamCode = isHome ? match?.homeTeamCode : match?.awayTeamCode;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 sm:px-5 ${isPenaltyAwarded ? "bg-indigo-50/60" : ""}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[9px] font-black ${badgeClassName} ${
          isPenaltyAwarded ? "ring-2 ring-indigo-200/70" : ""
        }`}
      >
        {override ? override.icon : fallback?.glyph}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold capitalize text-slate-800">{summaryEventLabel(event.eventType)}</p>
        <EventDescription event={event} />
      </div>

      {teamCode && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${
          isHome ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
        }`}>
          {teamCode}
        </span>
      )}

      <span className="shrink-0 text-[10px] font-black tabular-nums text-slate-400">{event.minute}&apos;</span>
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
  const style = tone === "error"
    ? "border-rose-200 bg-rose-50 text-rose-600"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";

  return (
    <section className="flex min-h-55 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <span className={`grid h-11 w-11 place-items-center rounded-xl border ${style}`}>{icon}</span>
      <h2 className="mt-4 text-sm font-bold text-slate-800">{title}</h2>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{message}</p>
    </section>
  );
}

function SummarySkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        <div className="space-y-2">
          <span className="block h-2 w-20 animate-pulse rounded bg-slate-100" />
          <span className="block h-3 w-28 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <span className="block h-2 w-24 animate-pulse rounded bg-slate-100" />
              <span className="block h-2 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}