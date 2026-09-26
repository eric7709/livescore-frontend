import { MatchPeriod } from "./match.types";


const PERIOD_BASE_MINUTE: Record<MatchPeriod, number> = {
  PRE_MATCH: 0,
  FIRST_HALF: 0,
  HALF_TIME: 45,
  SECOND_HALF: 45,
  FULL_TIME: 90,
  EXTRA_TIME_FIRST_HALF: 90,
  EXTRA_TIME_HALF_TIME: 105,
  EXTRA_TIME_SECOND_HALF: 105,
  PENALTIES: 120,
  
};

const PERIOD_LENGTH_MINUTES: Partial<Record<MatchPeriod, number>> = {
  FIRST_HALF: 45,
  SECOND_HALF: 45,
  EXTRA_TIME_HALF_TIME: 15,
  EXTRA_TIME_SECOND_HALF: 15,
};

export function computeMatchMinute(
  period: MatchPeriod,
  periodStartedAt: string | null
): { matchMinute: number; extraMinute: number } {
  const base = PERIOD_BASE_MINUTE[period] ?? 0;

  if (!periodStartedAt) {
    return { matchMinute: base, extraMinute: 0 };
  }

  const startedMs = new Date(periodStartedAt).getTime();
  const elapsed = Math.max(0, Math.floor((Date.now() - startedMs) / 60000));
  const cap = PERIOD_LENGTH_MINUTES[period];

  if (!cap || elapsed <= cap) {
    return { matchMinute: base + elapsed, extraMinute: 0 };
  }

  // ran past regulation length for this period -> stoppage time
  return { matchMinute: base + cap, extraMinute: elapsed - cap };
}