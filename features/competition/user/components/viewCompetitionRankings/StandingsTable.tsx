// StandingsTable.tsx — updated to accept and render liveTeamIds
"use client";

import { AlertCircle, Trophy } from "lucide-react";
import { TeamStandingDTO } from "@/features/competition/utils/competition.types";
import Link from "next/link";

const FORM_STYLES: Record<string, string> = {
  W: "bg-emerald-100 text-emerald-700",
  D: "bg-slate-200 text-slate-600",
  L: "bg-rose-100 text-rose-600",
};

interface StandingsTableProps {
  data: TeamStandingDTO[] | undefined;
  isLoading: boolean;
  isError: boolean;
  liveTeamIds?: Set<number>;
}

export default function StandingsTable({
  data,
  isLoading,
  isError,
  liveTeamIds,
}: StandingsTableProps) {
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
      <InlineState icon={<Trophy size={16} />} message="No standings are available yet." tone="neutral" />
    );
  }

  return (
    <div className="overflow-x-auto [scrollbar-width:thin]">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.06em] text-slate-400">
            <th className="py-2 pr-2 font-black">#</th>
            <th className="min-w-[9.5rem] py-2 pr-2 font-black">Team</th>
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
            const isLive = row.teamId != null && liveTeamIds?.has(row.teamId);

            return (
              <tr
                key={row.teamId ?? index}
                className={`transition-colors ${isLive ? "bg-emerald-50/60" : "hover:bg-slate-50/70"}`}
              >
                
                <td className="py-2.5 pr-2 font-bold text-slate-400">{index + 1}</td>
                <td className="py-2.5 pr-2 font-bold text-slate-800">
                  <Link href={`/team/${row.teamId}`} className="flex items-center gap-1.5">
                    {isLive && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    <span>{row.teamName ?? "Unknown team"}</span>
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
  const values = (form ?? "").split("").filter((value) => value in FORM_STYLES);

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

function InlineState({
  icon,
  message,
  tone,
}: {
  icon: React.ReactNode;
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

function RowsSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index} className="block h-8 w-full animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  );
}