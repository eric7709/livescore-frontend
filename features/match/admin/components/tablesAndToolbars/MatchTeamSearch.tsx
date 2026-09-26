"use client";

import { TeamSearchSelect } from "../manageMatch/TeamSearchSelect";
import { useMatchParams } from "../../../utils/useMatchParams";

export function MatchTeamSearch() {
  const { filters, setFilter } = useMatchParams();

  return (
    <div className="w-56">
      <TeamSearchSelect
        value={filters.teamId ? String(filters.teamId) : ""}
        selectedName={filters.teamName ?? ""}
        onSelect={(teamId, teamName) => {
          // Batch update prevents the second update from overriding the first
          setFilter({
            teamId: teamId ?? null,
            teamName: teamName ?? null,
          });
        }}
        placeholder="Filter by team..."
      />
    </div>
  );
}