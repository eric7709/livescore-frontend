// team/components/DeleteTeamModal.tsx
"use client";

import { useDeleteTeam } from "../../../utils/team.api";
import { TeamResponseDTO } from "../../../utils/team.types";

interface DeleteTeamModalProps {
  modal: "CREATE" | "UPDATE" | "DELETE" | null;
  selectedTeam?: TeamResponseDTO;
  onClose: () => void;
}

export default function DeleteTeamModal({ modal, selectedTeam, onClose }: DeleteTeamModalProps) {
  const { mutate: deleteTeam, isPending } = useDeleteTeam();

  if (modal !== "DELETE") return null;

  const handleDelete = () => {
    if (!selectedTeam) return;
    deleteTeam(selectedTeam.id, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h2 className="mb-1 text-sm font-semibold text-gray-900">Delete Team</h2>
        <p className="mb-6 text-xs text-gray-500 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-800">{selectedTeam?.name}</span>?
          This will also remove the team from any competitions.
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isPending}
            className="rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50">
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}