// FixturesPage.tsx
"use client";

import { useState } from "react";
import { useGetCompetitions } from "@/features/competition/utils/competition.api";
import FixtureHeader from "../components/viewFixtures/FixtureHeader";
import FixtureList from "../components/viewFixtures/FixtureList";

export default function FixturesPage() {
  const [date, setDate] = useState<string | null>(null);
  const [competitionId, setCompetitionId] = useState<number | null>(null);

  const { data: competitions, isLoading: competitionsLoading } = useGetCompetitions();

  console.log(competitions, "COMPETITIONS")
  
  

  const handleReset = () => {
    setDate(null);
    setCompetitionId(null);
  };

  return (
    <div className="space-y-4 p-3">
      <FixtureHeader
        date={date}
        competitionId={competitionId}
        competitions={competitions ?? []}
        competitionsLoading={competitionsLoading}
        onDateChange={setDate}
        onCompetitionChange={setCompetitionId}
        onReset={handleReset}
      />
      <FixtureList date={date} competitionId={competitionId} />
    </div>
  );
}