import TeamFixtures from "@/features/team/user/components/viewTeamResultsAndFixtures/TeamFixtures";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;
  return <TeamFixtures teamId={Number(teamId)} />;
}