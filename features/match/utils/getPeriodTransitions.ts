import { MatchPeriod, MatchStatus, MatchDTO } from "./match.types";

export type PeriodTransition = {
  label: string;
  nextPeriod: MatchPeriod;
  nextStatus: MatchStatus;
};

export function getPeriodTransitions(match: MatchDTO): PeriodTransition[] {
  const { status, period, matchType } = match;

  if (status === "SCHEDULED") {
    return [{ label: "Start Match", nextPeriod: "FIRST_HALF", nextStatus: "LIVE" }];
  }

  if (status !== "LIVE") {
    return []; // FINISHED / ABANDONED / POSTPONED — nothing to do
  }

  switch (period) {
    case "FIRST_HALF":
      return [{ label: "End First Half", nextPeriod: "HALF_TIME", nextStatus: "LIVE" }];

    case "HALF_TIME":
      return [{ label: "Start Second Half", nextPeriod: "SECOND_HALF", nextStatus: "LIVE" }];

    case "SECOND_HALF":
      if (matchType === "KNOCKOUT") {
        return [
          { label: "End Match", nextPeriod: "FULL_TIME", nextStatus: "FINISHED" }, // Changed from FULL_TIME
          { label: "Start Extra Time", nextPeriod: "EXTRA_TIME_FIRST_HALF", nextStatus: "LIVE" },
        ];
      }
      return [{ label: "End Match", nextPeriod: "FULL_TIME", nextStatus: "FINISHED" }]; // Changed from FULL_TIME
      return [{ label: "End Match", nextPeriod: "FULL_TIME", nextStatus: "FINISHED" }];
    case "EXTRA_TIME_FIRST_HALF":
      return [{ label: "End First Extra Time", nextPeriod: "EXTRA_TIME_HALF_TIME", nextStatus: "LIVE" }];

    case "EXTRA_TIME_HALF_TIME":
      return [{ label: "Start Second Extra Time", nextPeriod: "EXTRA_TIME_SECOND_HALF", nextStatus: "LIVE" }];

    case "EXTRA_TIME_SECOND_HALF":
      return [
        { label: "End Match", nextPeriod: "FULL_TIME", nextStatus: "FINISHED" },
        { label: "Start Penalty Shootout", nextPeriod: "PENALTIES", nextStatus: "LIVE" },
      ];

    case "PENALTIES":
      return [{ label: "End Penalty Shootout", nextPeriod: "FULL_TIME", nextStatus: "FINISHED" }];

    default:
      return [];
  }
}