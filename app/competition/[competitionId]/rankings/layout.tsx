import RankingsTab from "@/features/competition/user/components/shared/RankingsTab";

interface RankingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ competitionId: string }>;
}

export default async function RankingsLayout({ children, params }: RankingsLayoutProps) {
  const { competitionId } = await params;

  return (
    <div>
      <RankingsTab competitionId={Number(competitionId)} />
      {children}
    </div>
  );
}