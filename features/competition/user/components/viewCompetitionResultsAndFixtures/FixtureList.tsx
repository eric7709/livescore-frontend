"use client";

import { useGetFixtures } from "@/features/competition/utils/competition.api";
import FixtureCard from "./FixtureCard";
import { groupByDate } from "@/features/competition/utils/groupByDate";

interface FixtureListProps {
  competitionId: number;
  date?: string;
}

export default function FixtureList({ competitionId, date }: FixtureListProps) {
  const { data, isLoading, isError } = useGetFixtures(competitionId, date);
  const fixtures = data?.fixtures ?? [];

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
        Failed to load fixtures.
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        No fixtures scheduled.
      </div>
    );
  }

  const groups = groupByDate(fixtures);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.dateKey}>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </h3>
          <div className="flex flex-col gap-2">
            {group.items.map((fixture) => (
              <FixtureCard key={fixture.matchId} fixture={fixture} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}