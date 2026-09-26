import TopAssists from "@/features/competition/user/components/viewCompetitionRankings/TopAssists";

interface TopAssistsPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function Page({ params }: TopAssistsPageProps) {
  const { competitionId } = await params;

  return <TopAssists competitionId={Number(competitionId)} />;
}