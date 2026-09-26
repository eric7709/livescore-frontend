import { MatchPeriod, MatchSummary } from '@/features/match/utils/match.types'

type Props = {
  match: MatchSummary
}

const periodLabels: Record<MatchPeriod, string> = {
  PRE_MATCH: "Pre match",
  FIRST_HALF: "1st half",
  HALF_TIME: "Half time",
  SECOND_HALF: "2nd half",
  EXTRA_TIME_FIRST_HALF: "ET 1st half",
  EXTRA_TIME_HALF_TIME: "ET half time",
  EXTRA_TIME_SECOND_HALF: "ET 2nd half",
  PENALTIES: "Penalties",
  FULL_TIME: "Full time",
}

export default function MatchSummaryCard({ match }: Props) {
  const isLive = match.status === "LIVE"
  const isFinished = match.status === "FINISHED"
  const isScheduled = match.status === "SCHEDULED"

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

  const homeWon = isFinished && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore
  const awayWon = isFinished && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore
  const isDraw = isFinished && match.homeScore !== null && match.awayScore !== null && match.homeScore === match.awayScore

  // Status color mapping
  const statusColor = isLive
    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
    : isFinished
    ? "border-gray-400 bg-gray-50 dark:bg-gray-800/50"
    : "border-blue-400 bg-blue-50 dark:bg-blue-950/20"

  return (
    <div
      className={`
        relative flex items-center gap-4 p-4 rounded-xl border-l-4 shadow-sm
        hover:shadow-md transition-all duration-200 cursor-pointer
        bg-white dark:bg-gray-900
        ${statusColor}
      `}
    >
      {/* Left section: status & time */}
      <div className="flex flex-col items-center justify-center w-16 shrink-0 text-center">
        {isLive && (
          <>
            <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {periodLabels[match.period]}
            </span>
          </>
        )}

        {isFinished && (
          <>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              FT
            </span>
            {periodLabels[match.period] !== "FT" && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {periodLabels[match.period]}
              </span>
            )}
          </>
        )}

        {isScheduled && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {formatTime(match.matchDate)}
          </span>
        )}

        {!isLive && !isFinished && !isScheduled && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {periodLabels[match.period] || match.period}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-border shrink-0" />

      {/* Teams & scores */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Team crest placeholder */}
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
              {match.homeTeamName.charAt(0)}
            </div>
            <span
              className={`text-sm truncate ${
                awayWon ? "text-gray-400 dark:text-gray-500 font-normal" : "font-medium"
              }`}
            >
              {match.homeTeamName}
            </span>
          </div>
          <span
            className={`text-base font-bold tabular-nums ${
              match.homeScore == null
                ? "text-gray-300 dark:text-gray-600"
                : awayWon
                ? "text-gray-400 dark:text-gray-500"
                : ""
            }`}
          >
            {match.homeScore ?? "–"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
              {match.awayTeamName.charAt(0)}
            </div>
            <span
              className={`text-sm truncate ${
                homeWon ? "text-gray-400 dark:text-gray-500 font-normal" : "font-medium"
              }`}
            >
              {match.awayTeamName}
            </span>
          </div>
          <span
            className={`text-base font-bold tabular-nums ${
              match.awayScore == null
                ? "text-gray-300 dark:text-gray-600"
                : homeWon
                ? "text-gray-400 dark:text-gray-500"
                : ""
            }`}
          >
            {match.awayScore ?? "–"}
          </span>
        </div>
      </div>

      {/* Optional: Extra info for finished matches (result indicator) */}
      {isFinished && (
        <div className="absolute -top-1 -right-1">
          {homeWon && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              H
            </span>
          )}
          {awayWon && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              A
            </span>
          )}
          {isDraw && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
              D
            </span>
          )}
        </div>
      )}
    </div>
  )
}