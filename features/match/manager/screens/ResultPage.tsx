// ResultsPage.tsx
"use client";

import { useState } from "react";
import { useGetCompetitions } from "@/features/competition/utils/competition.api";
import ResultHeader from "../components/viewResult/ResultHeader";
import ResultList from "../components/viewResult/ResultList";

export default function ResultsPage() {
    const [date, setDate] = useState<string | null>(null);
    const [competitionId, setCompetitionId] = useState<number | null>(null);

    const { data: competitions, isLoading: competitionsLoading } = useGetCompetitions();

    const handleReset = () => {
        setDate(null);
        setCompetitionId(null);
    };

    return (
        <div className="space-y-4 p-3">
            <ResultHeader
                date={date}
                competitionId={competitionId}
                competitions={competitions ?? []}
                competitionsLoading={competitionsLoading}
                onDateChange={setDate}
                onCompetitionChange={setCompetitionId}
                onReset={handleReset}
            />
            <ResultList date={date} competitionId={competitionId} />
        </div>
    );
}