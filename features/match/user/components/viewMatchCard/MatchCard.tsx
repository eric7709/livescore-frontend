"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, MapPin, Calendar } from "lucide-react";
import { MatchPeriod, MatchStatus } from "@/features/match/utils/match.types";
import { useGetMatchById } from "@/features/match/utils/match.api";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PERIOD_BASE_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 0,
  SECOND_HALF: 45,
  EXTRA_TIME_FIRST_HALF: 90,
  EXTRA_TIME_SECOND_HALF: 105,
  PENALTIES: 120,
};

const PERIOD_CAP_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 45,
  SECOND_HALF: 90,
  EXTRA_TIME_FIRST_HALF: 105,
  EXTRA_TIME_SECOND_HALF: 120,
};

const RUNNING_CLOCK_PERIODS = new Set<MatchPeriod>([
  "FIRST_HALF",
  "SECOND_HALF",
  "EXTRA_TIME_FIRST_HALF",
  "EXTRA_TIME_SECOND_HALF",
  "PENALTIES",
]);

const STATUS_BADGE_LABELS: Record<
  Exclude<MatchStatus, "LIVE" | "FINISHED">,
  string
> = {
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

const SCORE_FLASH_DURATION_MS = 20_000;

/** Goal sound effect, served from /public. */
const GOAL_SOUND_SRC = "/goalsound.mp3";

interface LiveMinute {
  minute: number;
  stoppage: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

function resolveKickoffLabel(
  matchDate: string,
  startedAt: string | null,
): string {
  if (startedAt) return `Kicked off ${formatDateTime(startedAt)}`;
  return formatDateTime(matchDate);
}

function getCompetitionInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatLiveMinute({ minute, stoppage }: LiveMinute): string {
  return stoppage > 0 ? `${minute}+${stoppage}'` : `${minute}'`;
}

/* ------------------------------------------------------------------ */
/* Audio — shared <audio>, correctly primed and loaded                 */
/* ------------------------------------------------------------------ */

let sharedGoalAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
let unlockListenersAttached = false;
let audioLoadPromise: Promise<void> | null = null;

/**
 * Lazily create the shared <audio> element and start loading the file.
 * Explicit `.load()` is required on some browsers — setting `.src` alone
 * does not start fetching when the element is detached from the DOM.
 */
function getGoalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  if (!sharedGoalAudio) {
    const el = new Audio();
    el.src = GOAL_SOUND_SRC;
    el.preload = "auto";
    el.volume = 1;
    el.load();
    sharedGoalAudio = el;

    audioLoadPromise = new Promise<void>((resolve) => {
      if (el.readyState >= 3 /* HAVE_FUTURE_DATA */) {
        resolve();
        return;
      }
      const done = () => {
        el.removeEventListener("canplaythrough", done);
        el.removeEventListener("loadeddata", done);
        resolve();
      };
      el.addEventListener("canplaythrough", done, { once: true });
      el.addEventListener("loadeddata", done, { once: true });
    });
  }

  return sharedGoalAudio;
}

/**
 * Muted play/pause tick to earn autoplay unlock. Cheap no-op once unlocked.
 */
function primeAudioUnlock() {
  if (audioUnlocked) return;
  const audio = getGoalAudio();
  if (!audio) return;

  const wasMuted = audio.muted;
  const wasVolume = audio.volume;

  audio.muted = true;
  audio.volume = 0;

  const attempt = audio.play();
  if (attempt && typeof attempt.then === "function") {
    attempt
      .then(() => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          /* not seekable yet — ignore */
        }
        audio.muted = wasMuted;
        audio.volume = wasVolume;
        audioUnlocked = true;
      })
      .catch(() => {
        audio.muted = wasMuted;
        audio.volume = wasVolume;
      });
  }
}

function attachAudioUnlockListeners() {
  if (unlockListenersAttached || typeof window === "undefined") return;
  unlockListenersAttached = true;

  const unlock = () => primeAudioUnlock();

  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("focus", unlock);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") primeAudioUnlock();
  });
}

/**
 * Play the goal sound. Waits for load if necessary so we never call
 * play() on an empty element. Fully silent on failure.
 */
async function playGoalSound() {
  const audio = getGoalAudio();
  if (!audio) return;

  try {
    if (audio.readyState < 3 && audioLoadPromise) {
      await Promise.race([
        audioLoadPromise,
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);
    }

    audio.muted = false;
    audio.volume = 1;

    try {
      audio.currentTime = 0;
    } catch {
      /* not seekable — play from current position */
    }

    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      await attempt.catch(() => {
        /* autoplay blocked — silent */
      });
    }
  } catch {
    /* defensive — never throw from audio */
  }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/**
 * A live minute based on `periodStartedAt`, capped with stoppage notation.
 * Always called unconditionally (before any early return) so hook order
 * stays stable across renders.
 */
function useLiveMinute(
  periodStartedAt: string | null | undefined,
  period: MatchPeriod | undefined,
  isLive: boolean,
): LiveMinute | null {
  const [now, setNow] = useState(() => Date.now());

  const tickable = isLive && !!period && RUNNING_CLOCK_PERIODS.has(period);

  useEffect(() => {
    if (!tickable) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, [tickable, periodStartedAt, period]);

  return useMemo(() => {
    if (!tickable || !period || !periodStartedAt) return null;

    const baseMinute = PERIOD_BASE_MINUTE[period];
    if (baseMinute === undefined) return null;

    const startedAtMs = new Date(periodStartedAt).getTime();
    if (Number.isNaN(startedAtMs)) return null;

    const elapsedMinutes = Math.max(
      0,
      Math.floor((now - startedAtMs) / 60_000),
    );
    const rawMinute = baseMinute + elapsedMinutes;

    const cap = PERIOD_CAP_MINUTE[period];
    if (cap !== undefined && rawMinute > cap) {
      return { minute: cap, stoppage: rawMinute - cap };
    }
    return { minute: rawMinute, stoppage: 0 };
  }, [periodStartedAt, period, tickable, now]);
}

/**
 * True for SCORE_FLASH_DURATION_MS whenever the given score increases.
 */
function useScoreFlash(score: number | null | undefined): boolean {
  const prevScore = useRef<number | null | undefined>(score);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (prevScore.current !== score) {
      if (prevScore.current != null && (score ?? 0) > prevScore.current) {
        setFlashing(true);
        const timeout = setTimeout(
          () => setFlashing(false),
          SCORE_FLASH_DURATION_MS,
        );
        prevScore.current = score;
        return () => clearTimeout(timeout);
      }
      prevScore.current = score;
    }
  }, [score]);

  return flashing;
}

/**
 * Plays the goal sound once per goal (i.e. whenever the combined score
 * increases), and manages audio preload/unlock on mount.
 */
function useGoalSound(
  homeScore: number | null | undefined,
  awayScore: number | null | undefined,
) {
  const prevTotal = useRef<number | null>(
    homeScore == null && awayScore == null
      ? null
      : (homeScore ?? 0) + (awayScore ?? 0),
  );

  useEffect(() => {
    getGoalAudio();
    attachAudioUnlockListeners();
    primeAudioUnlock();
  }, []);

  useEffect(() => {
    if (homeScore == null && awayScore == null) return;
    const total = (homeScore ?? 0) + (awayScore ?? 0);

    if (prevTotal.current != null && total > prevTotal.current) {
      void playGoalSound();
    }
    prevTotal.current = total;
  }, [homeScore, awayScore]);
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function MatchCard() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const {
    data: match,
    isLoading,
    isError,
  } = useGetMatchById(validMatchId ? matchId : undefined, {
    refetchInterval: (query) =>
      query.state.data?.status === "LIVE" ? 30000 : false,
  });

  const isLive = match?.status === "LIVE";

  // All hooks run unconditionally — safe while match is undefined.
  const liveMinute = useLiveMinute(
    match?.periodStartedAt,
    match?.period,
    isLive ?? false,
  );
  const homeScoreFlashing = useScoreFlash(match?.homeScore);
  const awayScoreFlashing = useScoreFlash(match?.awayScore);
  useGoalSound(match?.homeScore, match?.awayScore);

  if (!validMatchId) {
    return (
      <CardState
        icon={<AlertCircle size={18} />}
        title="Invalid match"
        message="No matchId found in the route."
      />
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

  const hasScore =
    match.status !== "SCHEDULED" &&
    match.homeScore !== null &&
    match.awayScore !== null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <style>{`
        @keyframes score-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.32); }
          65% { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        .score-pop { animation: score-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1); }

        @keyframes team-name-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .team-name-pulse {
          display: inline-block;
          animation: team-name-pulse 0.9s ease-in-out infinite;
        }
      `}</style>

      {/* Competition header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <Link
          href={`/competition/${match.competitionId}/fixtures`}
          className="flex min-w-0 items-center gap-2.5"
        >
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
              {match.competitionName
                ? getCompetitionInitials(match.competitionName)
                : "CUP"}
            </div>
          )}
          <span className="truncate text-[11px] font-semibold text-slate-700">
            {match.competitionName || "Competition"}
          </span>
        </Link>

        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate max-w-30">
            {match.stadium ?? "Venue TBC"}
          </span>
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
          scoring={homeScoreFlashing}
        />

        <div className="flex shrink-0 flex-col items-center gap-1">
          {match.status === "SCHEDULED" ? (
            <span className="text-lg font-black tracking-wide text-slate-300">
              VS
            </span>
          ) : (
            <div className="flex items-baseline gap-2 tabular-nums">
              <span
                className={`inline-block rounded-lg px-2 text-3xl font-black transition-colors duration-500 ${
                  homeScoreFlashing ? "score-pop text-red-600" : "text-slate-800"
                }`}
              >
                {hasScore ? match.homeScore : "–"}
              </span>
              <span className="text-lg font-bold text-slate-300">:</span>
              <span
                className={`inline-block rounded-lg px-2 text-3xl font-black transition-colors duration-500 ${
                  awayScoreFlashing ? "score-pop text-red-600" : "text-slate-800"
                }`}
              >
                {hasScore ? match.awayScore : "–"}
              </span>
            </div>
          )}
          <span className="text-[9px] font-medium text-slate-400">
            {match.status === "SCHEDULED"
              ? "Kick-off"
              : match.status === "FINISHED"
                ? "FT"
                : ""}
          </span>
        </div>

        <TeamLabel
          teamId={match.awayTeamId}
          code={match.awayTeamCode}
          name={match.awayTeamName}
          logoUrl={match.awayTeamLogoUrl}
          align="right"
          scoring={awayScoreFlashing}
        />
      </div>

      {/* Footer with match info and status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
          <Calendar size={10} className="shrink-0" />
          <span>{resolveKickoffLabel(match.matchDate, match.startedAt)}</span>
        </div>

        <StatusBadge
          status={match.status}
          period={match.period}
          liveMinute={liveMinute}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team label                                                          */
/* ------------------------------------------------------------------ */

function TeamLabel({
  teamId,
  code,
  name,
  logoUrl,
  align,
  scoring = false,
}: {
  teamId: number | null;
  code: string;
  name: string | null;
  logoUrl?: string | null;
  align: "left" | "right";
  scoring?: boolean;
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
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400 ${
            align === "right" ? "order-1" : ""
          }`}
        >
          {code}
        </div>
      )}
      <div className="min-w-0">
        <p
          className={`text-sm font-black tracking-tight transition-colors duration-500 sm:text-base ${
            scoring ? "team-name-pulse text-red-600" : "text-slate-800"
          }`}
        >
          {code}
        </p>
        <p
          className={`truncate text-[10px] font-medium transition-colors duration-500 ${
            scoring ? "text-red-500" : "text-slate-400"
          }`}
        >
          {name ?? code}
        </p>
      </div>
    </>
  );

  const className = `flex min-w-0 flex-1 items-center gap-2.5 ${
    align === "right" ? "flex-row-reverse text-right" : "text-left"
  }`;

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

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

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
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-red-600">
              Live
            </span>
            <span className="text-[10px] font-black tabular-nums text-slate-500">
              {formatLiveMinute(liveMinute)}
            </span>
            <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">
              · {PERIOD_BADGE_LABELS[period]}
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-600">
            {PERIOD_BADGE_LABELS[period]}
          </span>
        </div>
      );

    case "SUSPENDED":
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
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
            Full-time
          </span>
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

/* ------------------------------------------------------------------ */
/* Fallback states                                                     */
/* ------------------------------------------------------------------ */

function CardState({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
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