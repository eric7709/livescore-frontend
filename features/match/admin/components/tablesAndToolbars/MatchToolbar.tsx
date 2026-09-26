"use client";

import { Calendar } from "lucide-react";
import { AddButton } from "@/features/shared/components/AddButton";
import MatchFilters from "../filterSearchPagination/MatchFilters";
import { MatchTeamSearch } from "./MatchTeamSearch";
import { MatchStatusFilter } from "./MatchStatusFilter";

type Props = {
  onAdd: () => void;
};

export default function MatchToolbar({ onAdd }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <Calendar size={16} />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Matches
            </h1>

            <p className="text-xs text-gray-400">
              Schedule and manage fixtures
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MatchTeamSearch />
          <MatchStatusFilter />

          <div className="hidden h-5 w-px bg-emerald-100 sm:block" />

          <MatchFilters />

          <AddButton onClick={onAdd} label="Add match" />
        </div>
      </div>
    </div>
  );
}
