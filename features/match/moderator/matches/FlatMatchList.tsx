import { MatchDTO } from "@/features/match/utils/match.types";
import { MatchCard } from "./MatchCard";

interface FlatMatchListProps {
  matches: MatchDTO[];
  isLoading?: boolean;
  error?: string | null;
}

export function FlatMatchList({ matches, isLoading, error }: FlatMatchListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) return <p className="py-10 text-center text-sm text-red-600">{error}</p>;
  if (matches.length === 0) return <p className="py-10 text-center text-sm text-gray-500">No matches found.</p>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}