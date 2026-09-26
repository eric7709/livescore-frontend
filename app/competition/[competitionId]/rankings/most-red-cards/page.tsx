import RankingStatPanel from "@/features/competition/user/components/viewCompetitionRankings/RankingStatPanel";

interface Props {
  params: Promise<{ competitionId: string }>;
}

export default async function Page({ params }: Props) {
  const { competitionId } = await params;
  return <RankingStatPanel competitionId={Number(competitionId)} stat="red-cards" />;
}