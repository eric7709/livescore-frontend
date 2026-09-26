"use client";

export interface BasePlayerDTO {
  playerId: number;
  name: string;
  teamId: number;
  teamName: string;
  teamLogoUrl: string;
}

export interface PlayerRankingDTO extends BasePlayerDTO {
  value: number;
}

const DUMMY_RANKINGS: PlayerRankingDTO[] = [
  { playerId: 1, name: "Chidi Okafor", teamId: 1, teamName: "Port Harcourt FC", teamLogoUrl: "", value: 14 },
  { playerId: 2, name: "Tamuno Wike", teamId: 2, teamName: "Rivers United", teamLogoUrl: "", value: 11 },
  { playerId: 3, name: "Emeka Obi", teamId: 3, teamName: "Diobu Stars", teamLogoUrl: "", value: 10 },
  { playerId: 4, name: "Sam Bassey", teamId: 1, teamName: "Port Harcourt FC", teamLogoUrl: "", value: 9 },
  { playerId: 5, name: "Nwangbo Ihemugabu Success", teamId: 4, teamName: "Eleme Rangers", teamLogoUrl: "", value: 8 },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface PlayerRankingTableProps {
  rankings?: PlayerRankingDTO[];
  unit: string;
  accent?: "emerald" | "sky" | "violet" | "amber" | "rose";
  limit?: number;
}

const ACCENT_TEXT: Record<NonNullable<PlayerRankingTableProps["accent"]>, string> = {
  emerald: "text-emerald-600",
  sky: "text-sky-600",
  violet: "text-violet-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
};

export default function PlayerRankingTable({
  rankings = DUMMY_RANKINGS,
  unit,
  accent = "emerald",
  limit = 5,
}: PlayerRankingTableProps) {
  const sorted = [...rankings].sort((a, b) => b.value - a.value).slice(0, limit);

  return (
    <div className="mx-auto mt-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-400">
        <span className="w-6 shrink-0">#</span>
        <span className="flex-1">Player</span>
        <span className="w-14 shrink-0 whitespace-nowrap text-center leading-tight">{unit}</span>
      </div>

      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {sorted.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400">No data yet.</div>
        ) : (
          sorted.map((player, idx) => (
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
                <p className="truncate whitespace-nowrap text-sm font-medium text-slate-800">
                  {player.name}
                </p>
                <p className="truncate whitespace-nowrap text-xs text-slate-500">{player.teamName}</p>
              </div>

              <span className={`w-14 shrink-0 text-center text-sm font-semibold ${ACCENT_TEXT[accent]}`}>
                {player.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}