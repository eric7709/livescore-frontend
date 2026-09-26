"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ResultCard from "./ResultCard";
import { useTeamResults } from "@/features/team/utils/team.api";
import { Result } from "@/features/team/utils/team.types";
import Loader from "@/features/match/manager/components/shared/Loader";

interface ResultCardData {
  id: string;
  home: string;
  away: string;
  date: string; // ISO yyyy-MM-dd
  time: string;
  homeScore: number;
  awayScore: number;
  badge: 'W' | 'D' | 'L';
}

interface ResultListProps {
  date?: string | null;          // yyyy-MM-dd, owned by the parent
  competitionId?: number | null; // owned by the parent
}

function toIsoDate(matchDate: string): string {
  // backend sends dd-MM-yyyy — convert to yyyy-MM-dd so `new Date()` can parse it
  const [day, month, year] = matchDate.split("-");
  return `${year}-${month}-${day}`;
}

function toResultCardData(result: Result): ResultCardData {
  return {
    id: result.matchId,
    home: result.homeTeamName,
    away: result.awayTeamName,
    date: toIsoDate(result.matchDate),
    time: result.matchTime,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    badge: result.badge,
  };
}

export default function ResultList({ date = null, competitionId = null }: ResultListProps) {
  const params = useParams();
  const parsedTeamId = Number(params.teamId);
  const teamId = Number.isNaN(parsedTeamId) ? undefined : parsedTeamId;

  const { data, isLoading, isError } = useTeamResults(teamId as number, {
    competitionId: competitionId ?? undefined,
    date: date ?? undefined,
  });

  const results = data?.content ?? [];

  if (isLoading) {
    return <Loader type="results" />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load results.</div>;
  }

  if (results.length === 0) {
    return <div className="text-gray-500">No results yet.</div>;
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Link
          key={result.matchId}
          href={`/match/${result.matchId}`}
          className="block transition-transform hover:scale-[1.01]"
        >
          <ResultCard result={toResultCardData(result)} />
        </Link>
      ))}
    </div>
  );
}