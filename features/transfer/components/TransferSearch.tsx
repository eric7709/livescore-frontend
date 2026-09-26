"use client";

import { SearchInput } from "@/features/profile/components/filterSearchPagination/SearchInput";
import { useTransferParams } from "../utils/useTransferParams";

export function TransferSearch() {
  const { filters, setFilter } = useTransferParams();

  return (
    <SearchInput
      value={filters.search}
      onChange={(val) => setFilter("search", val)}
      placeholder="Search transfers..."
    />
  );
}
