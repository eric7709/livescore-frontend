"use client";

import { useParams } from "next/navigation";
import { useGetStandings } from "@/features/competition/utils/competition.api";
import StandingsTable from "@/features/competition/user/components/viewCompetitionRankings/StandingsTable";

export default function StandingsPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const id = Number(competitionId);

  const { data, isLoading, isError } = useGetStandings(Number.isFinite(id) ? id : undefined);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <StandingsTable data={data} isLoading={isLoading} isError={isError} />
    </section>
  );
}