"use client";

import { useParams } from "next/navigation";
import { useGetTopAssisters } from "@/features/competition/utils/competition.api";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface TopAssistsTableProps {
  competitionId?: number;
}

export default function TopAssists({ competitionId }: TopAssistsTableProps) {
  const params = useParams<{ competitionId: string }>();
  const id = competitionId ?? Number(params.competitionId);
  const validId = Number.isFinite(id) ? id : undefined;

  const { data, isLoading, isError } = useGetTopAssisters(validId);
  const rankings = [...(data ?? [])].sort((a, b) => b.numberOfAssists - a.numberOfAssists).slice(0, 5);

  return (
    <div className="mx-auto mt-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-400">
        <span className="w-6 shrink-0">#</span>
        <span className="flex-1">Player</span>
        <span className="w-10 shrink-0 text-center">A</span>
        <span className="w-10 shrink-0 text-center">G</span>
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            Top assists could not be loaded.
          </div>
        ) : rankings.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400">No assists recorded yet.</div>
        ) : (
          rankings.map((player, idx) => (
            <div key={player.playerId} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-6 shrink-0 text-xs font-semibold text-slate-400">{idx + 1}</span>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                {player.teamLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={player.teamLogoUrl}
                    alt={player.teamName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(player.name)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate whitespace-nowrap text-[13px] font-medium text-slate-800">
                  {player.name}
                </p>
                <p className="truncate whitespace-nowrap text-xs text-slate-500">{player.teamName}</p>
              </div>

              <span className="w-10 shrink-0 text-center text-[13px] font-semibold text-sky-600">
                {player.numberOfAssists}
              </span>
              <span className="w-10 shrink-0 text-center text-[13px] font-semibold text-slate-500">
                {player.numberOfGoals}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-8 w-full animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}