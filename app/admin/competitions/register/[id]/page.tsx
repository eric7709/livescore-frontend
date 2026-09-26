import RegisterTeamForm from "@/features/competition/admin/components/registerTeam/RegisterTeamForm";
import { CompetitionDTO } from "@/features/competition/utils/competition.types";
import { axiosInstance } from "@/features/shared/utils/axiosInstance";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const competitionId = Number(id);

  if (isNaN(competitionId) || competitionId <= 0) {
    return <ErrorUI />;
  }

  try {
    const response = await axiosInstance.get<CompetitionDTO>(`/competitions/${competitionId}`);
    const competitionData = response.data;
    if (!competitionData) {
      return <ErrorUI />;
    }
    return <RegisterTeamForm competition={competitionData} />;
  } catch (error) {
    console.error("Failed to fetch competition:", error);
    return <ErrorUI />;
  }
}

// ─── Error UI component ───
function ErrorUI() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <span className="text-2xl">🔍</span>
      </div>
      <h2 className="text-lg font-bold text-red-600">Competition not found</h2>
      <p className="mt-1 text-sm text-gray-500">
        The competition you're looking for doesn't exist or may have been removed.
      </p>
      <a
        href="/admin/competitions"
        className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        ← Back to competitions
      </a>
    </div>
  );
}