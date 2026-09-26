// FixtureHeader.tsx
"use client";

import FixtureFilter from "./FixtureFilter";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";

interface FixtureHeaderProps {
  date: string | null;
  competitionId: number | null;
  competitions: CompetitionDTO[];
  competitionsLoading?: boolean;
  onDateChange: (date: string | null) => void;
  onCompetitionChange: (competitionId: number | null) => void;
  onReset: () => void;
}

export default function FixtureHeader({
  date,
  competitionId,
  competitions,
  competitionsLoading,
  onDateChange,
  onCompetitionChange,
  onReset,
}: FixtureHeaderProps) {
  return (
    <div className="flex  flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-xl shadow border border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-linear-to-b from-blue-500 to-blue-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fixtures</h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">Manage and track all matches</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FixtureFilter
          date={date}
          competitionId={competitionId}
          competitions={competitions}
          competitionsLoading={competitionsLoading}
          onDateChange={onDateChange}
          onCompetitionChange={onCompetitionChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
}