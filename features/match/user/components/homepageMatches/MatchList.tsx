"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetMatchesByDate } from "@/features/match/utils/match.api";
import { MatchStatus } from "@/features/match/utils/match.types";
import { scoreMono } from "@/public/fonts/fonts";
import MatchCard from "./MatchCard";

// UserPageHeader (in the layout) owns the status tabs and date picker for
// this page and writes friendly ids to the URL ("all" | "live" | "upcoming"
// | "finished"). This component only reads them and maps to the backend's
// MatchStatus values — it renders no controls of its own.
const STATUS_ID_MAP: Record<string, MatchStatus[] | undefined> = {
  all: undefined,
  live: ["LIVE"],
  upcoming: ["SCHEDULED"],
  finished: ["FINISHED"],
};

function resolveStatus(raw: string | null): MatchStatus[] | undefined {
  if (!raw) return undefined;
  if (raw in STATUS_ID_MAP) return STATUS_ID_MAP[raw];
  // Fallback: allow raw MatchStatus values directly (e.g. testing the URL by hand).
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean) as MatchStatus[];
}

// Matches UserPageHeader's own "today" calculation so the date this
// component fetches always matches what's shown as selected in the header.
function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export default function MatchList() {
  const searchParams = useSearchParams();

  const statusFilter = resolveStatus(searchParams.get("status"));
  const activeDate = searchParams.get("date") || todayIso();

  // One date at a time — the backend groups by competition for just that
  // day, so we never pull a competition's full match history up front.
  const { data, isLoading, isError } = useGetMatchesByDate({
    date: activeDate,
    status: statusFilter,
  });
  const competitions = data ?? [];
  const isEmpty = competitions.length === 0;

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-10">
      {isLoading ? (
        <SkeletonRows />
      ) : isError ? (
        <EmptyState
          tone="error"
          title="Couldn't load matches"
          hint="Try refreshing the page."
        />
      ) : isEmpty ? (
        <EmptyState
          tone="neutral"
          title="No matches on this day"
          hint="Try another date or status filter."
        />
      ) : (
        <div className="space-y-8">
          {competitions.map(({ competition, matches }) => (
            <section key={competition.id}>
              {/* Competition header — routes to /competition/[id]. A divider
                  fills the rest of the row's width. */}
              <div className="mb-3 flex items-center gap-3">
                <Link
                  href={`/competition/${competition.id}`}
                  className="group flex shrink-0 items-center gap-2 rounded-full border border-[#E2E7DD] bg-white py-1.5 pl-1.5 pr-3 transition-all hover:border-[#14532D]/30 hover:shadow-[0_4px_12px_-6px_rgba(20,83,45,0.25)]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F4F6F1]">
                    {competition.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={competition.logoUrl}
                        alt={competition.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`${scoreMono.className} text-[9px] font-bold text-[#14532D]`}
                      >
                        {competition.competitionCode?.slice(0, 3) ?? "—"}
                      </span>
                    )}
                  </div>

                  <span className="text-[13px] font-semibold text-[#14181C] transition-colors group-hover:text-[#14532D]">
                    {competition.name}
                  </span>

                  <span
                    className={`${scoreMono.className} rounded-full bg-[#F2F4EF] px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-[#8B9388]`}
                  >
                    {matches.length}
                  </span>

                  <span
                    aria-hidden
                    className="text-[12px] font-bold text-[#C4CCC0] transition-all group-hover:translate-x-0.5 group-hover:text-[#14532D]"
                  >
                    ›
                  </span>
                </Link>

                <span className="h-px flex-1 bg-[#E2E7DD]" />
              </div>

              {/* Matches — each card spans the full row width */}
              <div className="space-y-2">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton / empty states ─────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((group) => (
        <div key={group}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-9 w-40 animate-pulse rounded-full border border-[#E2E7DD] bg-[#FAFBF7]" />
            <span className="h-px flex-1 bg-[#E2E7DD]" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[58px] w-full animate-pulse rounded-xl border border-[#E2E7DD] bg-[#FAFBF7]"
              />
            ))}
          </div>
        </div>
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
      className={`mx-auto max-w-md rounded-2xl bg-white px-4 py-10 text-center ring-1 ring-inset ${styles.ring}`}
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