import ResultList from "@/features/competition/user/components/viewCompetitionResultsAndFixtures/ResultList";

interface ResultsPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { competitionId } = await params;

  return (
    <div className="mx-auto mt-6">
      <ResultList competitionId={Number(competitionId)} />
    </div>
  );
}