"use client";

import Link from "next/link";
import { useTeamResults } from "@/features/team/utils/team.api";
import { inter, scoreMono } from "@/public/fonts/fonts";

interface TeamResultsProps {
  teamId: number;
  date?: string;
  competitionId?: number;
}

const BADGE_TONE: Record<string, { bg: string; text: string; ring: string }> = {
  W: { bg: "#EAF6EF", text: "#14532D", ring: "#B9E3C9" },
  D: { bg: "#F2F4EF", text: "#525A63", ring: "#DDE2D8" },
  L: { bg: "#FBEAEB", text: "#8B1F23", ring: "#F0C3C5" },
};

const COMPETITION_PALETTE = [
  { bg: "#EEF2FF", text: "#3730A3" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#ECFDF5", text: "#065F46" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0E7FF", text: "#1E40AF" },
  { bg: "#F3E8FF", text: "#6B21A8" },
];

// Fixed widths keep the score badge aligned across every row, regardless of
// how long the individual team codes are.
const TEAM_COL_WIDTH = "60px";

function competitionTone(code: string) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) | 0;
  return COMPETITION_PALETTE[Math.abs(h) % COMPETITION_PALETTE.length];
}

function formatShortDate(input: string): string {
  if (!input) return "";
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}-${mm}-${yy}`;
  }
  const m = input.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{2,4})$/);
  if (m) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const idx = months.findIndex(
      (mo) => mo.toLowerCase() === m[2].slice(0, 3).toLowerCase()
    );
    if (idx >= 0) {
      const dd = String(m[1]).padStart(2, "0");
      const mm = String(idx + 1).padStart(2, "0");
      const yy = String(m[3]).slice(-2);
      return `${dd}-${mm}-${yy}`;
    }
  }
  // Last resort: whatever the shape of `input`, never leak a 4-digit year.
  return input.replace(/\b(19|20)(\d{2})\b/, "$2");
}

export default function TeamResults({
  teamId,
  date,
  competitionId,
}: TeamResultsProps) {
  const { data, isLoading, isError } = useTeamResults(teamId, {
    date,
    competitionId,
  });
  const results = data?.content ?? [];

  return (
    <div className={`${inter.variable} mt-3`}>
      {/* Section header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#14532D]/10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#14532D]" />
        </span>
        <p
          className={`${scoreMono.className} text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7566]`}
        >
          Recent Results
        </p>
        {!isLoading && !isError && results.length > 0 && (
          <>
            <span className="h-px flex-1 bg-[#E2E7DD]" />
            <span
              className={`${scoreMono.className} rounded-full bg-[#F2F4EF] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#8B9388]`}
            >
              {results.length}
            </span>
          </>
        )}
      </div>

      {isLoading ? (
        <SkeletonList rows={3} height="h-16" />
      ) : isError ? (
        <EmptyState
          tone="error"
          title="Couldn't load results"
          hint="Try refreshing the page."
        />
      ) : results.length === 0 ? (
        <EmptyState
          tone="neutral"
          title="No results yet"
          hint="Completed matches will appear here."
        />
      ) : (
        <ul className="space-y-2">
          {results.map((result) => {
            const tone = BADGE_TONE[result.badge] ?? BADGE_TONE.D;
            const compTone = competitionTone(result.competitionCode);
            const shortDate = formatShortDate(result.matchDate);

            return (
              <li key={result.matchId}>
                <Link
                  href={`/match/${result.matchId}`}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-[#E2E7DD] bg-white py-2.5 pl-3.5 pr-3 transition-all duration-150 hover:-translate-y-px hover:border-[#14532D]/30 hover:shadow-[0_6px_16px_-8px_rgba(20,83,45,0.28)]"
                >
                  {/* Outcome badge */}
                  <span
                    className={`${scoreMono.className} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold`}
                    style={{
                      backgroundColor: tone.bg,
                      color: tone.text,
                      boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                    }}
                  >
                    {result.badge}
                  </span>

                  {/* Competition */}
                  <span
                    className={`${scoreMono.className} hidden w-14 shrink-0 truncate rounded-md px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.12em] sm:inline-block`}
                    style={{ backgroundColor: compTone.bg, color: compTone.text }}
                  >
                    {result.competitionCode}
                  </span>

                  {/* Matchup — fixed-width team columns keep the score centered */}
                  <div className="flex flex-1 items-center justify-center gap-2">
                    <span
                      className={`${scoreMono.className} truncate text-right text-[12px] font-bold uppercase tracking-wide text-[#14181C]`}
                      style={{ width: TEAM_COL_WIDTH }}
                    >
                      {result.homeTeamCode}
                    </span>
                    <span
                      className={`${scoreMono.className} shrink-0 rounded-lg bg-[#14181C] px-2.5 py-1 text-[12px] font-bold tabular-nums leading-none text-white shadow-sm`}
                    >
                      {result.homeScore}
                      <span className="mx-1 text-white/40">:</span>
                      {result.awayScore}
                    </span>
                    <span
                      className={`${scoreMono.className} truncate text-left text-[12px] font-bold uppercase tracking-wide text-[#14181C]`}
                      style={{ width: TEAM_COL_WIDTH }}
                    >
                      {result.awayTeamCode}
                    </span>
                  </div>

                  {/* Date */}
                  <span
                    className={`${scoreMono.className} hidden w-14 shrink-0 text-right text-[10px] font-medium tabular-nums text-[#A0A89A] sm:block`}
                  >
                    {shortDate}
                  </span>

                  {/* Chevron */}
                  <span
                    aria-hidden
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#C4CCC0] transition-all group-hover:translate-x-0.5 group-hover:bg-[#14532D]/8 group-hover:text-[#14532D]"
                  >
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SkeletonList({ rows, height }: { rows: number; height: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`${height} animate-pulse rounded-xl border border-[#E2E7DD] bg-[#FAFBF7]`}
        />
      ))}
    </div>
  );
}

function EmptyState({
  tone,
  title,
  hint,
}: {
  tone: "error" | "neutral";
  title: string;
  hint: string;
}) {
  const styles =
    tone === "error"
      ? { bg: "bg-[#FBE9EA]", ring: "ring-[#F5C6C9]", icon: "text-[#8B1F23]" }
      : { bg: "bg-[#F4F6F1]", ring: "ring-[#E2E7DD]", icon: "text-[#6B7566]" };

  return (
    <div
      className={`rounded-2xl bg-white px-4 py-8 text-center ring-1 ring-inset ${styles.ring}`}
    >
      <div
        className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${styles.bg}`}
      >
        <span className={`${scoreMono.className} text-[16px] ${styles.icon}`}>
          —
        </span>
      </div>
      <p className="text-[13px] font-semibold text-[#14181C]">{title}</p>
      <p className="mt-0.5 text-[12px] text-[#6B7566]">{hint}</p>
    </div>
  );
}