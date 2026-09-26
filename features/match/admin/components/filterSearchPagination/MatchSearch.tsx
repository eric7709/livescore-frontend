"use client";
import { SearchInput } from "@/features/profile/components/filterSearchPagination/SearchInput";
import { useMatchParams } from "../../../utils/useMatchParams";

export function MatchSearch() {
  const { filters: { search }, setFilter } = useMatchParams();
  const value = search ?? "";

  return (
    <SearchInput
      value={value}
      onChange={(el) => setFilter('search', el)}
      placeholder="Search matches..."
    />
  );
}