"use client";

import Link from "next/link";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";
import { Trash2, Users, Trophy, Plus, Edit } from "lucide-react";

const AVATAR_COLORS = [
  "bg-blue-50 text-blue-700 ring-blue-100 border-blue-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-100 border-emerald-200",
  "bg-violet-50 text-violet-700 ring-violet-100 border-violet-200",
  "bg-amber-50 text-amber-700 ring-amber-100 border-amber-200",
  "bg-rose-50 text-rose-700 ring-rose-100 border-rose-200",
  "bg-indigo-50 text-indigo-700 ring-indigo-100 border-indigo-200",
];

type Props = {
  competitions?: CompetitionDTO[];
  isLoading?: boolean;
  onEdit: (c: CompetitionDTO) => void;
  onDelete: (c: CompetitionDTO) => void;
};

export default function CompetitionTable({ competitions, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl flex-1 border border-gray-200 bg-white shadow-sm overflow-y-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed", minWidth: "720px" }}>
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
          </colgroup>
          <thead>
            <tr
              className="border-b border-gray-100 text-[10px] uppercase tracking-[0.12em] text-gray-400 sticky top-0 z-10"
              style={{ background: "#FAFBFF" }}
            >
              <th className="px-5 py-3 font-semibold">Competition</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Scope</th>
              <th className="px-3 py-3 font-semibold">Registered Teams</th>
              <th className="px-3 py-3 font-semibold">Start Date</th>
              <th className="px-3 py-3 font-semibold">End Date</th>
              <th className="px-3 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <CompetitionSkeletonRow key={idx} />
              ))
            ) : !competitions?.length ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Trophy size={20} className="text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">No competitions yet</p>
                  <p className="mt-1 text-xs text-gray-400">Create one to get started</p>
                </td>
              </tr>
            ) : (
              competitions.map((comp, index) => (
                <CompetitionTableRow
                  key={comp.id}
                  competition={comp}
                  colorIndex={index % AVATAR_COLORS.length}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompetitionSkeletonRow() {
  return (
    <tr className="animate-pulse">
      {/* Competition Name & Logo */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
          <div className="h-4 w-36 rounded bg-gray-100" />
        </div>
      </td>

      {/* Type */}
      <td className="px-3 py-3">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </td>

      {/* Scope */}
      <td className="px-3 py-3">
        <div className="h-3.5 w-20 rounded bg-gray-100" />
      </td>

      {/* Registered Teams */}
      <td className="px-3 py-3">
        <div className="h-4 w-8 rounded bg-gray-100" />
      </td>

      {/* Start Date */}
      <td className="px-3 py-3">
        <div className="h-3.5 w-20 rounded bg-gray-100" />
      </td>

      {/* End Date */}
      <td className="px-3 py-3">
        <div className="h-3.5 w-20 rounded bg-gray-100" />
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <div className="h-7 w-7 rounded-lg bg-gray-100" />
          <div className="h-7 w-7 rounded-lg bg-gray-100" />
          <div className="h-7 w-7 rounded-lg bg-gray-100" />
        </div>
      </td>
    </tr>
  );
}

type RowProps = {
  competition: CompetitionDTO;
  colorIndex: number;
  onEdit: (c: CompetitionDTO) => void;
  onDelete: (c: CompetitionDTO) => void;
};

function CompetitionTableRow({ competition, colorIndex, onEdit, onDelete }: RowProps) {
  const start = competition.startDate ? competition.startDate.split("T")[0] : "—";
  const end = competition.endDate ? competition.endDate.split("T")[0] : "—";
  const canEdit = competition.status === "SCHEDULED";

  const avatarStyle = AVATAR_COLORS[colorIndex];

  return (
    <tr className="group transition-colors hover:bg-blue-50/30">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight shadow-2xs ${avatarStyle}`}
          >
            {competition.competitionCode}
          </div>

          <Link href={`/competition/${competition.id}/fixtures`} className="truncate hover:text-blue-600 duration-300 text-[13px] font-semibold text-gray-900">{competition.name}</Link>
        </div>
      </td>

      <td className="px-3 py-3">
        <CompetitionTypeBadge type={competition.competitionType} />
      </td>

      <td className="truncate px-3 py-3 text-xs text-gray-500 font-medium">
        {competition.scope || "—"}
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Users size={11} className="shrink-0 text-gray-300" />
          {competition.registeredTeamCount ?? 0}
        </div>
      </td>

      <td className="px-3 py-3 text-xs font-medium text-gray-700">{start}</td>
      <td className="px-3 py-3 text-xs font-medium text-gray-700">{end}</td>

      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          {canEdit ? (
            <>
              <Link
                href={`/admin/competitions/register/${competition.id}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                aria-label="Register teams"
              >
                <Plus size={14} strokeWidth={2} />
              </Link>

              <button
                type="button"
                aria-label="Edit competition"
                onClick={() => onEdit(competition)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              >
                <Edit size={13} />
              </button>

              <button
                type="button"
                aria-label="Delete competition"
                onClick={() => onDelete(competition)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100"
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function CompetitionTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    LEAGUE: "bg-blue-50 text-blue-700 border-blue-100",
    CUP: "bg-amber-50 text-amber-700 border-amber-100",
    TOURNAMENT: "bg-violet-50 text-violet-700 border-violet-100",
    FRIENDLY: "bg-teal-50 text-teal-700 border-teal-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[type] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {type?.charAt(0) + type?.slice(1).toLowerCase()}
    </span>
  );
}