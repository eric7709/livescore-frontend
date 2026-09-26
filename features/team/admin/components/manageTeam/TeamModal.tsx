"use client";

import { X, ImagePlus, Trash2, Layers } from "lucide-react";
import { TeamForm } from "./TeamForm";
import { TeamResponseDTO } from "@/features/team/utils/team.types";

interface TeamModalProps {
  modal: "CREATE" | "UPDATE" | "DELETE" | null;
  selectedTeam?: TeamResponseDTO;
  onClose: () => void;
}

export default function TeamModal({ modal, selectedTeam, onClose }: TeamModalProps) {
  if (modal !== "CREATE" && modal !== "UPDATE") return null;

  const isCreate = modal === "CREATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {isCreate ? "Create New Team" : "Edit Team Details"}
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {isCreate ? "Add a new team to the roster" : "Update team profile and information"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          <TeamForm team={selectedTeam} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}