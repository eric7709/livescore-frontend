"use client";

import { Trophy } from "lucide-react";
import { CompetitionSearch } from "../filterSearchPagination/CompetitionSearch";
import { AddButton } from "@/features/shared/components/AddButton";

interface CompetitionToolbarProps {
  onAdd: () => void;
}

export default function CompetitionToolbar({
  onAdd,
}: CompetitionToolbarProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <Trophy size={16} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Competitions
            </h1>

            <p className="text-xs text-gray-400">
              Manage leagues, cups and tournaments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-px bg-emerald-100" />

          <AddButton
            onClick={onAdd}
            label="Add competition"
          />
        </div>
      </div>
    </div>
  );
}