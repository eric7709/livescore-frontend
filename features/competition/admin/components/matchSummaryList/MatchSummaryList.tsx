"use client"

import { MatchSummary } from "@/features/match/utils/match.types"
import MatchSummaryCard from "../matchCard/MatchSummaryCard"

type Props = {
    matches: MatchSummary[]
}

// MatchSummaryList.tsx
export default function MatchSummaryList({ matches }: Props) {
    return (
        <div className="space-y-2">
            {matches.map((match) => (
                <MatchSummaryCard key={match.id} match={match} />
            ))}
        </div>
    )
}
