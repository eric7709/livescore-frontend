"use client";

import { useTeamSummary } from "@/features/team/utils/team.api";
import { FilterDropdown } from "@/features/shared/components/FilterDropdown";
import { POSITION_FILTER_OPTIONS, ROLE_FORM_OPTIONS, STARTER_STATUS_OPTIONS } from "@/features/shared/lib/options";
import { useProfileParams } from "../../utils/useProfileParams";

export default function ProfileFilter() {
  const { filters, setFilter, resetFilters } = useProfileParams();
  const { data: teams } = useTeamSummary();
  const TEAM_OPTIONS = [
    { value: "ALL", label: "All teams" },
    ...(teams?.map((t) => ({ value: String(t.teamId), label: t.teamName })) ?? []),
  ];
  const filtersConfig = [
    {
      id: "role",
      label: "Role",
      value: filters.role,
      options: ROLE_FORM_OPTIONS,
      onChange: (val: string) => setFilter("role", val),
      placeholder: "All roles",
    },
    {
      id: "position",
      label: "Position",
      value: filters.position,
      options: POSITION_FILTER_OPTIONS,
      onChange: (val: string) => setFilter("position", val),
      placeholder: "All positions",
    },
    {
      id: "starterStatus",
      label: "Starter",
      value: filters.starterStatus,
      options: STARTER_STATUS_OPTIONS,
      onChange: (val: string) => setFilter("starterStatus", val),
      placeholder: "All",
    },
    {
      id: "team",
      label: "Team",
      value: String(filters.teamId),
      options: TEAM_OPTIONS,
      onChange: (val: string) => setFilter("teamId", val),
      placeholder: "All teams",
    },
  ];

  return <FilterDropdown filters={filtersConfig} onReset={resetFilters} />;
}