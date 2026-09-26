"use client";
import { useProfileParams } from "../../utils/useProfileParams";
import { SearchInput } from "./SearchInput";

export function ProfileSearch() {
  const { filters, setFilter } = useProfileParams()
  return (
    <SearchInput
      value={filters.search}
      onChange={(e) => setFilter("search", e)}
      placeholder="Search profiles..."
    />
  );
}