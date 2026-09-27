"use client";

import Link from "next/link";
import { PlayerStatus, Position } from "@/features/profile/utils/profile.types";
import { useTeamSquad } from "@/features/team/utils/team.api";
import { teko, inter, scoreMono } from "@/public/fonts/fonts";

interface DisplayPlayer {
  id: string | number;
  number: number;
  name: string;
  position: string;
  photoUrl?: string;
}

interface TeamSquadProps {
  teamId: number;
  status?: PlayerStatus;
  position?: Position[];
}

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"] as const;

const POSITION_LABEL: Record<string, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

const POSITION_SHORT: Record<string, string> = {
  GK: "GK",
  DEF: "DF",
  MID: "MF",
  FWD: "FW",
};

const POSITION_ACCENT: Record<string, string> = {
  GK: "#C99B2E",
  DEF: "#14532D",
  MID: "#1F7A47",
  FWD: "#C93B40",
};

function accentFor(position: string) {
  return POSITION_ACCENT[position] ?? "#14532D";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamSquad({ teamId, status, position }: TeamSquadProps) {
  const { data, isLoading, isError } = useTeamSquad(teamId, { status, position });

  const displayPlayers: DisplayPlayer[] =
    data?.squad.map((p) => ({
      id: p.id,
      number: p.squadNumber,
      name: p.fullName,
      position: p.position,
      photoUrl: p.avatarUrl,
    })) ?? [];

  const manager = data?.manager;

  // Group players by position, preserving order
  const grouped = POSITION_ORDER.reduce<Record<string, DisplayPlayer[]>>(
    (acc, pos) => {
      const players = displayPlayers.filter((p) => p.position === pos);
      if (players.length > 0) acc[pos] = players;
      return acc;
    },
    {}
  );

  // Catch any position values not in POSITION_ORDER
  const extras = displayPlayers.filter(
    (p) => !POSITION_ORDER.includes(p.position as (typeof POSITION_ORDER)[number])
  );
  if (extras.length > 0) grouped.OTHER = extras;

  const groupKeys = Object.keys(grouped);
  const isEmpty = displayPlayers.length === 0;

  return (
    <section
      className={`${inter.variable} mt-3 overflow-hidden rounded-2xl border border-[#E2E7DD] bg-white shadow-sm`}
    >
      {/* ── Header ──────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 border-b border-[#E2E7DD] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14532D]/8">
            <span
              className={`${scoreMono.className} text-[11px] font-bold text-[#14532D]`}
            >
              XI
            </span>
          </span>
          <div>
            <h2 className="text-[14px] font-semibold leading-tight text-[#14181C]">
              Squad
            </h2>
            {!isLoading && !isError && (
              <p
                className={`${scoreMono.className} text-[10px] font-medium tabular-nums text-[#8B9388]`}
              >
                {displayPlayers.length} players
              </p>
            )}
          </div>
        </div>

        {!isLoading && !isError && groupKeys.length > 0 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            {groupKeys
              .filter((pos) => pos !== "OTHER")
              .map((pos) => (
                <span
                  key={pos}
                  className={`${scoreMono.className} flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold`}
                  style={{
                    backgroundColor: `${accentFor(pos)}14`,
                    color: accentFor(pos),
                  }}
                >
                  {POSITION_SHORT[pos] ?? pos}
                  <span className="tabular-nums opacity-70">
                    {grouped[pos].length}
                  </span>
                </span>
              ))}
          </div>
        )}
      </header>

      {/* ── Manager strip ───────────────────────── */}
      {manager && (
        <Link
          href={`/profile/${manager.id}`}
          className="group flex items-center gap-3 border-b border-[#E2E7DD] bg-[#FAFBF7] px-5 py-3 transition-colors hover:bg-[#F2F4EF]"
        >
          <div className="relative h-10 w-10 shrink-0">
            <div className="h-full w-full overflow-hidden rounded-full border border-[#D9DED2] bg-white">
              {manager.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={manager.avatarUrl}
                  alt={manager.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className={`${scoreMono.className} flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#14532D]`}
                >
                  {initials(manager.fullName)}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`${scoreMono.className} text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8B9388]`}
            >
              Manager
            </p>
            <p className="truncate text-[13px] font-semibold text-[#14181C] transition-colors group-hover:text-[#14532D]">
              {manager.fullName}
            </p>
          </div>

          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-[#C4CCC0] transition-all group-hover:translate-x-0.5 group-hover:bg-[#14532D]/8 group-hover:text-[#14532D]"
          >
            ›
          </span>
        </Link>
      )}

      {/* ── Body ────────────────────────────────── */}
      <div className="p-4">
        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <EmptyState
            title="Couldn't load the squad"
            hint="Try refreshing the page."
          />
        ) : isEmpty ? (
          <EmptyState
            title="No players match this filter"
            hint="Try changing the status or position."
          />
        ) : (
          <div className="space-y-5">
            {groupKeys.map((pos) => (
              <PositionGroup key={pos} position={pos} players={grouped[pos]} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Position group ──────────────────────────── */

function PositionGroup({
  position,
  players,
}: {
  position: string;
  players: DisplayPlayer[];
}) {
  const accent = accentFor(position);
  const label = POSITION_LABEL[position] ?? position;

  return (
    <div>
      {/* Group heading */}
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <p
          className={`${scoreMono.className} text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7566]`}
        >
          {label}
        </p>
      </div>

      {/* Single-column list of compact rows */}
      <ul className="overflow-hidden rounded-xl border border-[#E2E7DD]">
        {players.map((player, i) => (
          <li key={player.id}>
            <PlayerRow
              player={player}
              accent={accent}
              isLast={i === players.length - 1}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Player row ───────────────────────────────── */

function PlayerRow({
  player,
  accent,
  isLast,
}: {
  player: DisplayPlayer;
  accent: string;
  isLast: boolean;
}) {
  return (
    <Link
      href={`/profile/${player.id}`}
      className={`group flex items-center gap-3 bg-white px-3 py-2.5 transition-colors hover:bg-[#FAFBF7] ${
        isLast ? "" : "border-b border-[#EEF1EA]"
      }`}
    >
      {/* Number */}
      <span
        className={`${scoreMono.className} w-7 shrink-0 text-right text-[13px] font-bold tabular-nums`}
        style={{ color: accent }}
      >
        {player.number}
      </span>

      {/* Photo */}
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#F4F6F1]">
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photoUrl}
            alt={player.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={`${scoreMono.className} flex h-full w-full items-center justify-center text-[9.5px] font-bold`}
            style={{ color: accent }}
          >
            {initials(player.name)}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#14181C] transition-colors group-hover:text-[#14532D]">
        {player.name}
      </p>

      {/* Chevron */}
      <span
        aria-hidden
        className={`${scoreMono.className} shrink-0 text-[12px] font-bold text-[#C4CCC0] transition-all group-hover:translate-x-0.5 group-hover:text-[#14532D]`}
      >
        ›
      </span>
    </Link>
  );
}

/* ── Skeleton ────────────────────────────────── */

function SkeletonGrid() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((group) => (
        <div key={group}>
          <div className="mb-2 flex items-center gap-2 px-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E2E7DD]" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-[#E2E7DD]" />
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E2E7DD]">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-white px-3 py-2.5 ${
                  i === 1 ? "border-b border-[#EEF1EA]" : ""
                }`}
              >
                <div className="h-3 w-7 shrink-0 animate-pulse rounded bg-[#EDF0E8]" />
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#EDF0E8]" />
                <div className="h-3 flex-1 animate-pulse rounded bg-[#EDF0E8]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty / error ───────────────────────────── */

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F6F1]">
        <span className={`${scoreMono.className} text-[16px] text-[#A0A89A]`}>
          —
        </span>
      </div>
      <p className="text-[13px] font-semibold text-[#14181C]">{title}</p>
      <p className="mt-0.5 text-[12px] text-[#6B7566]">{hint}</p>
    </div>
  );
}