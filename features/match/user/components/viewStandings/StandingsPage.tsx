"use client";

import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Radio, Target, Trophy } from "lucide-react";
import Link from "next/link";

import { useGetMatchById } from "@/features/match/utils/match.api";
import {
  useGetLiveTable,
  useGetStandings,
  useGetTopScorers,
} from "@/features/competition/utils/competition.api";
import {
  PlayerStatDTO,
  TeamStandingDTO,
} from "@/features/competition/utils/competition.types";

// -----------------------------------------------------------------------------
// Tabs & Constants
// -----------------------------------------------------------------------------

const TABS = [
  { key: "standings", label: "Standings" },
  { key: "live", label: "Live Standings" },
  { key: "scorers", label: "Top Scorers" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const FORM_STYLES: Record<string, string> = {
  W: "bg-emerald-100 text-emerald-700",
  D: "bg-slate-200 text-slate-600",
  L: "bg-rose-100 text-rose-600",
};

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------

export default function StandingsPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;
  const [activeTab, setActiveTab] = useState<TabKey>("standings");

  const {
    data: match,
    isLoading: isMatchLoading,
    isError: isMatchError,
  } = useGetMatchById(validMatchId ? matchId : undefined);

  const competitionId = match?.competitionId ?? undefined;
  const standings = useGetStandings(competitionId);
  const liveTable = useGetLiveTable(competitionId);
  const topScorers = useGetTopScorers(competitionId);

  if (!validMatchId) {
    return (
      <PanelState
        icon={<AlertCircle size={18} />}
        title="Invalid match"
        message="No valid match ID was found in the route."
        tone="error"
      />
    );
  }

  if (isMatchLoading) {
    return <TableSkeleton />;
  }

  if (isMatchError || !match) {
    return (
      <PanelState
        icon={<AlertCircle size={18} />}
        title="Match unavailable"
        message="The match could not be loaded, so competition data is unavailable."
        tone="error"
      />
    );
  }

  if (!competitionId) {
    return (
      <PanelState
        icon={<Trophy size={18} />}
        title="No competition"
        message="This match is not part of a competition, so there are no standings to show."
        tone="neutral"
      />
    );
  }

  const homeTeamId = match.homeTeamId ?? undefined;
  const awayTeamId = match.awayTeamId ?? undefined;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      <div className="p-4 sm:p-5">
        {activeTab === "standings" && (
          <StandingsTable
            data={standings.data}
            isLoading={standings.isLoading}
            isError={standings.isError}
            homeTeamId={homeTeamId}
            awayTeamId={awayTeamId}
          />
        )}

        {activeTab === "live" && (
          <>
            <div className="mb-3 flex items-center gap-1.5 text-emerald-600">
              <Radio size={12} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Updates as matches progress
              </span>
            </div>
            <StandingsTable
              data={liveTable.data}
              isLoading={liveTable.isLoading}
              isError={liveTable.isError}
              homeTeamId={homeTeamId}
              awayTeamId={awayTeamId}
            />
          </>
        )}

        {activeTab === "scorers" && (
          <PlayerLeaderboard
            icon={<Target size={18} />}
            statLabel="Goals"
            emptyLabel="goals"
            errorLabel="Top scorers"
            data={topScorers.data}
            getStatValue={(player) => player.numberOfGoals}
            isLoading={topScorers.isLoading}
            isError={topScorers.isError}
          />
        )}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Navigation Tabs
// -----------------------------------------------------------------------------

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav
      className="flex max-w-full gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Competition views"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.06em] transition-colors ${
              isActive
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

// -----------------------------------------------------------------------------
// Standings Table
// -----------------------------------------------------------------------------

function StandingsTable({
  data,
  isLoading,
  isError,
  homeTeamId,
  awayTeamId,
}: {
  data: TeamStandingDTO[] | undefined;
  isLoading: boolean;
  isError: boolean;
  homeTeamId?: number;
  awayTeamId?: number;
}) {
  if (isLoading) return <RowsSkeleton />;

  if (isError) {
    return (
      <InlineState
        icon={<AlertCircle size={16} />}
        message="Standings could not be loaded right now."
        tone="error"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <InlineState
        icon={<Trophy size={16} />}
        message="No standings are available yet."
        tone="neutral"
      />
    );
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <table className="w-full min-w-160 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.06em] text-slate-400">
            <th className="py-2 pr-2 font-black">#</th>
            <th className="min-w-37.5 py-2 pr-2 font-black">Team</th>
            <th className="px-2 py-2 text-center font-black">P</th>
            <th className="px-2 py-2 text-center font-black">W</th>
            <th className="px-2 py-2 text-center font-black">D</th>
            <th className="px-2 py-2 text-center font-black">L</th>
            <th className="px-2 py-2 text-center font-black">GF</th>
            <th className="px-2 py-2 text-center font-black">GA</th>
            <th className="px-2 py-2 text-center font-black">GD</th>
            <th className="px-2 py-2 text-center font-black">Pts</th>
            <th className="py-2 pl-2 font-black">Form</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {data.map((row, index) => {
            const isHome = homeTeamId != null && row.teamId === homeTeamId;
            const isAway = awayTeamId != null && row.teamId === awayTeamId;
            
            const rowStyle = isHome
              ? "bg-emerald-50/70 hover:bg-emerald-50 border-l-2 border-l-emerald-500"
              : isAway
              ? "bg-sky-50/70 hover:bg-sky-50 border-l-2 border-l-sky-500"
              : "border-l-2 border-l-transparent hover:bg-slate-50/70";

            return (
              <tr key={row.teamId ?? index} className={`transition-colors ${rowStyle}`}>
                <td className="py-2.5 pr-2 pl-2 font-bold text-slate-400">{index + 1}</td>
                <td
                  className={`py-2.5 pr-2 font-bold ${
                    isHome ? "text-emerald-800" : isAway ? "text-sky-800" : "text-slate-800"
                  }`}
                >
                  <Link href={`/team/${row.teamId}`}>
                    {row.teamName ?? "Unknown team"}
                  </Link>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.wins}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.draws}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.losses}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.goalsFor}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">{row.goalsAgainst}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="px-2 py-2.5 text-center font-black tabular-nums text-slate-800">
                  {row.points}
                </td>
                <td className="py-2.5 pl-2">
                  <FormBadges form={row.lastFive} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormBadges({ form }: { form?: string | null }) {
  const values = (form ?? "")
    .split("")
    .filter((value) => value in FORM_STYLES);

  if (values.length === 0) {
    return <span className="text-[10px] text-slate-300">—</span>;
  }

  return (
    <div className="flex gap-0.5">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={`grid h-4 w-4 place-items-center rounded text-[8px] font-black ${FORM_STYLES[value]}`}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Top Scorers Leaderboard
// -----------------------------------------------------------------------------

function PlayerLeaderboard({
  icon,
  statLabel,
  emptyLabel,
  errorLabel,
  data,
  getStatValue,
  isLoading,
  isError,
}: {
  icon: ReactNode;
  statLabel: string;
  emptyLabel: string;
  errorLabel: string;
  data: PlayerStatDTO[] | undefined;
  getStatValue: (player: PlayerStatDTO) => number | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <RowsSkeleton />;

  if (isError) {
    return (
      <InlineState
        icon={<AlertCircle size={16} />}
        message={`${errorLabel} could not be loaded right now.`}
        tone="error"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <InlineState
        icon={icon}
        message={`No ${emptyLabel} data is available yet.`}
        tone="neutral"
      />
    );
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <table className="w-full min-w-105 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.06em] text-slate-400">
            <th className="py-2 pr-2 font-black">#</th>
            <th className="py-2 pr-2 font-black">Player</th>
            <th className="min-w-35 py-2 pr-2 font-black">Team</th>
            <th className="px-2 py-2 text-center font-black">{statLabel}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {data.map((player, index) => (
            <tr key={player.playerId ?? index} className="transition-colors hover:bg-slate-50/70">
              <td className="py-2.5 pr-2 font-bold text-slate-400">{index + 1}</td>
              <td className="py-2.5 pr-2">
                <div className="flex items-center gap-2">
                  {player.teamLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.teamLogoUrl}
                      alt={player.teamName ?? "Team logo"}
                      className="h-6 w-6 shrink-0 rounded-full border border-slate-200 bg-white object-contain"
                    />
                  ) : (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                      {icon}
                    </span>
                  )}
                  <span className="truncate font-bold text-slate-800">
                    {player.name ?? "Unknown player"}
                  </span>
                </div>
              </td>
              <td className="py-2.5 pr-2 truncate font-medium text-slate-500">
                {player.teamName ?? "Unknown team"}
              </td>
              <td className="px-2 py-2.5 text-center font-black tabular-nums text-emerald-700">
                {getStatValue(player) ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Skeletons & State Indicators
// -----------------------------------------------------------------------------

function InlineState({
  icon,
  message,
  tone,
}: {
  icon: ReactNode;
  message: string;
  tone: "error" | "neutral";
}) {
  const style =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : "border-emerald-200 bg-emerald-50 text-emerald-600";

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className={`grid h-9 w-9 place-items-center rounded-xl border ${style}`}>{icon}</span>
      <p className="text-[11px] text-slate-500">{message}</p>
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
  const style =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-600"
      : "border-emerald-200 bg-emerald-50 text-emerald-600";

  return (
    <section className="flex min-h-45 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <span className={`grid h-9 w-9 place-items-center rounded-xl border ${style}`}>{icon}</span>
      <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      <p className="max-w-xs text-[11px] leading-5 text-slate-500">{message}</p>
    </section>
  );
}

function TableSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-1 overflow-hidden border-b border-slate-100 bg-slate-50 p-1">
        {TABS.map((tab) => (
          <span key={tab.key} className="h-7 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <RowsSkeleton />
    </section>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index} className="block h-8 w-full animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}