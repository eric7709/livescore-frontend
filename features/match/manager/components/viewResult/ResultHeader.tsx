// ResultHeader.tsx
"use client";

import ResultFilter from "./ResultFilter";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";

interface ResultHeaderProps {
  date: string | null;
  competitionId: number | null;
  competitions: CompetitionDTO[];
  competitionsLoading?: boolean;
  onDateChange: (date: string | null) => void;
  onCompetitionChange: (competitionId: number | null) => void;
  onReset: () => void;
}

export default function ResultHeader({
  date,
  competitionId,
  competitions,
  competitionsLoading,
  onDateChange,
  onCompetitionChange,
  onReset,
}: ResultHeaderProps) {
  return (
    <div className="flex flex-col bg-white sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-xl shadow border border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-linear-to-b from-purple-500 to-purple-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Results</h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">Past matches and outcomes</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ResultFilter
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