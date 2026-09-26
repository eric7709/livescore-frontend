"use client";

import { Edit, Trash2, Users } from "lucide-react";
import { ProfileResponseDTO } from "../../utils/profile.types";
import Link from "next/link";

const AVATAR_COLORS = [
  { bg: "bg-blue-50 text-blue-700 ring-blue-100 border-blue-200" },
  { bg: "bg-emerald-50 text-emerald-700 ring-emerald-100 border-emerald-200" },
  { bg: "bg-violet-50 text-violet-700 ring-violet-100 border-violet-200" },
  { bg: "bg-amber-50 text-amber-700 ring-amber-100 border-amber-200" },
  { bg: "bg-rose-50 text-rose-700 ring-rose-100 border-rose-200" },
  { bg: "bg-indigo-50 text-indigo-700 ring-indigo-100 border-indigo-200" },
];

type Props = {
  profiles?: ProfileResponseDTO[];
  isLoading?: boolean;
  setProfile: (p: ProfileResponseDTO) => void;
  openModal: (modal: "CREATE" | "UPDATE" | "DELETE" | null) => void;
};

export default function ProfilesTable({ profiles, isLoading, openModal, setProfile }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl flex-1 flex flex-col border border-slate-200/80 bg-white shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed", minWidth: "700px" }}>
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3.5">Member</th>
              <th className="px-3 py-3.5">Role</th>
              <th className="px-3 py-3.5">Position / No.</th>
              <th className="px-3 py-3.5">Team</th>
              <th className="px-3 py-3.5">Phone</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableSkeletonRow key={idx} />
              ))
            ) : !profiles?.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80">
                    <Users size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">No members found</p>
                  <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria or filters</p>
                </td>
              </tr>
            ) : (
              profiles.map((profile, index) => (
                <ProfileTableRow
                  key={profile.id}
                  profile={profile}
                  colorIndex={index % AVATAR_COLORS.length}
                  onEdit={() => {
                    setProfile(profile);
                    openModal("UPDATE");
                  }}
                  onDelete={() => {
                    setProfile(profile);
                    openModal("DELETE");
                  }}
                />
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
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="h-3.5 w-28 rounded bg-slate-200" />
        </div>
      </td>
      <td className="px-3 py-3.5">
        <div className="h-5 w-16 rounded-md bg-slate-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-3.5 w-24 rounded bg-slate-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-3.5 w-20 rounded bg-slate-200" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-3.5 w-24 rounded bg-slate-200" />
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
        </div>
      </td>
    </tr>
  );
}

function ProfileTableRow({
  profile,
  colorIndex,
  onEdit,
  onDelete,
}: {
  profile: ProfileResponseDTO;
  colorIndex: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50/70">
      {/* Member Name and Avatar */}
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <ProfileAvatar profile={profile} colorIndex={colorIndex} />
          <Link href={`/profile/${profile.id}`} className="truncate text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
            {profile.firstName} {profile.lastName}
          </Link>
        </div>
      </td>

      {/* Role Badge */}
      <td className="px-3 py-3.5">
        <RoleBadge role={profile.role} />
      </td>

      {/* Position and Squad Number */}
      <td className="px-3 py-3.5">
        {profile.position ? (
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-medium text-slate-600">
              {profile.position.replace(/_/g, " ")}
            </span>
            {profile.squadNumber && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-slate-200/80 bg-slate-100/70 px-1.5 font-mono text-[10px] font-semibold text-slate-700">
                #{profile.squadNumber}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Team Name */}
      <td className="truncate px-3 py-3.5 text-xs font-medium text-slate-600">
        {profile.teamName ? (
          <span className="text-slate-700">{profile.teamName}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        )}
      </td>

      {/* Phone Number */}
      <td className="truncate px-3 py-3.5 font-mono text-xs text-slate-500">
        {profile.phoneNumber ?? "—"}
      </td>

      {/* Actions */}
      <td className="px-6 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label="Edit profile"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            aria-label="Delete profile"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProfileAvatar({ profile, colorIndex }: { profile: ProfileResponseDTO; colorIndex: number }) {
  const { bg } = AVATAR_COLORS[colorIndex];
  const initials = `${profile.firstName?.charAt(0) ?? ""}${profile.lastName?.charAt(0) ?? ""}`;

  /* Commented out avatar image rendering for now */
  /* if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={`${profile.firstName} ${profile.lastName}`}
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200/80 shadow-2xs"
      />
    );
  } */

  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold border shadow-2xs ${bg}`}>
      {initials.toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    CAPTAIN: "bg-amber-50 text-amber-700 border-amber-200/70",
    COACH: "bg-blue-50 text-blue-700 border-blue-200/70",
    PLAYER: "bg-violet-50 text-violet-700 border-violet-200/70",
  };

  const normalized = role ? role.toUpperCase() : "MEMBER";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        styles[normalized] ?? "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {normalized.charAt(0) + normalized.slice(1).toLowerCase()}
    </span>
  );
}