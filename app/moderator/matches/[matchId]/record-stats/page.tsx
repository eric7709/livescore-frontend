"use client";

import { useEffect, useState, useMemo, type ElementType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Footprints,
  Lock,
  MapPin,
  Play,
  Radio,
  Timer,
  Trophy,
  RefreshCw,
} from "lucide-react";

import {
  MatchDTO,
  MatchPeriod,
  MatchRequest,
  MatchType,
} from "@/features/match/utils/match.types";
import { useGetMatchById, useUpdateMatch } from "@/features/match/utils/match.api";
import MainEventButtons from "@/features/matchEvent/components/manageMatchEvents/MainEventButtons";
import SubstitutionModal from "@/features/matchEvent/components/manageMatchEvents/SubstitutionModal";
import GoalAndAssistModal from "@/features/matchEvent/components/manageMatchEvents/GoalAndAssistModal";
import PenaltyAwardedModal from "@/features/matchEvent/components/manageMatchEvents/PenaltyAwardedModal";
import PenaltyMissedModal from "@/features/matchEvent/components/manageMatchEvents/PenaltyMissedModal";
import YellowCardModal from "@/features/matchEvent/components/manageMatchEvents/YellowCardModal";
import RedCardModal from "@/features/matchEvent/components/manageMatchEvents/RedCardModal";

type NextInfo = {
  nextPeriod: MatchPeriod | null;
  nextLabel: string | null;
};

type TeamTone = "home" | "away";

const NON_RECORDING_PERIODS = new Set<MatchPeriod>([
  "PRE_MATCH",
  "HALF_TIME",
  "EXTRA_TIME_HALF_TIME",
  "FULL_TIME",
]);

const PERIOD_BASE_MINUTE: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 0,
  SECOND_HALF: 45,
  EXTRA_TIME_FIRST_HALF: 90,
  EXTRA_TIME_SECOND_HALF: 105,
  PENALTIES: 120,
};

const PERIOD_DETAILS: Record<
  MatchPeriod,
  {
    short: string;
    description: string;
    progress: number;
    icon: ReactNode;
    tone: "emerald" | "amber" | "violet" | "orange" | "rose" | "slate";
  }
> = {
  PRE_MATCH: {
    short: "Pre-match",
    description: "Waiting for kickoff",
    progress: 4,
    icon: <Clock3 size={16} />,
    tone: "slate",
  },
  FIRST_HALF: {
    short: "1st Half",
    description: "First half in progress",
    progress: 26,
    icon: <Footprints size={16} />,
    tone: "emerald",
  },
  HALF_TIME: {
    short: "Half-time",
    description: "Break between halves",
    progress: 50,
    icon: <Timer size={16} />,
    tone: "amber",
  },
  SECOND_HALF: {
    short: "2nd Half",
    description: "Second half in progress",
    progress: 72,
    icon: <Footprints size={16} />,
    tone: "emerald",
  },
  EXTRA_TIME_FIRST_HALF: {
    short: "ET · 1st",
    description: "Extra time first period",
    progress: 83,
    icon: <Timer size={16} />,
    tone: "orange",
  },
  EXTRA_TIME_HALF_TIME: {
    short: "ET · Break",
    description: "Extra time break",
    progress: 87,
    icon: <Timer size={16} />,
    tone: "amber",
  },
  EXTRA_TIME_SECOND_HALF: {
    short: "ET · 2nd",
    description: "Extra time final period",
    progress: 91,
    icon: <Timer size={16} />,
    tone: "orange",
  },
  PENALTIES: {
    short: "Penalties",
    description: "Deciding by penalties",
    progress: 97,
    icon: <Award size={16} />,
    tone: "rose",
  },
  FULL_TIME: {
    short: "Full-time",
    description: "Match complete",
    progress: 100,
    icon: <CheckCircle2 size={16} />,
    tone: "slate",
  },
};

const TONE_STYLES = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

// -----------------------------------------------------------------------------
// Live Match Minute Hook
// -----------------------------------------------------------------------------
function useLiveMatchClock(period: MatchPeriod, periodStartedAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!periodStartedAt || NON_RECORDING_PERIODS.has(period)) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [period, periodStartedAt]);

  return useMemo(() => {
    const baseMinute = PERIOD_BASE_MINUTE[period];

    if (baseMinute === undefined || !periodStartedAt || NON_RECORDING_PERIODS.has(period)) {
      return null;
    }

    const startTime = new Date(periodStartedAt).getTime();
    if (isNaN(startTime)) return null;

    const diffSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
    const elapsedMinutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    const minute = baseMinute + elapsedMinutes;
    const formattedSecond = seconds.toString().padStart(2, "0");

    return {
      minute,
      seconds,
      displayTime: `${minute}'`,
      displayFull: `${minute}:${formattedSecond}'`,
    };
  }, [now, period, periodStartedAt]);
}

function getNextInfo(
  period: MatchPeriod,
  matchType: MatchType,
  homeScore: number,
  awayScore: number,
): NextInfo {
  const isDraw = homeScore === awayScore;

  const transitions: Record<MatchPeriod, () => NextInfo> = {
    PRE_MATCH: () => ({ nextPeriod: "FIRST_HALF", nextLabel: "Kick Off" }),
    FIRST_HALF: () => ({ nextPeriod: "HALF_TIME", nextLabel: "Half-time" }),
    HALF_TIME: () => ({ nextPeriod: "SECOND_HALF", nextLabel: "2nd Half" }),
    SECOND_HALF: () =>
      matchType === "KNOCKOUT" && isDraw
        ? { nextPeriod: "EXTRA_TIME_FIRST_HALF", nextLabel: "Extra Time" }
        : { nextPeriod: "FULL_TIME", nextLabel: "Full-time" },
    EXTRA_TIME_FIRST_HALF: () => ({ nextPeriod: "EXTRA_TIME_HALF_TIME", nextLabel: "ET Break" }),
    EXTRA_TIME_HALF_TIME: () => ({ nextPeriod: "EXTRA_TIME_SECOND_HALF", nextLabel: "ET · 2nd" }),
    EXTRA_TIME_SECOND_HALF: () =>
      isDraw
        ? { nextPeriod: "PENALTIES", nextLabel: "Penalties" }
        : { nextPeriod: "FULL_TIME", nextLabel: "Full-time" },
    PENALTIES: () => ({ nextPeriod: "FULL_TIME", nextLabel: "Full-time" }),
    FULL_TIME: () => ({ nextPeriod: null, nextLabel: null }),
  };

  return transitions[period]();
}

function buildAdvancePayload(match: MatchDTO, nextPeriod: MatchPeriod): MatchRequest {
  const status =
    match.status === "SCHEDULED" && nextPeriod === "FIRST_HALF"
      ? "LIVE"
      : nextPeriod === "FULL_TIME"
        ? "FINISHED"
        : match.status;

  return {
    homeTeamId: match.homeTeamId as number,
    awayTeamId: match.awayTeamId as number,
    competitionId: match.competitionId,
    stadium: match.stadium ?? undefined,
    matchDate: match.matchDate,
    matchType: match.matchType,
    status,
    period: nextPeriod,
  };
}

function TeamAvatar({
  code,
  logoUrl,
  tone,
  size = "md",
}: {
  code: string;
  logoUrl: string | null;
  tone: TeamTone;
  size?: "sm" | "md" | "lg";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const isHome = tone === "home";

  const sizes = {
    sm: "h-8 w-8 rounded-xl text-[9px]",
    md: "h-12 w-12 rounded-2xl text-[11px]",
    lg: "h-14 w-14 rounded-2xl text-[13px]",
  };

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden border ${sizes[size]} ${
        isHome
          ? "border-emerald-300 bg-emerald-100 text-emerald-700"
          : "border-sky-300 bg-sky-100 text-sky-700"
      }`}
      aria-label={`${code} crest`}
    >
      <span className="font-black tracking-tighter">{code.slice(0, 3)}</span>
      {logoUrl && !imageFailed && (
        <img
          src={logoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover bg-white"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}

export default function MatchControlPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const { data: match, isLoading, isError } = useGetMatchById(
    validMatchId ? matchId : undefined,
  );
  const updateMatch = useUpdateMatch();
  const [updateError, setUpdateError] = useState<string | null>(null);

  const clock = useLiveMatchClock(match?.period ?? "PRE_MATCH", match?.periodStartedAt);

  if (!validMatchId) {
    return <StatusCard icon={AlertCircle} tone="error" message="Invalid match ID" />;
  }

  if (isLoading) {
    return <StatusCard icon={Clock3} tone="neutral" message="Loading match control…" />;
  }

  if (isError || !match) {
    return <StatusCard icon={AlertCircle} tone="error" message="Could not load match" />;
  }

  if (!match.homeTeamId || !match.awayTeamId) {
    return <StatusCard icon={AlertCircle} tone="error" message="Missing team data" />;
  }

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const phase = PERIOD_DETAILS[match.period];
  const { nextPeriod, nextLabel } = getNextInfo(
    match.period,
    match.matchType,
    homeScore,
    awayScore,
  );
  const isRecordingOpen =
    match.status === "LIVE" &&
    !NON_RECORDING_PERIODS.has(match.period) &&
    match.period !== "FULL_TIME";
  const lineupsMissing = match.period === "PRE_MATCH" && !match.lineupSubmitted;

  const advanceMatch = () => {
    if (!nextPeriod) return;

    setUpdateError(null);
    updateMatch.mutate(
      { id: match.id, payload: buildAdvancePayload(match, nextPeriod) },
      {
        onError: (error) => {
          setUpdateError(
            error instanceof Error
              ? error.message
              : "Failed to update match. Please try again.",
          );
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background:radial-gradient(circle_at_10%_0%,rgba(16,185,129,.08),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,.06),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <ScoreHeader
          match={match}
          homeScore={homeScore}
          awayScore={awayScore}
          isRecordingOpen={isRecordingOpen}
          clock={clock}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Event Panel */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className={`grid h-8 w-8 place-items-center rounded-xl border ${
                  isRecordingOpen
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}>
                  {isRecordingOpen ? <Radio size={15} className="animate-pulse" /> : <Clock3 size={15} />}
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Match Operations</p>
                  <h2 className="text-xs font-bold text-slate-700">{isRecordingOpen ? "Live Event Centre" : "Event Tracker"}</h2>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                isRecordingOpen
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}>
                <Circle size={5} fill="currentColor" />
                {isRecordingOpen && clock ? clock.displayFull : phase.short}
              </span>
            </div>

            {isRecordingOpen ? (
              <div className="p-3">
                <MainEventButtons />
              </div>
            ) : (
              <PausedEventsCard phase={phase} lineupsMissing={lineupsMissing} />
            )}
          </section>

          {/* Control Panel */}
          <MatchControlPanel
            match={match}
            phase={phase}
            isRecordingOpen={isRecordingOpen}
            nextLabel={nextLabel}
            lineupsMissing={lineupsMissing}
            pending={updateMatch.isPending}
            updateError={updateError}
            clock={clock}
            onAdvance={advanceMatch}
          />
        </div>
      </div>

      <MatchEventModalLayer enabled={isRecordingOpen} />
    </main>
  );
}

function MatchEventModalLayer({ enabled }: { enabled: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled) return null;

  return createPortal(
    <div className="relative z-[9999]">
      <SubstitutionModal />
      <GoalAndAssistModal />
      <PenaltyAwardedModal />
      <PenaltyMissedModal />
      <YellowCardModal />
      <RedCardModal />
    </div>,
    document.body,
  );
}

function ScoreHeader({
  match,
  homeScore,
  awayScore,
  isRecordingOpen,
  clock,
}: {
  match: MatchDTO;
  homeScore: number;
  awayScore: number;
  isRecordingOpen: boolean;
  clock: { minute: number; seconds: number; displayTime: string; displayFull: string } | null;
}) {
  const phase = PERIOD_DETAILS[match.period];
  const showScore = match.status === "LIVE" || match.status === "FINISHED" || match.period === "PENALTIES";
  const homeCode = match.homeTeamCode || match.homeTeamName?.slice(0, 3) || "HOM";
  const awayCode = match.awayTeamCode || match.awayTeamName?.slice(0, 3) || "AWY";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(16,185,129,.04),transparent_40%,rgba(56,189,248,.03))]" />
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative px-4 py-3 sm:px-5 sm:py-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
              isRecordingOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}>
              {isRecordingOpen ? <Radio size={10} className="animate-pulse" /> : phase.icon}
              {isRecordingOpen && clock ? `${phase.short} • ${clock.displayFull}` : phase.short}
            </span>
            {match.competitionName && (
              <span className="hidden items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
                <Trophy size={11} />
                {match.competitionName}
              </span>
            )}
          </div>

          {match.stadium && (
            <span className="inline-flex max-w-full items-center gap-1 truncate text-[9px] font-medium text-slate-500">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{match.stadium}</span>
            </span>
          )}
        </div>

        {/* Score */}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
          {/* Home Team */}
          <Link
            href={`/team/${match.homeTeamId}`}
            className="flex min-w-0 items-center justify-end gap-2 text-right sm:gap-3 group transition-opacity hover:opacity-80"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-800 sm:text-base group-hover:text-emerald-600 transition-colors">
                {homeCode}
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Home</p>
            </div>
            <TeamAvatar code={homeCode} logoUrl={match.homeTeamLogoUrl} tone="home" size="md" />
          </Link>

          {/* Score / VS */}
          <div className="grid min-w-[72px] place-items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 sm:min-w-[110px] sm:px-4">
            {showScore ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="text-xl font-black tabular-nums tracking-tighter text-slate-800 sm:text-3xl">{homeScore}</span>
                <span className="text-sm font-light text-slate-400 sm:text-base">—</span>
                <span className="text-xl font-black tabular-nums tracking-tighter text-slate-800 sm:text-3xl">{awayScore}</span>
              </div>
            ) : (
              <span className="text-base font-black tracking-[0.2em] text-slate-400 sm:text-xl">VS</span>
            )}
            <span className="mt-0.5 text-[7px] font-black uppercase tracking-[0.18em] text-slate-400">
              {isRecordingOpen && clock ? clock.displayFull : phase.short}
            </span>
          </div>

          {/* Away Team */}
          <Link
            href={`/team/${match.awayTeamId}`}
            className="flex min-w-0 items-center gap-2 sm:gap-3 group transition-opacity hover:opacity-80"
          >
            <TeamAvatar code={awayCode} logoUrl={match.awayTeamLogoUrl} tone="away" size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-800 sm:text-base group-hover:text-sky-600 transition-colors">
                {awayCode}
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Away</p>
            </div>
          </Link>
        </div>

        {/* Status */}
        <div className="mt-2.5 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <span className="grid h-5 w-5 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">{phase.icon}</span>
          <span>{phase.description}</span>
        </div>
      </div>
    </div>
  );
}

function PausedEventsCard({
  phase,
  lineupsMissing,
}: {
  phase: (typeof PERIOD_DETAILS)[MatchPeriod];
  lineupsMissing: boolean;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-8 text-center sm:min-h-[340px]">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
        {phase.icon}
      </span>
      <p className="mt-4 text-sm font-black text-slate-700">Events Paused</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">{phase.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <Circle size={5} fill="currentColor" />
        {phase.short}
      </span>
      {lineupsMissing && (
        <div className="mt-4 flex max-w-md items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
          <Lock size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-700">Both teams must submit lineups before kickoff.</p>
        </div>
      )}
    </div>
  );
}

function MatchControlPanel({
  match,
  phase,
  isRecordingOpen,
  nextLabel,
  lineupsMissing,
  pending,
  updateError,
  clock,
  onAdvance,
}: {
  match: MatchDTO;
  phase: (typeof PERIOD_DETAILS)[MatchPeriod];
  isRecordingOpen: boolean;
  nextLabel: string | null;
  lineupsMissing: boolean;
  pending: boolean;
  updateError: string | null;
  clock: { minute: number; seconds: number; displayTime: string; displayFull: string } | null;
  onAdvance: () => void;
}) {
  const isComplete = match.period === "FULL_TIME";

  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isRecordingOpen ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.15)]" : "bg-slate-300"}`} />
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Control</p>
            <p className="text-xs font-bold text-slate-700">Match Flow</p>
          </div>
        </div>
        {match.matchType === "KNOCKOUT" && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">KO</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Current phase */}
        <div className={`rounded-xl border p-3 ${TONE_STYLES[phase.tone]}`}>
          <div className="flex items-start justify-between gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/50">{phase.icon}</span>
            {isRecordingOpen && (
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.14em] text-emerald-600">
                <Radio size={10} className="animate-pulse" /> Live
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-sm font-black tracking-tight text-slate-800">{phase.short}</p>
            {isRecordingOpen && clock && (
              <p className="text-base font-black tabular-nums tracking-tight text-emerald-600 font-mono">
                {clock.displayFull}
              </p>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{phase.description}</p>
        </div>

        {/* Progress */}
        <PhaseProgress period={match.period} progress={phase.progress} complete={isComplete} />

        {/* Action button */}
        <div className="mt-auto pt-4">
          {nextLabel ? (
            <button
              type="button"
              disabled={pending || lineupsMissing || isComplete}
              onClick={onAdvance}
              className={`group relative flex min-h-[44px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-3 text-xs font-black transition-all ${
                lineupsMissing
                  ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                  : "border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]"
              }`}
            >
              {!lineupsMissing && !pending && (
                <span className="absolute -left-8 top-[-120%] h-[300%] w-12 rotate-[22deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[480px]" />
              )}
              {lineupsMissing ? (
                <><Lock size={14} /><span>Lineups Required</span></>
              ) : pending ? (
                <><RefreshCw size={14} className="animate-spin" /><span>Updating…</span></>
              ) : (
                <><Play size={13} fill="currentColor" className="ml-[-2px]" /><span>{nextLabel}</span><ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          ) : (
            <div className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700">
              <CheckCircle2 size={15} /> Match Complete
            </div>
          )}

          {lineupsMissing && (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-[10px] leading-relaxed text-amber-700">Lineups must be submitted before kickoff.</p>
            </div>
          )}

          {updateError && (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="text-[10px] leading-relaxed text-rose-700">{updateError}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function PhaseProgress({
  period,
  progress,
  complete,
}: {
  period: MatchPeriod;
  progress: number;
  complete: boolean;
}) {
  const checkpoints = [
    { label: "Start", periods: ["PRE_MATCH", "FIRST_HALF"] as MatchPeriod[] },
    { label: "Half", periods: ["HALF_TIME", "SECOND_HALF"] as MatchPeriod[] },
    { label: "Decide", periods: ["EXTRA_TIME_FIRST_HALF", "EXTRA_TIME_HALF_TIME", "EXTRA_TIME_SECOND_HALF", "PENALTIES"] as MatchPeriod[] },
    { label: "End", periods: ["FULL_TIME"] as MatchPeriod[] },
  ];
  const activeIndex = checkpoints.findIndex((checkpoint) => checkpoint.periods.includes(period));

  return (
    <div className="mt-3.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Progress</span>
        <span className="text-[9px] font-black tabular-nums text-slate-600">{progress}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${complete ? "bg-emerald-300" : "bg-emerald-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {checkpoints?.map((checkpoint, index) => (
          <div key={checkpoint.label} className="min-w-0 text-center">
            <span className={`mx-auto block h-1 w-1 rounded-full ${index <= activeIndex ? "bg-emerald-500" : "bg-slate-200"}`} />
            <span className={`mt-1 block truncate text-[7px] font-bold uppercase tracking-wide ${index === activeIndex ? "text-slate-600" : "text-slate-400"}`}>{checkpoint.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  tone,
  message,
}: {
  icon: ElementType;
  tone: "error" | "neutral";
  message: string;
}) {
  const isError = tone === "error";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-xl border ${
          isError ? "border-rose-200 bg-rose-50 text-rose-500" : "border-emerald-200 bg-emerald-50 text-emerald-600"
        }`}>
          <Icon size={24} />
        </span>
        <p className="mt-4 text-sm font-bold text-slate-800">{message}</p>
        <p className="mt-1.5 text-xs text-slate-500">Return to the match list and try again.</p>
      </section>
    </main>
  );
}