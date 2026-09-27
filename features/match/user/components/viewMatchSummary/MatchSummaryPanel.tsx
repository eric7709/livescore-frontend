"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { MatchDTO, MatchPeriod } from "@/features/match/utils/match.types";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchSummaries } from "@/features/matchEvent/utils/matchEvent.api";
import {
  EventType,
  MatchEventDTO,
} from "@/features/matchEvent/utils/matchEvent.types";
import { MatchEventUtils } from "@/features/matchEvent/utils/matchEvent.utils";
import { useMatchLiveUpdates } from "@/features/match/utils/useMatchLiveUpdates";

/* ------------------------------------------------------------------ */
/*  Icon set v3 — solid glyph style: filled shapes, no strokes, 24×24. */
/*  A totally different visual language from the outline sets before  */
/*  (flat, iconography-badge style rather than sketched line art).    */
/* ------------------------------------------------------------------ */

/** Goal — filled ball with a simple curved seam, sitting in a net notch. */
function BallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.16" />
      <circle cx="12" cy="12" r="6" fill="currentColor" />
      <path
        d="M12 8.6 14.1 10 13.3 12.5H10.7L9.9 10 12 8.6Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

/** Own goal — filled ball with a bent-back return arrow. */
function OwnGoalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="14" cy="12" r="7" fill="currentColor" opacity="0.16" />
      <circle cx="14" cy="12" r="4.6" fill="currentColor" />
      <path
        d="M6.5 6.5c-2.3 2-2.3 9 0 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M4 8 6.5 6.5 8 9" fill="currentColor" />
    </svg>
  );
}

/** Yellow card. */
function YellowCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" fill="#FACC15" />
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" fill="none" stroke="#B45309" strokeWidth="1" />
    </svg>
  );
}

/** Red card. */
function RedCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" fill="#E11D48" />
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" fill="none" stroke="#9F1239" strokeWidth="1" />
    </svg>
  );
}

/**
 * Second yellow → red: a fanned PAIR of cards, both fully visible — a
 * smaller yellow card tucked behind-left, a red card in front-right on top.
 * (Previously these were both centered in the same spot, so the red card
 * completely covered the yellow one and it just read as a plain red card.)
 */
function YellowRedCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* Yellow card — behind, shifted left, slightly rotated */}
      <g transform="rotate(-10 8 12)">
        <rect x="3.2" y="4" width="9" height="14.5" rx="1.6" fill="#FACC15" />
        <rect x="3.2" y="4" width="9" height="14.5" rx="1.6" fill="none" stroke="#B45309" strokeWidth="0.9" />
      </g>
      {/* Red card — in front, shifted right, slightly rotated the other way */}
      <g transform="rotate(10 16 12)">
        <rect x="11.8" y="4" width="9" height="14.5" rx="1.6" fill="#E11D48" />
        <rect x="11.8" y="4" width="9" height="14.5" rx="1.6" fill="none" stroke="#9F1239" strokeWidth="0.9" />
      </g>
    </svg>
  );
}

/** Substitution — solid opposing chevron triangles. */
function SubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3.5 8h11l-3-3.2 1.4-1.3L18.5 8l-5.6 4.5-1.4-1.3 3-3.2h-11Z" fill="currentColor" />
      <path d="M20.5 16h-11l3 3.2-1.4 1.3L5.5 16l5.6-4.5 1.4 1.3-3 3.2h11Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/** Penalty awarded — filled target / crosshair mark. */
function PenaltyAwardedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Penalty missed — target with a diagonal strike. */
function PenaltyMissedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="11" cy="13" r="7.5" fill="currentColor" opacity="0.14" />
      <circle cx="11" cy="13" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="11" cy="13" r="1.6" fill="currentColor" />
      <path d="M16.5 4.5 20.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.5 4.5 16.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Boot — solid silhouette. */
function BootIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 19c-.8 0-1.5-.7-1.5-1.5V13c0-.8.7-1.5 1.5-1.5h2.6c.6 0 1.2-.2 1.7-.6l3-2.4c.6-.5 1.4-.8 2.2-.8h3.3c1.5 0 2.7 1.2 2.7 2.7 0 3.6-2.9 6.6-6.6 6.6H4Z"
        fill="currentColor"
      />
      <rect x="2.5" y="18" width="19" height="2" rx="1" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/** Flag — offside, solid pennant. */
function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="3" width="1.8" height="18" rx="0.9" fill="currentColor" />
      <path d="M6.8 4.5h10.7l-2.6 3.1 2.6 3.1H6.8Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/** Corner — solid quarter-disc with ball. */
function CornerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 20V4h2v14h14v2Z" fill="currentColor" opacity="0.55" />
      <path d="M4 20a9 9 0 0 1 9-9v2a7 7 0 0 0-7 7Z" fill="currentColor" />
      <circle cx="7.5" cy="16.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Throw-in — solid upward triangle. */
function ThrowInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3.5 20 19H4Z" fill="currentColor" opacity="0.85" />
      <rect x="8.5" y="15" width="7" height="1.8" rx="0.9" fill="white" opacity="0.85" />
    </svg>
  );
}

/** Goal kick — solid diagonal arrow with dot. */
function GoalKickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="17.5" width="9" height="2" rx="1" fill="currentColor" opacity="0.5" />
      <path d="M12 15.5 8.8 8.5h3.4l1.7 3.6h3.3L14 8.5l1.4-1.4 5.4 5.4-6.2 6.2Z" fill="currentColor" />
    </svg>
  );
}

/** Save — solid glove/shield shape. */
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 3 19 6v5.5c0 5-3 8-7 9.5-4-1.5-7-4.5-7-9.5V6Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M12 5 17 7.2v4.3c0 3.7-2.2 6-5 7.3-2.8-1.3-5-3.6-5-7.3V7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Foul — solid whistle badge. */
function WhistleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="10.5" cy="13.5" r="6.5" fill="currentColor" opacity="0.16" />
      <circle cx="10.5" cy="13.5" r="4.2" fill="currentColor" />
      <rect x="15.5" y="11.5" width="5.5" height="4" rx="1.4" fill="currentColor" />
      <path d="M9.5 8 8.2 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** VAR — solid monitor with a play mark. */
function VarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="12.5" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="2.5" y="4.5" width="19" height="12.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.2 15.5 10.8 10 13.4Z" fill="currentColor" />
      <rect x="8.5" y="19.5" width="7" height="1.8" rx="0.9" fill="currentColor" />
    </svg>
  );
}

/** Injury — solid cross badge. */
function InjuryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />
      <path d="M10.3 5.5h3.4v4.8h4.8v3.4h-4.8v4.8h-3.4v-4.8H5.5v-3.4h4.8Z" fill="currentColor" />
    </svg>
  );
}

/** Kick-off — solid ball with motion mark. */
function KickOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="9.5" cy="14.5" r="6.5" fill="currentColor" opacity="0.16" />
      <circle cx="9.5" cy="14.5" r="4.3" fill="currentColor" />
      <path d="M15 8 20 3M15.5 3.3 20 3 19.7 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Half/full time — solid clock disc. */
function ClockMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.3l3 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Fallback — solid dot badge. */
function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />
      <circle cx="12" cy="12" r="3.6" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon dispatch                                                      */
/* ------------------------------------------------------------------ */

function EventIcon({ eventType, className }: { eventType: EventType; className?: string }) {
  switch (eventType) {
    case "GOAL":
    case "PENALTY_GOAL":
    case "FREE_KICK_GOAL":
    case "LONG_RANGE_GOAL":
      return <BallIcon className={className} />;
    case "OWN_GOAL":
      return <OwnGoalIcon className={className} />;
    case "YELLOW_CARD":
      return <YellowCardIcon className={className} />;
    case "RED_CARD":
      return <RedCardIcon className={className} />;
    case "YELLOW_RED_CARD":
      return <YellowRedCardIcon className={className} />;
    case "SUBSTITUTION":
      return <SubIcon className={className} />;
    case "PENALTY_AWARDED":
      return <PenaltyAwardedIcon className={className} />;
    case "PENALTY_MISSED":
      return <PenaltyMissedIcon className={className} />;
    case "CORNER":
      return <CornerIcon className={className} />;
    case "FREE_KICK":
      return <BootIcon className={className} />;
    case "THROW_IN":
      return <ThrowInIcon className={className} />;
    case "GOAL_KICK":
      return <GoalKickIcon className={className} />;
    case "OFFSIDE":
      return <FlagIcon className={className} />;
    case "FOUL":
      return <WhistleIcon className={className} />;
    case "SHOT_ON_TARGET":
    case "SHOT_OFF_TARGET":
    case "SHOT_BLOCKED":
      return <BootIcon className={className} />;
    case "SAVE":
      return <SaveIcon className={className} />;
    case "KICK_OFF":
      return <KickOffIcon className={className} />;
    case "HALF_TIME":
    case "FULL_TIME":
      return <ClockMarkIcon className={className} />;
    case "VAR_REVIEW":
      return <VarIcon className={className} />;
    case "INJURY":
      return <InjuryIcon className={className} />;
    default:
      return <DotIcon className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Visual theming                                                     */
/* ------------------------------------------------------------------ */

function eventTone(eventType: EventType): { tile: string } {
  switch (eventType) {
    case "GOAL":
    case "PENALTY_GOAL":
    case "FREE_KICK_GOAL":
    case "LONG_RANGE_GOAL":
      return { tile: "border-emerald-200 bg-emerald-50 text-emerald-600" };
    case "OWN_GOAL":
      return { tile: "border-orange-200 bg-orange-50 text-orange-600" };
    case "YELLOW_CARD":
      return { tile: "border-amber-200 bg-amber-50 text-amber-600" };
    case "RED_CARD":
    case "YELLOW_RED_CARD":
    case "PENALTY_MISSED":
      return { tile: "border-rose-200 bg-rose-50 text-rose-600" };
    case "SUBSTITUTION":
      return { tile: "border-sky-200 bg-sky-50 text-sky-600" };
    case "PENALTY_AWARDED":
      return { tile: "border-indigo-200 bg-indigo-50 text-indigo-600" };
    case "VAR_REVIEW":
      return { tile: "border-violet-200 bg-violet-50 text-violet-600" };
    case "INJURY":
      return { tile: "border-red-200 bg-red-50 text-red-600" };
    default:
      return { tile: "border-slate-200 bg-slate-50 text-slate-500" };
  }
}

function formatPeriodLabel(label: string): string {
  return label.toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Live minute ticker                                                 */
/* ------------------------------------------------------------------ */

const PERIOD_BASE_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 0,
  SECOND_HALF: 45,
  EXTRA_TIME_FIRST: 90,
  EXTRA_TIME_SECOND: 105,
} as Partial<Record<MatchPeriod, number>>;

// Regulation cap per period — once the minute exceeds this, display switches
// to "cap+extra" stoppage-time notation (e.g. "45+2'").
const PERIOD_CAP: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 45,
  SECOND_HALF: 90,
  EXTRA_TIME_FIRST: 105,
  EXTRA_TIME_SECOND: 120,
} as Partial<Record<MatchPeriod, number>>;

const NON_TIMED_PERIODS: MatchPeriod[] = ["PENALTIES"] as MatchPeriod[];

/** Formats a raw elapsed minute for a given period as stoppage-time-aware text. */
function formatMatchMinute(minute: number, period: MatchPeriod | undefined): string {
  const cap = period ? PERIOD_CAP[period] : undefined;
  if (cap !== undefined && minute > cap) {
    return `${cap}+${minute - cap}`;
  }
  return `${minute}`;
}

function useLiveMinute(match: MatchDTO | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());

  const isTicking =
    !!match?.periodStartedAt && !NON_TIMED_PERIODS.includes(match.period);

  useEffect(() => {
    if (!isTicking) return;
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

/* ------------------------------------------------------------------ */
/*  Row content                                                        */
/* ------------------------------------------------------------------ */

const ASSISTABLE_GOAL_TYPES: EventType[] = ["GOAL", "FREE_KICK_GOAL"];

function RowContent({ event }: { event: MatchEventDTO }) {
  if (event.eventType === "SUBSTITUTION") {
    return (
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-slate-900">
          {event.secondaryPlayerName ?? "Unknown"}
        </p>
        <p className="truncate text-[11px] text-slate-400">
          for <span className="text-slate-500">{event.primaryPlayerName ?? "Unknown"}</span>
        </p>
      </div>
    );
  }

  if (event.eventType === "OWN_GOAL") {
    return (
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-[13px] font-bold text-slate-900">
          {event.primaryPlayerName ?? "Unknown"}
        </span>
        <span className="shrink-0 rounded-md bg-orange-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-orange-600 ring-1 ring-inset ring-orange-200/70">
          OG
        </span>
      </div>
    );
  }

  if (event.eventType === "PENALTY_AWARDED") {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="live-pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
        <p className="truncate text-[13px] font-bold text-slate-900">Penalty awarded</p>
      </div>
    );
  }

  if (ASSISTABLE_GOAL_TYPES.includes(event.eventType) && event.secondaryPlayerName) {
    return (
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-slate-900">
          {event.primaryPlayerName ?? "Unknown"}
        </p>
        <p className="truncate text-[11px] text-slate-400">
          assist: <span className="font-semibold text-slate-500">{event.secondaryPlayerName}</span>
        </p>
      </div>
    );
  }

  if (event.primaryPlayerName) {
    return (
      <p className="truncate text-[13px] font-bold text-slate-900">
        {event.primaryPlayerName}
      </p>
    );
  }

  return (
    <p className="truncate text-[13px] font-bold text-slate-900">
      {MatchEventUtils.formatLabel(event.eventType)}
    </p>
  );
}

function getCreditedTeamId(event: MatchEventDTO, match: MatchDTO | undefined): number | null {
  if (event.teamId == null) return null;
  if (event.eventType !== "OWN_GOAL" || !match) return event.teamId;
  return event.teamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

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
        title="Summary unavailable"
        message="The match summary could not be loaded right now."
        tone="error"
      />
    );
  }

  if (!periods?.length) {
    return (
      <PanelState
        title="No events yet"
        message="Goals, cards, penalties, and substitutions will appear here as they happen."
        tone="neutral"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        .live-pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      <div className="divide-y divide-slate-100">
        {periods.map((period) => {
          const isCurrentPeriod = match?.period === period.period;
          const showLiveMinute = isCurrentPeriod && liveMinute !== null;

          return (
            <section key={period.period}>
              {/* Period header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/95 px-4 py-2 backdrop-blur-sm sm:px-5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {formatPeriodLabel(period.periodLabel)}
                  </span>
                  {showLiveMinute && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 ring-1 ring-inset ring-emerald-200/70">
                      <span className="live-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold tabular-nums text-emerald-700">
                        {formatMatchMinute(liveMinute as number, match?.period)}&apos;
                      </span>
                    </span>
                  )}
                </div>

                {/* Scoreboard */}
                <div className="flex shrink-0 items-center gap-2">
                  {match?.homeTeamCode && (
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">
                      {match.homeTeamCode}
                    </span>
                  )}
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-black tabular-nums text-slate-800 ring-1 ring-inset ring-slate-200">
                    {period.homeScore}–{period.awayScore}
                  </span>
                  {match?.awayTeamCode && (
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-sky-700">
                      {match.awayTeamCode}
                    </span>
                  )}
                </div>
              </div>

              {period.summaries.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {period.summaries.map((event) => (
                    <SummaryRow key={event.id} event={event} match={match} period={period.period} />
                  ))}
                </div>
              ) : (
                <div className="flex h-10 items-center">
                  <p className="px-4 py-3 text-[11px] text-slate-400 sm:px-5">
                    No events in this period.
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Row — icon · name · team abbr · minute                             */
/* ------------------------------------------------------------------ */

function SummaryRow({
  event,
  match,
  period,
}: {
  event: MatchEventDTO;
  match: MatchDTO | undefined;
  period: MatchPeriod;
}) {
  const tone = eventTone(event.eventType);
  const isPenaltyGoal = event.eventType === "PENALTY_GOAL";
  const isPenaltyAwarded = event.eventType === "PENALTY_AWARDED";
  const isGoalLike =
    event.eventType === "GOAL" ||
    event.eventType === "PENALTY_GOAL" ||
    event.eventType === "FREE_KICK_GOAL" ||
    event.eventType === "LONG_RANGE_GOAL";

  const creditedTeamId = getCreditedTeamId(event, match);
  const isHome = match != null && creditedTeamId === match.homeTeamId;
  const teamCode = isHome ? match?.homeTeamCode : match?.awayTeamCode;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors sm:px-5 ${
        isPenaltyAwarded ? "bg-indigo-50/50" : ""
      } ${isGoalLike ? "hover:bg-emerald-50/30" : "hover:bg-slate-50/60"}`}
    >
      {/* Icon tile */}
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${tone.tile} ${
          isPenaltyAwarded ? "ring-2 ring-indigo-200/70" : ""
        }`}
      >
        <EventIcon eventType={event.eventType} className="h-[18px] w-[18px]" />
      </span>

      {/* Headline + secondary line — Pen tag now trails the player name */}
      <div className="min-w-0 flex-1">
        {isPenaltyGoal ? (
          <div className="flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <RowContent event={event} />
            </div>
            <span className="shrink-0 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-indigo-600 ring-1 ring-inset ring-indigo-200/70">
              Pen
            </span>
          </div>
        ) : (
          <RowContent event={event} />
        )}
      </div>

      {/* Team abbreviation */}
      {teamCode && (
        <span
          className={`shrink-0 text-[10px] font-black uppercase tracking-[0.08em] ${
            isHome ? "text-emerald-700" : "text-sky-700"
          }`}
        >
          {teamCode}
        </span>
      )}

      {/* Minute */}
      <span className="w-10 shrink-0 text-right text-[11px] font-black tabular-nums text-slate-400">
        {formatMatchMinute(event.minute, period)}&apos;
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  States                                                             */
/* ------------------------------------------------------------------ */

function PanelState({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone: "error" | "neutral";
}) {
  const style =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : "border-emerald-200 bg-emerald-50 text-emerald-600";

  return (
    <section className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <span className={`grid h-10 w-10 place-items-center rounded-xl border ${style}`}>
        {tone === "error" ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.14" />
            <path d="M12 7v5.5M12 15.5v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        ) : (
          <BallIcon className="h-5 w-5" />
        )}
      </span>
      <h2 className="mt-3 text-sm font-bold text-slate-800">{title}</h2>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{message}</p>
    </section>
  );
}

function SummarySkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
            <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <span className="block h-2.5 w-28 animate-pulse rounded bg-slate-100" />
              <span className="block h-2 w-20 animate-pulse rounded bg-slate-100" />
            </div>
            <span className="h-2.5 w-8 animate-pulse rounded bg-slate-100" />
            <span className="h-2.5 w-6 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}