"use client";

import { useParams } from "next/navigation";

import PageHeader from "../../../features/profile/components/manageProfile/PageHeader";
import ClubHistory from "../../../features/profile/components/manageProfile/ClubHistory";
import StatisticsByCompetition from "../../../features/profile/components/manageProfile/StatisticsByCompetition";
import { mapProfileToPlayerHeader } from "@/features/profile/utils/mapProfileToPlayerHeader";
import { useClubHistory, useCompetitionStats, useProfile } from "@/features/profile/utils/profile.api";

export default function PlayerPage() {
  const params = useParams<{ profileId: string }>();
  const profileId = Number(params.profileId);

  const { data: profile, isLoading: isProfileLoading } = useProfile(profileId);
  const { data: clubHistory, isLoading: isClubHistoryLoading } = useClubHistory(profileId);
  const { data: competitionStats, isLoading: isStatsLoading } = useCompetitionStats(profileId);

  if (isProfileLoading || isClubHistoryLoading || isStatsLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading player…</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Player not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeader player={profile} />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <ClubHistory history={clubHistory ?? []} role={profile.role} />
        {profile.role !== "MANAGER" && (
          <StatisticsByCompetition stats={competitionStats ?? []} />
        )}
      </div>
    </main>
  );
}