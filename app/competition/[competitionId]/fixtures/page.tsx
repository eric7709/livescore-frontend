import FixtureList from "@/features/competition/user/components/viewCompetitionResultsAndFixtures/FixtureList";

interface FixturesPageProps {
  params: Promise<{ competitionId: string }>;
}

export default async function FixturesPage({ params }: FixturesPageProps) {
  const { competitionId } = await params;

  return (
    <div className="mx-auto mt-6">
      <FixtureList competitionId={Number(competitionId)} />
    </div>
  );
}