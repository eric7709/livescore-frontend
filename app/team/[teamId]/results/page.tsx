import TeamResults from "@/features/team/user/components/viewTeamResultsAndFixtures/TeamResults";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;
  console.log(teamId, "TEAM ID")
  return <TeamResults teamId={Number(teamId)} />;
}