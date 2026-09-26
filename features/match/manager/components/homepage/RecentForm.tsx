"use client";

import React, { useMemo } from "react";
import { Trophy, Flame, Target, ShieldAlert } from "lucide-react";
import { Result } from "@/features/team/utils/team.types";

interface GameResult {
  id: string;
  opponent: string;
  result: "W" | "D" | "L";
  score: string;
  goalsScored: number;
  goalsConceded: number;
}

interface LastTenFormProps {
  teamId: number | string;
  games?: Result[];
  isLoading?: boolean;
}

const resultStyles: Record<string, string> = {
  W: "border-green-100 bg-green-50 text-green-600",
  D: "border-yellow-100 bg-yellow-50 text-yellow-600",
  L: "border-red-100 bg-red-50 text-red-600",
};

export default function RecentForm({
  teamId,
  games,
  isLoading = false,
}: LastTenFormProps) {
  const lastTenGames: GameResult[] = useMemo(() => {
    if (!games) return [];

    return games.slice(0, 10).map((game) => {
      const isHome = String(game.homeTeamId) === String(teamId);

      const opponent = isHome
        ? game.awayTeamName
        : game.homeTeamName;

      const goalsScored = isHome
        ? game.homeScore
        : game.awayScore;

      const goalsConceded = isHome
        ? game.awayScore
        : game.homeScore;

      return {
        id: game.matchId,
        opponent,
        result: game.badge,
        score: `${game.homeScore}-${game.awayScore}`,
        goalsScored,
        goalsConceded,
      };
    });
  }, [games, teamId]);

  const gameCount = lastTenGames.length;

  const stats = lastTenGames.reduce(
    (acc, game) => {
      if (game.result === "W") acc.wins += 1;
      else if (game.result === "D") acc.draws += 1;
      else if (game.result === "L") acc.losses += 1;

      acc.goalsScored += game.goalsScored;
      acc.goalsConceded += game.goalsConceded;

      return acc;
    },
    {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
    }
  );

  const goalDifference =
    stats.goalsScored - stats.goalsConceded;

  const perGame = (total: number) =>
    gameCount > 0
      ? (total / gameCount).toFixed(1)
      : "0.0";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Last {gameCount || 10} Games Form
          </h2>

          <p className="mt-0.5 text-xs text-gray-400">
            Recent performance breakdown
          </p>
        </div>

        {/* Form */}
        <div className="flex shrink-0 items-center gap-1.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="h-6 w-6 animate-pulse rounded-md bg-gray-100"
              />
            ))
          ) : gameCount === 0 ? (
            <span className="text-xs text-gray-400">
              No recent matches
            </span>
          ) : (
            lastTenGames.map((game) => (
              <span
                key={game.id}
                title={`${game.opponent} (${game.score})`}
                className={`flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-bold ${
                  resultStyles[game.result] ??
                  "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {game.result}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {/* Record */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            <Trophy size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400">
              Record
            </p>

            <p className="mt-0.5 text-sm font-bold">
              <span className="text-green-600">
                {stats.wins}W
              </span>{" "}
              <span className="text-gray-300">-</span>{" "}
              <span className="text-yellow-600">
                {stats.draws}D
              </span>{" "}
              <span className="text-gray-300">-</span>{" "}
              <span className="text-red-600">
                {stats.losses}L
              </span>
            </p>
          </div>
        </div>

        {/* Goals Scored */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            <Target size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400">
              Goals Scored
            </p>

            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {stats.goalsScored}{" "}
              <span className="text-[10px] font-normal text-gray-400">
                ({perGame(stats.goalsScored)}/g)
              </span>
            </p>
          </div>
        </div>

        {/* Goals Conceded */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            <ShieldAlert size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400">
              Conceded
            </p>

            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {stats.goalsConceded}{" "}
              <span className="text-[10px] font-normal text-gray-400">
                ({perGame(stats.goalsConceded)}/g)
              </span>
            </p>
          </div>
        </div>

        {/* Goal Difference */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            <Flame size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400">
              Goal Diff
            </p>

            <p
              className={`mt-0.5 text-sm font-bold ${
                goalDifference > 0
                  ? "text-green-600"
                  : goalDifference < 0
                    ? "text-red-600"
                    : "text-gray-900"
              }`}
            >
              {gameCount > 0
                ? goalDifference > 0
                  ? `+${goalDifference}`
                  : goalDifference
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}