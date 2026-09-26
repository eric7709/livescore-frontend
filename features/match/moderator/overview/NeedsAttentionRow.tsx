import Link from "next/link";
import { AlertTriangle, Clock, ChevronRight, Radio } from "lucide-react";
import { MatchDTO } from "@/features/match/utils/match.types";
import { AttentionSeverity } from "../../utils/useNeedsAttention";

const SEVERITY = {
  urgent: {
    stripe: "bg-[#E5484D]",
    railText: "text-[#E5484D]",
    railBg: "bg-red-50/60",
    badge: "bg-white text-[#E5484D] ring-1 ring-inset ring-red-100",
    button:
      "bg-[#E5484D] text-white hover:bg-[#C93B40] focus-visible:ring-red-300",
    pulse: true,
    Icon: AlertTriangle,
    label: "Urgent",
  },
  upcoming: {
    stripe: "bg-amber-400",
    railText: "text-amber-600",
    railBg: "bg-amber-50/60",
    badge: "bg-white text-amber-700 ring-1 ring-inset ring-amber-100",
    button:
      "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-300",
    pulse: false,
    Icon: Clock,
    label: "Upcoming",
  },
} satisfies Record<
  AttentionSeverity,
  {
    stripe: string;
    railText: string;
    railBg: string;
    badge: string;
    button: string;
    pulse: boolean;
    Icon: typeof AlertTriangle;
    label: string;
  }
>;

interface NeedsAttentionRowProps {
  match: MatchDTO;
  reason: string;
  severity: AttentionSeverity;
}

export function NeedsAttentionRow({
  match,
  reason,
  severity,
}: NeedsAttentionRowProps) {
  const {
    stripe,
    railText,
    railBg,
    badge,
    button,
    pulse,
    Icon,
    label,
  } = SEVERITY[severity];

  const date = new Date(match.matchDate);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Left severity stripe */}
      <span className={`w-1 shrink-0 ${stripe}`} />

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4">
        {/* Icon + meta */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${railBg} ${railText}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Severity badge row */}
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge}`}
              >
                {pulse && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E5484D] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E5484D]" />
                  </span>
                )}
                {label}
              </span>
              <span className="text-[11px] text-gray-400">{reason}</span>
            </div>

            {/* Match title */}
            <p className="truncate text-[15px] font-semibold leading-tight text-gray-900">
              {match.homeTeamName}
              <span className="mx-1.5 font-normal text-gray-300">vs</span>
              {match.awayTeamName}
            </p>

            {/* Meta line */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-gray-500">
              <span className="font-mono tabular-nums">{dateLabel}</span>
              <span className="text-gray-300">·</span>
              <span className="font-mono tabular-nums">{timeLabel}</span>
              {match.competitionName && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="truncate">{match.competitionName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider (desktop) */}
        <span className="hidden h-10 w-px shrink-0 bg-gray-100 sm:block" />

        {/* Inline CTA */}
        <Link
          href={`/moderator/matches/${match.id}/record-stats`}
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold shadow-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${button}`}
        >
          {severity === "urgent" ? (
            <>
              <Radio className="h-3.5 w-3.5" />
              Record now
            </>
          ) : (
            <>
              Record stats
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}