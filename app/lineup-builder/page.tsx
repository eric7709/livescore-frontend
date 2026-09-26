"use client";

import LineupBuilder from "@/features/matchLineup/moderator/components/buildLineup/LineupBuilder";
import { useSearchParams } from "next/navigation";

function isPositiveInteger(value: string | null): boolean {
  if (value === null || value === "") return false;
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-red-800">{title}</h2>
      <p className="max-w-md text-red-600">{message}</p>
    </div>
  );
}

export default function LineupBuilderPage() {
  const searchParams = useSearchParams();
  const matchParam = searchParams.get("match");
  const teamParam = searchParams.get("team");

  if (!isPositiveInteger(teamParam ?? null) || !isPositiveInteger(matchParam)) {
    return (
      <ErrorState
        title="Invalid lineup link"
        message="This lineup needs a valid match and team. Open it from the match dashboard and try again."
      />
    );
  }

  return <LineupBuilder matchId={Number(matchParam)} teamId={Number(teamParam!)} />;
}