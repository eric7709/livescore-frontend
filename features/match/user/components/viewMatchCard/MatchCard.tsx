"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, MapPin, Calendar, Trophy } from "lucide-react";
import { MatchPeriod, MatchStatus } from "@/features/match/utils/match.types";
import { useGetMatchById } from "@/features/match/utils/match.api";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Mirrors MatchEventService#PERIOD_BASE_MINUTE on the backend so the clock
// shown here always agrees with the minute stamped on new match events.
//
// NOTE: every period that represents *live play* (as opposed to a break)
// must appear here AND in RUNNING_CLOCK_PERIODS below, or useLiveMinute will
// silently return null for it and it'll be badged as a static break instead
// of a running clock.
const PERIOD_BASE_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 0,
  SECOND_HALF: 45,
  EXTRA_TIME_FIRST_HALF: 90,
  EXTRA_TIME_SECOND_HALF: 105,
  PENALTIES: 120,
};

// Regulation length of each running-play period. Once the live clock passes
// this, we stop ticking the displayed minute up and switch to "cap+N"
// stoppage-time notation instead (e.g. "45+3'") until the period changes.
// PENALTIES has no regulation length, so it's intentionally omitted and
// never gets capped.
const PERIOD_CAP_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 45,
  SECOND_HALF: 90,
  EXTRA_TIME_FIRST_HALF: 105,
  EXTRA_TIME_SECOND_HALF: 120,
};

// Mirrors MatchEventService#LIVE_PLAY_PERIODS — the only periods where a
// running clock makes sense. Breaks (HALF_TIME, etc.) get a static badge.
const RUNNING_CLOCK_PERIODS = new Set<MatchPeriod>([
  "FIRST_HALF",
  "SECOND_HALF",
  "EXTRA_TIME_FIRST_HALF",
  "EXTRA_TIME_SECOND_HALF",
  "PENALTIES",
]);

// Static (non-live) label for every status that isn't LIVE. FINISHED prefers
// "Full-time" wording, handled separately in StatusBadge since that's the
// football-specific term; this map covers the rest of MatchStatus.
const STATUS_BADGE_LABELS: Record<Exclude<MatchStatus, "LIVE" | "FINISHED">, string> = {
  SCHEDULED: "Upcoming",
  POSTPONED: "Postponed",
  CANCELLED: "Cancelled",
  ABANDONED: "Abandoned",
  SUSPENDED: "Suspended",
};

const PERIOD_BADGE_LABELS: Record<MatchPeriod, string> = {
  PRE_MATCH: "Pre-match",
  FIRST_HALF: "1st Half",
  HALF_TIME: "Half-time",
  SECOND_HALF: "2nd Half",
  EXTRA_TIME_FIRST_HALF: "ET · 1st",
  EXTRA_TIME_HALF_TIME: "ET · Break",
  EXTRA_TIME_SECOND_HALF: "ET · 2nd",
  PENALTIES: "Penalties",
  FULL_TIME: "Full-time",
};

// How long the score-changed highlight stays visible.
const SCORE_FLASH_DURATION_MS = 2500;

// A running-play minute, already capped at the period's regulation length.
// stoppage is 0 while inside regulation time and > 0 once play has run past
// the cap (e.g. { minute: 45, stoppage: 3 } displays as "45+3'").
interface LiveMinute {
  minute: number;
  stoppage: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);

  if (isToday) return `Today · ${time}`;

  const day = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Africa/Lagos",
  }).format(date);

  return `${day} · ${time}`;
}

// matchDate is the scheduled kickoff and is always present. startedAt is
// only set once the match has actually kicked off, so once it exists it's
// the more accurate "time started" — matchDate can be a stale scheduled
// slot if kickoff was delayed.
function resolveKickoffLabel(matchDate: string, startedAt: string | null): string {
  if (startedAt) {
    return `Kicked off ${formatDateTime(startedAt)}`;
  }
  return formatDateTime(matchDate);
}

function getCompetitionInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Renders a LiveMinute as display text: "12'" inside regulation time, or
// "45+3'" once play has run past the period's cap.
function formatLiveMinute({ minute, stoppage }: LiveMinute): string {
  return stoppage > 0 ? `${minute}+${stoppage}'` : `${minute}'`;
}

// Detects an increase in a score value across renders and exposes a boolean
// that flips true for SCORE_FLASH_DURATION_MS then auto-resets. Only flags a
// real increase (not the first render, not a reset to null/0), so it's safe
// to call unconditionally for both teams every render.
function useScoreFlash(score: number | null | undefined): boolean {
  const prevScore = useRef<number | null | undefined>(score);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (prevScore.current !== score) {
      if (prevScore.current != null && (score ?? 0) > prevScore.current) {
        setFlashing(true);
        const timeout = setTimeout(() => setFlashing(false), SCORE_FLASH_DURATION_MS);
        prevScore.current = score;
        return () => clearTimeout(timeout);
      }
      prevScore.current = score;
    }
  }, [score]);

  return flashing;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MatchCard() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const { data: match, isLoading, isError } = useGetMatchById(
    validMatchId ? matchId : undefined,
    {
      // Auto-refetch every 30 seconds (30,000 ms) ONLY when match is LIVE
      refetchInterval: (query) => (query.state.data?.status === "LIVE" ? 30000 : false),
    }
  );

  const isLive = match?.status === "LIVE";
  // Hooks are always called — never gated behind the early returns below —
  // so they stay safe even while match is still undefined during load.
  const liveMinute = useLiveMinute(match?.periodStartedAt, match?.period, isLive ?? false);
  const homeScoreFlashing = useScoreFlash(match?.homeScore);
  const awayScoreFlashing = useScoreFlash(match?.awayScore);

  function useLiveMinute(
    periodStartedAt: string | null | undefined,
    period: MatchPeriod | undefined,
    isLive: boolean,
  ): LiveMinute | null {
    const [now, setNow] = useState(() => Date.now());
    const tickable = isLive && !!period && RUNNING_CLOCK_PERIODS.has(period);

    useEffect(() => {
      if (!tickable) return;

      // Reset current timestamp on mount/period change
      setNow(Date.now());

      // Update every 10 seconds to keep clock fresh and responsive
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 10_000);

      return () => clearInterval(interval);
    }, [tickable, periodStartedAt, period]);

    return useMemo(() => {
      if (!tickable || !period || !periodStartedAt) return null;

      const baseMinute = PERIOD_BASE_MINUTE[period];
      if (baseMinute === undefined) return null;

      const startedAtMs = new Date(periodStartedAt).getTime();
      if (Number.isNaN(startedAtMs)) return null;

      const elapsedMs = now - startedAtMs;
      const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60_000));

      const rawMinute = baseMinute + elapsedMinutes;

      // Once play runs past the period's regulation length, freeze the
      // minute at the cap and report the overrun separately as stoppage
      // time (e.g. 48 raw minutes in the first half -> { minute: 45,
      // stoppage: 3 }, displayed as "45+3'"). Periods with no cap (e.g.
      // PENALTIES) just keep ticking normally.
      const cap = PERIOD_CAP_MINUTE[period];
      if (cap !== undefined && rawMinute > cap) {
        return { minute: cap, stoppage: rawMinute - cap };
      }
      return { minute: rawMinute, stoppage: 0 };
    }, [periodStartedAt, period, tickable, now]); // 'now' dependency triggers memo re-evaluation
  }

  if (!validMatchId) {
    return (
      <CardState icon={<AlertCircle size={18} />} title="Invalid match" message="No matchId found in the route." />
    );
  }

  if (isLoading || !match) {
    return <CardSkeleton />;
  }

  if (isError) {
    return (
      <CardState
        icon={<AlertCircle size={18} />}
        title="Match unavailable"
        message="This match could not be loaded right now."
      />
    );
  }

  const hasScore = match?.status !== "SCHEDULED" && match?.homeScore !== null && match?.awayScore !== null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Competition header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <Link href={`/competition/${match.competitionId}/fixtures`} className="flex min-w-0 items-center gap-2.5">
          {match.competitionLogoUrl ? (
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-white p-0.5 shadow-sm">
              <img
                src={match.competitionLogoUrl}
                alt={match.competitionName || "Competition"}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/50 text-[8px] font-bold text-slate-500">
              {match.competitionName ? getCompetitionInitials(match.competitionName) : "CUP"}
            </div>
          )}
          <span className="truncate text-[11px] font-semibold text-slate-700">
            {match.competitionName || "Competition"}
          </span>
        </Link>

        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate max-w-30">{match.stadium ?? "Venue TBC"}</span>
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <TeamLabel
          teamId={match.homeTeamId}
          code={match.homeTeamCode}
          name={match.homeTeamName}
          logoUrl={match.homeTeamLogoUrl}
          align="left"
        />

        <div className="flex shrink-0 flex-col items-center gap-1">
          {match.status === "SCHEDULED" ? (
            <span className="text-lg font-black tracking-wide text-slate-300">VS</span>
          ) : (
            <div className="flex items-baseline gap-2 tabular-nums">
              <span
                className={`rounded-lg px-2 text-3xl font-black text-slate-800 transition-colors duration-700 ${
                  homeScoreFlashing ? "bg-rose-100" : "bg-transparent"
                }`}
              >
                {hasScore ? match.homeScore : "–"}
              </span>
              <span className="text-lg font-bold text-slate-300">:</span>
              <span
                className={`rounded-lg px-2 text-3xl font-black text-slate-800 transition-colors duration-700 ${
                  awayScoreFlashing ? "bg-rose-100" : "bg-transparent"
                }`}
              >
                {hasScore ? match.awayScore : "–"}
              </span>
            </div>
          )}
          <span className="text-[9px] font-medium text-slate-400">
            {match.status === "SCHEDULED" ? "Kick-off" : match.status === "FINISHED" ? "FT" : ""}
          </span>
        </div>

        <TeamLabel
          teamId={match.awayTeamId}
          code={match.awayTeamCode}
          name={match.awayTeamName}
          logoUrl={match.awayTeamLogoUrl}
          align="right"
        />
      </div>

      {/* Footer with match info and status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
          <Calendar size={10} className="shrink-0" />
          <span>{resolveKickoffLabel(match.matchDate, match.startedAt)}</span>
        </div>

        <StatusBadge status={match.status} period={match.period} liveMinute={liveMinute} />
      </div>
    </div>
  );
}

function TeamLabel({
  teamId,
  code,
  name,
  logoUrl,
  align
}: {
  teamId: number | null;
  code: string;
  name: string | null;
  logoUrl?: string | null;
  align: "left" | "right"
}) {
  const content = (
    <>
      {logoUrl ? (
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white p-1 shadow-sm">
          <img
            src={logoUrl}
            alt={name || code}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400 ${align === "right" ? "order-1" : ""}`}>
          {code}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-black tracking-tight text-slate-800">{code}</p>
        <p className="truncate text-[10px] font-medium text-slate-400">{name ?? code}</p>
      </div>
    </>
  );

  const className = `flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`;

  // Only clickable once we actually have a teamId to route to — some
  // matches (e.g. TBD fixtures) may not have both teams assigned yet.
  if (teamId == null) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      href={`/team/${teamId}`}
      onClick={(e) => e.stopPropagation()}
      className={`${className} rounded-lg transition-opacity hover:opacity-70`}
    >
      {content}
    </Link>
  );
}

function StatusBadge({
  status,
  period,
  liveMinute,
}: {
  status: MatchStatus;
  period: MatchPeriod;
  liveMinute: LiveMinute | null;
}) {
  switch (status) {
    case "LIVE":
      if (liveMinute !== null) {
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-red-600">Live</span>
            <span className="text-[10px] font-black tabular-nums text-slate-500">{formatLiveMinute(liveMinute)}</span>
            <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">· {PERIOD_BADGE_LABELS[period]}</span>
          </div>
        );
      }
      // LIVE status but a break period (HALF_TIME, EXTRA_TIME_HALF_TIME, etc.)
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-600">
            {PERIOD_BADGE_LABELS[period]}
          </span>
        </div>
      );

    case "SUSPENDED":
      // Play stopped mid-match but not yet abandoned — visually distinct
      // from a scheduled break (amber, static) since this is unplanned.
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-orange-600">
            {STATUS_BADGE_LABELS.SUSPENDED}
          </span>
        </div>
      );

    case "FINISHED":
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Full-time</span>
        </div>
      );

    case "ABANDONED":
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-500">
            {STATUS_BADGE_LABELS.ABANDONED}
          </span>
        </div>
      );

    case "CANCELLED":
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-500">
            {STATUS_BADGE_LABELS.CANCELLED}
          </span>
        </div>
      );

    case "POSTPONED":
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
            {STATUS_BADGE_LABELS.POSTPONED}
          </span>
        </div>
      );

    case "SCHEDULED":
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600">
            {STATUS_BADGE_LABELS.SCHEDULED}
          </span>
        </div>
      );
  }
}

function CardState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200/80 bg-rose-50 text-rose-600">
        {icon}
      </span>
      <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      <p className="text-[11px] text-slate-500">{message}</p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 animate-pulse rounded-full bg-slate-200" />
          <span className="h-3 w-32 animate-pulse rounded bg-slate-200" />
        </div>
        <span className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
          <div>
            <span className="block h-4 w-12 animate-pulse rounded bg-slate-200" />
            <span className="mt-1 block h-3 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="h-8 w-14 animate-pulse rounded bg-slate-200" />
          <span className="h-2 w-10 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="block h-4 w-12 animate-pulse rounded bg-slate-200" />
            <span className="mt-1 block h-3 w-16 animate-pulse rounded bg-slate-200" />
          </div>
          <span className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <span className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <span className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}