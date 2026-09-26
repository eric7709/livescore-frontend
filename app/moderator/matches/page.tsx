"use client";

import { useEffect, useState } from "react";
import { useGetMatchesByDate, useSearchMatches } from "@/features/match/utils/match.api";
import { MatchStatus } from "@/features/match/utils/match.types";
import { Header, MatchFilters } from "@/features/match/moderator/matches/Header";
import { MatchList } from "@/features/match/moderator/matches/MatchList";
import { FlatMatchList } from "@/features/match/moderator/matches/FlatMatchList";
import { Pagination } from "@/features/match/moderator/shared/Pagination";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const PAGE_SIZE = 12;

export default function ModeratorMatchesPage() {
  const [filters, setFilters] = useState<MatchFilters>({ date: todayISO(), status: "ALL", scope: "date" });
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [filters.scope, filters.status, filters.date]);

  const byDateQuery = useGetMatchesByDate(
    { date: filters.date, status: filters.status === "ALL" ? undefined : [filters.status as MatchStatus] },
    filters.scope === "date"
  );

  const searchQuery = useSearchMatches(
    { status: filters.status === "ALL" ? undefined : (filters.status as MatchStatus) },
    { page, size: PAGE_SIZE, sort: "matchDate,desc" },
    filters.scope === "all"
  );

  return (
    <div className="mx-auto max-w-5xl py-4 px-4">
      <Header filters={filters} onFiltersChange={setFilters} />
      {filters.scope === "date" ? (
        <MatchList
          competitionMatches={byDateQuery.data ?? []}
          isLoading={byDateQuery.isLoading}
          error={byDateQuery.error ? "Failed to load matches." : null}
        />
      ) : (
        <>
          <FlatMatchList
            matches={searchQuery.data?.content ?? []}
            isLoading={searchQuery.isLoading}
            error={searchQuery.error ? "Failed to load matches." : null}
          />
          <Pagination page={page} totalPages={searchQuery.data?.totalPages ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}