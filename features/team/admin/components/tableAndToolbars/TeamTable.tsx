"use client";

import { Trash2, Edit, Users } from "lucide-react";
import { TeamResponseDTO } from "../../../utils/team.types";
import Link from "next/link";

interface TeamTableProps {
  onEdit: (team: TeamResponseDTO) => void;
  teams: TeamResponseDTO[];
  isLoading?: boolean;
  onDelete: (team: TeamResponseDTO) => void;
}

// Helper to generate consistent avatar background colors based on team name/code
function getAvatarBgColor(str?: string) {
  if (!str) return "bg-slate-100 text-slate-700 border-slate-200";
  const colors = [
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-rose-100 text-rose-800 border-rose-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-sky-100 text-sky-800 border-sky-200",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TeamTable({ onEdit, onDelete, teams, isLoading }: TeamTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl flex-1 overflow-y-auto border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed", minWidth: "500px" }}>
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "35%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3.5">Team Name</th>
              <th className="px-4 py-3.5">Manager</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableSkeletonRow key={idx} />
              ))
            ) : !teams?.length ? (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80">
                    <Users size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">No teams found</p>
                  <p className="mt-1 text-xs text-gray-400">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <TeamTableRow key={team.id} team={team} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-28 rounded bg-slate-200" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
        </div>
      </td>
    </tr>
  );
}

function TeamTableRow({
  team,
  onEdit,
  onDelete,
}: {
  team: TeamResponseDTO;
  onEdit: (team: TeamResponseDTO) => void;
  onDelete: (team: TeamResponseDTO) => void;
}) {
  const codeText = team.teamCode || team.name?.substring(0, 3) || "---";
  const avatarStyle = getAvatarBgColor(team.teamCode || team.name);

  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/70">
      {/* Team Name and Logo Badge */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Commented out logo image rendering for now */}
          {/* {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200/80 shadow-2xs"
            />
          ) : null} */}

          {/* Circle Badge with Team Code */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold uppercase tracking-tight shadow-2xs ${avatarStyle}`}
          >
            {codeText}
          </div>

          <Link href={`/team/${team.id}`} className="truncate text-[13px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            {team.name ?? "Unnamed"}
          </Link>
        </div>
      </td>

      {/* Manager Name */}
      <td className="px-4 py-4 text-xs font-medium text-slate-600">
        {team.managerName ? (
          <span className="font-semibold text-slate-700">{team.managerName}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        )}
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label="Edit team"
            onClick={() => onEdit(team)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            aria-label="Delete team"
            onClick={() => onDelete(team)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}