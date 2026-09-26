"use client";

import { useGetResults } from "@/features/competition/utils/competition.api";
import ResultCard from "./ResultCard";
import { groupByDate } from "@/features/competition/utils/groupByDate";

interface ResultListProps {
  competitionId: number;
  date?: string;
}

export default function ResultList({ competitionId, date }: ResultListProps) {
  const { data, isLoading, isError } = useGetResults(competitionId, date);
  const results = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Failed to load results.
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        No results yet.
      </div>
    );
  }

  const groups = groupByDate(results);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.dateKey}>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.items.map((result) => (
              <ResultCard key={result.matchId} result={result} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}