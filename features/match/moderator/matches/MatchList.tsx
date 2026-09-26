import { CompetitionMatchesDTO } from "@/features/match/utils/match.types";
import { MatchCard } from "./MatchCard";

interface MatchListProps {
  competitionMatches: CompetitionMatchesDTO[];
  isLoading?: boolean;
  error?: string | null;
}

export function MatchList({ competitionMatches, isLoading, error }: MatchListProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-28 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="py-10 text-center text-sm text-red-600">{error}</p>;

  const totalMatches = competitionMatches.reduce((sum, group) => sum + group.matches.length, 0);
  if (totalMatches === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">No matches found.</p>;
  }

  return (
    <div className="space-y-8">
      {competitionMatches
        .filter((group) => group.matches.length > 0)
        .map(({ competition, matches }) => (
          <section key={competition.id}>
            <div className="mb-3 flex items-center gap-2">
              {competition.logoUrl && (
                <img src={competition.logoUrl} alt="" className="h-5 w-5 object-contain" />
              )}
              <h2 className="text-sm font-semibold text-gray-700">{competition.name}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 ">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}