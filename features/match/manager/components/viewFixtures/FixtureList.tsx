"use client";

import { useParams } from "next/navigation";
import FixtureCard from "./FixtureCard";
import { useTeamFixtures } from "@/features/team/utils/team.api";
import { Fixture } from "@/features/team/utils/team.types";
import Loader from "@/features/match/manager/components/shared/Loader";

interface FixtureCardData {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
}

interface FixtureListProps {
  date?: string | null;
  competitionId?: number | null;
}

function toIsoDate(matchDate: string): string {
  const [day, month, year] = matchDate.split("-");
  return `${year}-${month}-${day}`;
}

function toFixtureCardData(fixture: Fixture): FixtureCardData {
  return {
    id: fixture.matchId,
    home: fixture.homeTeamName,
    away: fixture.awayTeamName,
    date: toIsoDate(fixture.matchDate),
    time: fixture.matchTime,
  };
}

export default function FixtureList({ date = null, competitionId = null }: FixtureListProps) {
  const params = useParams();
  const parsedTeamId = Number(params.teamId);
  const teamId = Number.isNaN(parsedTeamId) ? undefined : parsedTeamId;

  const { data, isLoading, isError } = useTeamFixtures(teamId as number, {
    competitionId: competitionId ?? undefined,
    date: date ?? undefined,
  });

  const fixtures = data?.content ?? [];

  if (isLoading) {
    return <Loader type="fixtures" />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load fixtures.</div>;
  }

  if (fixtures.length === 0) {
    return <div className="text-gray-500">No upcoming fixtures.</div>;
  }

  return (
    <div className="space-y-4">
      {fixtures.map((fixture, index) => (
        <FixtureCard
          key={fixture.matchId}
          teamId={String(teamId)}
          fixture={toFixtureCardData(fixture)}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}