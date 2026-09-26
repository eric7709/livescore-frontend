import TeamSquad from "@/features/team/user/components/viewTeamSquad/TeamSquad";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { teamId } = await params;

  return <TeamSquad teamId={Number(teamId)} />;
}