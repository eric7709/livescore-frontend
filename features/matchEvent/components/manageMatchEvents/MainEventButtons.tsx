"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Circle, Clock3, Radio, Sparkles } from "lucide-react";

import { useGetMatchPlayerStats } from "@/features/matchLineup/utils/matchLineup.api";
import { useMatchTrackerStore } from "../../utils/matchTracker.store";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { useCreateMatchEvent, useGetMatchStats } from "../../utils/matchEvent.api";
import { MatchEventUtils, type TeamSide } from "../../utils/matchEvent.utils";
import {
  EventType,
  EventTypeCount,
  EVENT_LABELS,
  MODAL_EVENTS,
  REGISTER_ONLY_EVENTS,
} from "../../utils/matchEvent.types";

type Tab = "MODAL" | "REGISTER";

const TAB_EVENTS: Record<Tab, EventType[]> = {
  MODAL: MODAL_EVENTS,
  REGISTER: REGISTER_ONLY_EVENTS,
};

const TAB_COPY: Record<Tab, { label: string; caption: string }> = {
  REGISTER: {
    label: "Quick log",
    caption: "Two-tap team events",
  },
  MODAL: {
    label: "Detailed events",
    caption: "Choose player details",
  },
};

const TEAM_STYLE: Record<
  TeamSide,
  {
    button: string;
    pending: string;
    count: string;
    dot: string;
  }
> = {
  HOME: {
    button:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white",
    pending: "border-amber-300 bg-amber-100 text-amber-800",
    count: "bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white",
    dot: "bg-emerald-500",
  },
  AWAY: {
    button:
      "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-500 hover:bg-sky-600 hover:text-white",
    pending: "border-amber-300 bg-amber-100 text-amber-800",
    count: "bg-sky-100 text-sky-700 group-hover:bg-white/20 group-hover:text-white",
    dot: "bg-sky-500",
  },
};

// Labels can come from EVENT_LABELS or the generic formatter. Either way,
// normalize underscores to spaces so raw enum-style strings (e.g.
// "PENALTY_AWARDED") never leak into the UI as-is.
function formatEventLabel(eventType: EventType): string {
  const raw = EVENT_LABELS[eventType] ?? MatchEventUtils.formatLabel(eventType);
  return raw.replace(/_/g, " ");
}

// useGetMatchStats returns MatchStatistic[] — one bucket per period, each
// holding its own EventTypeCount[]. Flatten + sum across periods so badges
// show match-wide totals rather than only the current period's counts.
function buildCountsByType(
  matchStats: ReturnType<typeof useGetMatchStats>["data"],
): Map<EventType, EventTypeCount> {
  const counts = new Map<EventType, EventTypeCount>();

  matchStats?.forEach((periodStat) => {
    periodStat.statistics.forEach((item) => {
      const existing = counts.get(item.eventType);
      counts.set(item.eventType, {
        eventType: item.eventType,
        homeValue: (existing?.homeValue ?? 0) + item.homeValue,
        awayValue: (existing?.awayValue ?? 0) + item.awayValue,
      });
    });
  });

  return counts;
}

export default function MainEventButtons() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const [activeTab, setActiveTab] = useState<Tab>("REGISTER");
  const [firingKey, setFiringKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const { data: match } = useGetMatchById(validMatchId ? matchId : undefined);
  const { data: playerStats } = useGetMatchPlayerStats(matchId);
  const { data: matchStats } = useGetMatchStats(matchId);
  const { mutate: createEvent } = useCreateMatchEvent();
  const {
    openModal,
    setTeamId,
    setEventType,
    setTeamPlayersOut,
    setTeamPlayersIn,
    setGoalScorers,
  } = useMatchTrackerStore();

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current != null) window.clearTimeout(confirmTimerRef.current);
      if (feedbackTimerRef.current != null) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const countsByType = useMemo(() => buildCountsByType(matchStats), [matchStats]);

  const clearConfirmation = () => {
    if (confirmTimerRef.current != null) window.clearTimeout(confirmTimerRef.current);
    setConfirmKey(null);
  };

  const chooseEvent = (side: TeamSide, eventType: EventType) => {
    if (!match) return;

    const teamId = side === "HOME" ? match.homeTeamId : match.awayTeamId;
    const key = `${side}-${eventType}`;

    if (!teamId || !match.period) return;

    if (REGISTER_ONLY_EVENTS.includes(eventType)) {
      if (confirmKey !== key) {
        if (confirmTimerRef.current != null) window.clearTimeout(confirmTimerRef.current);
        setErrorMessage(null);
        setConfirmKey(key);
        confirmTimerRef.current = window.setTimeout(() => setConfirmKey(null), 3000);
        return;
      }

      clearConfirmation();
      setFiringKey(key);
      setErrorMessage(null);

      createEvent(
        {
          eventType,
          matchId,
          period: match.period,
          teamId,
          primaryPlayerId: null,
          secondaryPlayerId: null,
        },
        {
          onSuccess: () => {
            setFeedbackKey(key);
            if (feedbackTimerRef.current != null) window.clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = window.setTimeout(() => setFeedbackKey(null), 1500);
          },
          onError: (error) => {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "The event could not be recorded. Please try again.",
            );
          },
          onSettled: () => setFiringKey(null),
        },
      );
      return;
    }

    if (!playerStats) {
      setErrorMessage("Player data is still loading. Please wait a moment.");
      return;
    }

    setErrorMessage(null);
    clearConfirmation();
    setTeamId(teamId);
    setEventType(eventType);

    const selectedTeamStats = side === "HOME" ? playerStats.homeTeam : playerStats.awayTeam;

    if (eventType === "SUBSTITUTION") {
      setTeamPlayersOut(selectedTeamStats.filter((player) => player.subbable));
      setTeamPlayersIn(selectedTeamStats.filter((player) => player.ableToComeOn));
    }

    if (MatchEventUtils.isGoalEvent(eventType)) {
      setGoalScorers(selectedTeamStats.filter((player) => player.ableToScoreOrAssist));
    }

    openModal(eventType);
  };

  const homeName = MatchEventUtils.getCompactTeamName(
    match?.homeTeamName,
    match?.homeTeamCode,
    "Home",
  );
  const awayName = MatchEventUtils.getCompactTeamName(
    match?.awayTeamName,
    match?.awayTeamCode,
    "Away",
  );

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <header className="bg-white px-4 pb-0 pt-4 text-slate-900 sm:px-5 sm:pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Radio size={13} className="animate-pulse" />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-500">Live input</p>
            </div>
            <h3 className="mt-2 text-base font-black tracking-tight text-slate-900">Record match events</h3>
            <p className="mt-1 text-xs text-slate-500">Select a team, then select the event.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-700">
            <Circle size={6} fill="currentColor" className="animate-pulse" /> Live
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["REGISTER", "MODAL"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  clearConfirmation();
                  setErrorMessage(null);
                }}
                className={`relative rounded-t-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.13em]">
                  {TAB_COPY[tab].label}
                </span>
                <span className="mt-1 block text-[10px] font-medium opacity-60">
                  {TAB_COPY[tab].caption}
                </span>
                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-emerald-300" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-[0.14em]">
          <span className="inline-flex min-w-0 items-center gap-2 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="truncate">{homeName}</span>
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-slate-400 shadow-sm">
            {TAB_COPY[activeTab].label}
          </span>
          <span className="inline-flex min-w-0 items-center justify-end gap-2 text-sky-700">
            <span className="truncate">{awayName}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {TAB_EVENTS[activeTab].map((eventType) => {
          const homeKey = `HOME-${eventType}`;
          const awayKey = `AWAY-${eventType}`;
          const count = countsByType.get(eventType);

          return (
            <EventRow
              key={eventType}
              label={formatEventLabel(eventType)}
              visual={MatchEventUtils.getVisuals(eventType)}
              showIcon={activeTab === "MODAL"}
              homeName={homeName}
              awayName={awayName}
              homeCount={count?.homeValue ?? 0}
              awayCount={count?.awayValue ?? 0}
              homePending={confirmKey === homeKey}
              awayPending={confirmKey === awayKey}
              homeFiring={firingKey === homeKey}
              awayFiring={firingKey === awayKey}
              homeComplete={feedbackKey === homeKey}
              awayComplete={feedbackKey === awayKey}
              disabled={!match}
              onHome={() => chooseEvent("HOME", eventType)}
              onAway={() => chooseEvent("AWAY", eventType)}
            />
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        {activeTab === "REGISTER" ? (
          <p className="flex items-center gap-1.5 text-[10px] leading-4 text-slate-500">
            <Sparkles size={12} className="shrink-0 text-emerald-600" />
            Tap once to arm an event, then tap again to confirm it.
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-[10px] leading-4 text-slate-500">
            <Clock3 size={12} className="shrink-0 text-sky-600" />
            Player details are selected in the next step.
          </p>
        )}
        {errorMessage && (
          <span className="max-w-full rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">
            {errorMessage}
          </span>
        )}
      </footer>
    </section>
  );
}

function EventRow({
  label,
  visual,
  showIcon,
  homeName,
  awayName,
  homeCount,
  awayCount,
  homePending,
  awayPending,
  homeFiring,
  awayFiring,
  homeComplete,
  awayComplete,
  disabled,
  onHome,
  onAway,
}: {
  label: string;
  visual: ReturnType<typeof MatchEventUtils.getVisuals>;
  showIcon: boolean;
  homeName: string;
  awayName: string;
  homeCount: number;
  awayCount: number;
  homePending: boolean;
  awayPending: boolean;
  homeFiring: boolean;
  awayFiring: boolean;
  homeComplete: boolean;
  awayComplete: boolean;
  disabled: boolean;
  onHome: () => void;
  onAway: () => void;
}) {
  return (
    <div
      className={`grid items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 ${
        showIcon
          ? "grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_104px_minmax(0,1fr)]"
          : "grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)]"
      }`}
    >
      <TeamEventButton
        side="HOME"
        teamName={homeName}
        count={homeCount}
        pending={homePending}
        firing={homeFiring}
        complete={homeComplete}
        disabled={disabled || awayFiring}
        onClick={onHome}
      />

      <div className="grid justify-items-center gap-1 text-center">
        {showIcon && (
          <span className={`grid h-7 w-7 place-items-center rounded-lg border text-[9px] font-black ${visual.className}`}>
            {visual.glyph}
          </span>
        )}
        <span className="max-w-full whitespace-normal wrap-break-words text-[8px] font-black uppercase leading-tight tracking-[0.06em] text-slate-500 sm:text-[9px]">
          {label}
        </span>
      </div>

      <TeamEventButton
        side="AWAY"
        teamName={awayName}
        count={awayCount}
        pending={awayPending}
        firing={awayFiring}
        complete={awayComplete}
        disabled={disabled || homeFiring}
        onClick={onAway}
      />
    </div>
  );
}

function TeamEventButton({
  side,
  teamName,
  count,
  pending,
  firing,
  complete,
  disabled,
  onClick,
}: {
  side: TeamSide;
  teamName: string;
  count: number;
  pending: boolean;
  firing: boolean;
  complete: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const style = TEAM_STYLE[side];
  const align = side === "HOME" ? "justify-start text-left" : "justify-end text-right";
  const buttonCopy = firing ? "…" : complete ? "Logged" : pending ? "Confirm" : teamName;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-black transition-all duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-35 sm:px-3 ${align} ${
        pending
          ? style.pending
          : complete
            ? "border-emerald-300 bg-emerald-500 text-white"
            : style.button
      }`}
    >
      {side === "HOME" && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${pending ? "bg-amber-600" : complete ? "bg-white" : style.dot}`} />
      )}

      <span className="min-w-0 truncate">
        {complete ? (
          <span className="inline-flex items-center gap-1">
            <Check size={12} strokeWidth={3} /> {buttonCopy}
          </span>
        ) : (
          buttonCopy
        )}
      </span>

      {count > 0 && !pending && !firing && !complete && (
        <span className={`grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1 text-[9px] font-black ${style.count}`}>
          {count}
        </span>
      )}

      {side === "AWAY" && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${pending ? "bg-amber-600" : complete ? "bg-white" : style.dot}`} />
      )}
    </button>
  );
}