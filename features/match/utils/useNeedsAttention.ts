"use client";

import { useSearchMatches } from "@/features/match/utils/match.api";
import { MatchDTO } from "@/features/match/utils/match.types";

function toISODate(date: Date) {
  return date.toISOString().split("T")[0];
}

export type AttentionSeverity = "urgent" | "upcoming";

export interface AttentionItem {
  match: MatchDTO;
  reason: string;
  severity: AttentionSeverity;
}

export function useNeedsAttention() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const finishedQuery = useSearchMatches(
    { status: "FINISHED", dateFrom: toISODate(yesterday), dateTo: toISODate(today) },
    { size: 50, sort: "matchDate,desc" }
  );

  const upcomingQuery = useSearchMatches(
    { status: "SCHEDULED", dateFrom: toISODate(today), dateTo: toISODate(tomorrow) },
    { size: 50, sort: "matchDate,asc" }
  );

  const missingLineup = (matches: MatchDTO[] = []) => matches.filter((m) => !m.lineupSubmitted);

  const items: AttentionItem[] = [
    ...missingLineup(finishedQuery.data?.content).map((match) => ({
      match,
      reason: "Finished — lineup not recorded",
      severity: "urgent" as const,
    })),
    ...missingLineup(upcomingQuery.data?.content).map((match) => ({
      match,
      reason: "Kickoff soon — lineup not submitted",
      severity: "upcoming" as const,
    })),
  ];

  return { items, isLoading: finishedQuery.isLoading || upcomingQuery.isLoading };
}