// app/competition/[competitionId]/rankings/most-goals/page.tsx
import TopScorersTable from "@/features/competition/user/components/viewCompetitionRankings/TopScorers";

interface TopScorersPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function Page({ params }: TopScorersPageProps) {
  const { competitionId } = await params;

  return <TopScorersTable competitionId={Number(competitionId)} />;
}