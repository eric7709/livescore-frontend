import { CompetitionMatchesDTO } from "@/features/match/utils/match.types";
import { MatchList } from "../matches/MatchList";

interface TodaysScheduleSectionProps {
  competitionMatches: CompetitionMatchesDTO[];
  isLoading: boolean;
}

export function TodaysScheduleSection({ competitionMatches, isLoading }: TodaysScheduleSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Today's schedule</h2>
      <MatchList competitionMatches={competitionMatches} isLoading={isLoading} error={null} />
    </section>
  );
}