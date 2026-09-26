"use client";

import { LiveNowSection } from "@/features/match/moderator/overview/LiveNowSection";
import { NeedsAttentionSection } from "@/features/match/moderator/overview/NeedsAttentionSection";
import { OverviewHeader } from "@/features/match/moderator/overview/OverviewHeader";
import { TodaysScheduleSection } from "@/features/match/moderator/overview/TodaysScheduleSection";
import { useGetAllMatches, useGetMatchesByDate } from "@/features/match/utils/match.api";
import { useNeedsAttention } from "@/features/match/utils/useNeedsAttention";

export default function ModeratorOverviewPage() {
  const { data: liveGroups, isLoading: liveLoading } = useGetAllMatches(["LIVE"]);
  const liveMatches = liveGroups?.flatMap((g) => g.matches) ?? [];

  const { items: attentionItems, isLoading: attentionLoading } = useNeedsAttention();
  const { data: todayGroups, isLoading: todayLoading } = useGetMatchesByDate();

  return (
    <div className="mx-auto space-y-10 px-6 py-4">
      <OverviewHeader />
      <LiveNowSection matches={liveMatches} isLoading={liveLoading} />
      <NeedsAttentionSection items={attentionItems} isLoading={attentionLoading} />
      <TodaysScheduleSection competitionMatches={todayGroups ?? []} isLoading={todayLoading} />
    </div>
  );
}