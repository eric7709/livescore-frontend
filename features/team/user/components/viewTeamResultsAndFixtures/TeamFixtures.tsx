"use client";

import Link from "next/link";
import { useTeamFixtures } from "@/features/team/utils/team.api";
import { inter, scoreMono } from "@/public/fonts/fonts";

interface TeamFixturesProps {
  teamId: number;
  date?: string;
  competitionId?: number;
}

const COMPETITION_PALETTE = [
  { bg: "#EEF2FF", text: "#3730A3" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#ECFDF5", text: "#065F46" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0E7FF", text: "#1E40AF" },
  { bg: "#F3E8FF", text: "#6B21A8" },
];

// Fixed widths keep the "vs" divider aligned across every row, regardless of
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

export default function TeamFixtures({
  teamId,
  date,
  competitionId,
}: TeamFixturesProps) {
  const { data, isLoading, isError } = useTeamFixtures(teamId, {
    date,
    competitionId,
  });
  const fixtures = data?.content ?? [];

  return (
    <div className={`${inter.variable} mt-3`}>
      {/* Section header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1F7A47]/10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A47]" />
        </span>
        <p
          className={`${scoreMono.className} text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7566]`}
        >
          Upcoming Fixtures
        </p>
        {!isLoading && !isError && fixtures.length > 0 && (
          <>
            <span className="h-px flex-1 bg-[#E2E7DD]" />
            <span
              className={`${scoreMono.className} rounded-full bg-[#F2F4EF] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#8B9388]`}
            >
              {fixtures.length}
            </span>
          </>
        )}
      </div>

      {isLoading ? (
        <SkeletonList rows={3} height="h-[68px]" />
      ) : isError ? (
        <EmptyState
          tone="error"
          title="Couldn't load fixtures"
          hint="Try refreshing the page."
        />
      ) : fixtures.length === 0 ? (
        <EmptyState
          tone="neutral"
          title="No upcoming fixtures"
          hint="Scheduled matches will appear here."
        />
      ) : (
        <ul className="space-y-2">
          {fixtures.map((fixture, i) => {
            const compTone = competitionTone(fixture.competitionCode);
            const shortDate = formatShortDate(fixture.matchDate);
            const isNext = i === 0;

            return (
              <li key={fixture.matchId}>
                <Link
                  href={`/match/${fixture.matchId}`}
                  className={`group relative flex items-stretch overflow-hidden rounded-xl border bg-white transition-all duration-150 hover:-translate-y-px hover:shadow-[0_6px_16px_-8px_rgba(20,83,45,0.28)] ${
                    isNext
                      ? "border-[#1F7A47]/25 hover:border-[#1F7A47]/45"
                      : "border-[#E2E7DD] hover:border-[#1F7A47]/30"
                  }`}
                >
                  {isNext && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-[#1F7A47]"
                    />
                  )}

                  {/* Date/time stub */}
                  <div className="flex w-[60px] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-dashed border-[#E2E7DD] bg-[#FAFBF7] px-1 py-3 transition-colors group-hover:bg-[#F2F4EF]">
                    <span
                      className={`${scoreMono.className} text-[9.5px] font-semibold tabular-nums tracking-[0.04em] text-[#8B9388]`}
                    >
                      {shortDate}
                    </span>
                    <span
                      className={`${scoreMono.className} text-[14px] font-bold tabular-nums leading-none text-[#14181C]`}
                    >
                      {fixture.matchTime}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                    {/* Competition + "next up" hint */}
                    <div className="hidden w-14 shrink-0 flex-col items-start gap-1 sm:flex">
                      <span
                        className={`${scoreMono.className} inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]`}
                        style={{
                          backgroundColor: compTone.bg,
                          color: compTone.text,
                        }}
                      >
                        {fixture.competitionCode}
                      </span>
                      {isNext && (
                        <span
                          className={`${scoreMono.className} text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#1F7A47]`}
                        >
                          Next up
                        </span>
                      )}
                    </div>

                    {/* Matchup — fixed-width team columns keep "vs" centered */}
                    <div className="flex flex-1 items-center justify-center gap-2">
                      <span
                        className={`${scoreMono.className} truncate text-right text-[12px] font-bold uppercase tracking-wide text-[#14181C]`}
                        style={{ width: TEAM_COL_WIDTH }}
                      >
                        {fixture.homeTeamCode}
                      </span>
                      <span
                        className={`${scoreMono.className} shrink-0 rounded-full bg-[#F2F4EF] px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#8B9388] ring-1 ring-inset ring-[#E2E7DD]`}
                      >
                        vs
                      </span>
                      <span
                        className={`${scoreMono.className} truncate text-left text-[12px] font-bold uppercase tracking-wide text-[#14181C]`}
                        style={{ width: TEAM_COL_WIDTH }}
                      >
                        {fixture.awayTeamCode}
                      </span>
                    </div>

                    {/* Chevron */}
                    <span
                      aria-hidden
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-[#C4CCC0] transition-all group-hover:translate-x-0.5 group-hover:bg-[#1F7A47]/8 group-hover:text-[#1F7A47]"
                    >
                      ›
                    </span>
                  </div>
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