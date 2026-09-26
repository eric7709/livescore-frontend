export function getMatchMinute(match: any) {
  if (!match?.startedAt) return null;

  const now = new Date();

  const periodStart = match.periodStartedAt
    ? new Date(match.periodStartedAt)
    : new Date(match.startedAt);

  const diffMs = now.getTime() - periodStart.getTime();
  const minutesInPeriod = Math.floor(diffMs / 60000);

  // FIRST HALF
  if (match.period === "FIRST_HALF") {
    if (minutesInPeriod > 45) return `45+${minutesInPeriod - 45}'`;
    return `${minutesInPeriod}'`;
  }

  // SECOND HALF
  if (match.period === "SECOND_HALF") {
    if (minutesInPeriod > 45) return `90+${minutesInPeriod - 45}'`;
    return `${45 + minutesInPeriod}'`;
  }

  // HALFTIME
  if (match.status === "HALF_TIME") return "HT";

  // FULL TIME
  if (match.status === "FULL_TIME") return "FT";

  return null;
}
