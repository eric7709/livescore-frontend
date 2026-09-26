"use client";

import {
  useGetMostSaves,
  useGetMostYellowCards,
  useGetMostRedCards,
} from "@/features/competition/utils/competition.api";
import PlayerRankingTable, { PlayerRankingDTO } from "./PlayerRankingTable";

export type RankingStat = "saves" | "yellow-cards" | "red-cards";

interface RankingStatPanelProps {
  competitionId?: number;
  stat: RankingStat;
}

type Accent = "emerald" | "sky" | "violet" | "amber" | "rose";

type UseRankingHook = (id?: number) => {
  data?: PlayerRankingDTO[];
  isLoading: boolean;
  isError: boolean;
};

interface StatConfig {
  useHook: UseRankingHook;
  unit: string;
  accent: Accent;
  errorMessage: string;
}

function getStatConfig(stat: RankingStat): StatConfig {
  switch (stat) {
    case "saves":
      return {
        useHook: useGetMostSaves,
        unit: "Saves",
        accent: "sky",
        errorMessage: "Couldn't load most saves.",
      };
    case "yellow-cards":
      return {
        useHook: useGetMostYellowCards,
        unit: "Yellow",
        accent: "amber",
        errorMessage: "Couldn't load most yellow cards.",
      };
    case "red-cards":
      return {
        useHook: useGetMostRedCards,
        unit: "Red",
        accent: "rose",
        errorMessage: "Couldn't load most red cards.",
      };
  }
}

export default function RankingStatPanel({ competitionId, stat }: RankingStatPanelProps) {
  const config = getStatConfig(stat);
  const { data: rankings, isLoading, isError } = config.useHook(competitionId);

  if (isLoading) {
    return (
      <div className="mx-auto mt-4 w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400 shadow-sm">
        {config.errorMessage}
      </div>
    );
  }

  return <PlayerRankingTable rankings={rankings} unit={config.unit} accent={config.accent} />;
}