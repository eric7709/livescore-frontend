import { Radio } from "lucide-react";
import { MatchSummary } from "@/features/match/utils/match.types";
import { MatchCard } from "../matches/MatchCard";

interface LiveNowSectionProps {
  matches: MatchSummary[];
  isLoading: boolean;
}

export function LiveNowSection({ matches, isLoading }: LiveNowSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Radio className="h-4 w-4 text-red-500" />
        <h2 className="text-sm font-semibold text-gray-700">Live now</h2>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      ) : matches.length === 0 ? (
        <p className="text-sm text-gray-500">No matches live right now.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {matches.map((match) => (
            <div key={match.id} className="w-72 shrink-0">
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}