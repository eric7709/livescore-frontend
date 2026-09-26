"use client";

import { Radio } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetLiveTable } from "@/features/competition/utils/competition.api";
import { useGetLiveMatches } from "@/features/match/utils/match.api";
import StandingsTable from "@/features/competition/user/components/viewCompetitionRankings/StandingsTable";

export default function LiveStandingsPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const id = Number(competitionId);
  const validId = Number.isFinite(id) ? id : undefined;

  const { data, isLoading, isError } = useGetLiveTable(validId);
  const { data: liveTeamIdsArray } = useGetLiveMatches(validId);

  const liveTeamIds = new Set(liveTeamIdsArray ?? []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-1.5 text-emerald-600">
        <Radio size={12} className="animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Updates as matches progress
        </span>
      </div>
      <StandingsTable data={data} isLoading={isLoading} isError={isError} liveTeamIds={liveTeamIds} />
    </section>
  );
}