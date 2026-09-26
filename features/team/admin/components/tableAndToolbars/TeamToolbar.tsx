"use client";

import { Users } from "lucide-react";
import { TeamSearch } from "../filterSearchPagination/TeamSearch";
import { AddButton } from "@/features/shared/components/AddButton";

interface TeamToolbarProps {
  onOpenCreate: () => void;
}

export default function TeamToolbar({
  onOpenCreate,
}: TeamToolbarProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <Users size={16} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Teams
            </h1>

            <p className="text-xs text-gray-400">
              Manage all teams in the system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TeamSearch />

          <div className="h-5 w-px bg-emerald-100" />

          <AddButton
            onClick={onOpenCreate}
            label="Add team"
          />
        </div>
      </div>
    </div>
  );
}