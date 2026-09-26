import "@/app/globals.css";
import CompetitionHeaderCard from "@/features/competition/user/components/shared/CompetitionHeaderCard";
import CompetitionTab from "@/features/competition/user/components/shared/CompetitionTab";

interface CompetitionLayoutProps {
  children: React.ReactNode;
  params: Promise<{ competitionId: string }>;
}

export default async function CompetitionLayout({
  children,
  params,
}: CompetitionLayoutProps) {
  const { competitionId } = await params;
  const id = Number(competitionId);

  return (
    <div className="px-4">
      <CompetitionHeaderCard competitionId={id} />
      <CompetitionTab competitionId={id} />
      <main className="min-h-screen">{children}</main>
    </div>
  );
}