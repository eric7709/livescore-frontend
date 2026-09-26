import Image from "next/image";
import { BarChart3, Trophy, Shield } from "lucide-react";
import { CompetitionStatResponseDTO } from "../../utils/profile.types";

function CardIcon({ color }: { color: "yellow" | "red" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-2.5 rounded-[2px] ${
        color === "yellow" ? "bg-amber-400" : "bg-red-600"
      }`}
    />
  );
}

interface StatisticsByCompetitionProps {
  stats: CompetitionStatResponseDTO[];
}

export default function StatisticsByCompetition({
  stats,
}: StatisticsByCompetitionProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900">
          Statistics by Competition
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4 font-medium">Competition</th>
              <th className="py-2 pr-4 font-medium">Club</th>
              <th className="py-2 pr-4 text-right font-medium">Appearances</th>
              <th className="py-2 pr-4 text-right font-medium">Goals</th>
              <th className="py-2 pr-4 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <CardIcon color="yellow" />
                </span>
              </th>
              <th className="py-2 pr-4 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <CardIcon color="red" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {entry.competitionLogoUrl ? (
                      <Image
                        src={entry.competitionLogoUrl}
                        alt={entry.competitionName}
                        width={24}
                        height={24}
                        className="shrink-0 object-contain"
                      />
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                        <Trophy size={14} />
                      </div>
                    )}
                    <span className="font-medium text-slate-900">
                      {entry.competitionName}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {entry.clubLogoUrl ? (
                      <Image
                        src={entry.clubLogoUrl}
                        alt={entry.clubName}
                        width={20}
                        height={20}
                        className="shrink-0 object-contain"
                      />
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400">
                        <Shield size={12} />
                      </div>
                    )}
                    <span className="text-slate-600">{entry.clubName}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {entry.appearances}
                </td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {entry.goals}
                </td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {entry.yellowCards}
                </td>
                <td className="py-3 pr-4 text-right font-medium text-slate-900">
                  {entry.redCards}
                </td>
              </tr>
            ))}

            {stats.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No statistics available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}