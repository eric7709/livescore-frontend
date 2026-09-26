"use client";

import { SearchInput } from "@/features/profile/components/filterSearchPagination/SearchInput";
import { useTeamParams } from "../../../utils/useTeamParams";

export function TeamSearch() {
  const { filters, setFilter } = useTeamParams();

  return (
    <SearchInput
      value={filters.search}
      onChange={(val) => setFilter("search", val)}
      placeholder="Search teams..."
    />
  );
}