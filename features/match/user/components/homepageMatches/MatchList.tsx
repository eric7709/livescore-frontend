"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CircleHelp, Clock } from "lucide-react";
import { useParams } from "next/navigation";

import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchLineup } from "@/features/matchLineup/utils/matchLineup.api";
import type { LineupPlayerDTO, LineupStatus, MatchLineupDTO } from "@/features/matchLineup/utils/matchLineup.types";
// Adjust these two paths to wherever your match-event hooks and types live.
import { useGetMatchSummaries } from "@/features/matchEvent/utils/matchEvent.api";
import type { MatchEventDTO } from "@/features/matchEvent/utils/matchEvent.types";

type Side = "home" | "away";

/* ------------------------------------------------------------------ */
/* Reveal window                                                       */
/* Lineups are hidden — even once submitted — until 30 minutes before  */
/* kickoff. A minute-tick keeps the panel from needing a manual        */
/* refresh right when that window opens.                               */
/* ------------------------------------------------------------------ */

const LINEUP_REVEAL_MS = 30 * 60 * 1000;

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/* ------------------------------------------------------------------ */
/* Formation layout                                                    */
/* The formation string decides the shape (F_4_3_3 -> rows of 4, 3, 3).*/
/* Position codes only decide who sits in which row and left/right.    */
/* ------------------------------------------------------------------ */

// How far up the pitch a position normally plays (0 = own goal).
const DEPTH: Record<string, number> = {
  GK: 0,
  CB: 1, LCB: 1, RCB: 1, LB: 1, RB: 1,
  LWB: 2, RWB: 2,
  CDM: 2.5, LDM: 2.5, RDM: 2.5,
  CM: 3, LCM: 3, RCM: 3,
  LM: 3.5, RM: 3.5,
  CAM: 3.7,
  LW: 4, RW: 4,
  SS: 4.5, CF: 4.5,
  ST: 5, LF: 5, RF: 5, LS: 5, RS: 5,
};

const depthOf = (position: string) => DEPTH[position] ?? 4.5;

// Left to right: L = -2, LC = -1, centre = 0, RC = 1, R = 2
function lateralOf(position: string): number {
  if (position.startsWith("LC")) return -1;
  if (position.startsWith("RC")) return 1;
  if (position.startsWith("L")) return -2;
  if (position.startsWith("R")) return 2;
  return 0;
}

function parseFormation(formation: string): number[] | null {
  if (formation === "F_WM") return [3, 2, 2, 3];
  const parts = formation.replace(/^F_/, "").split("_").map(Number);
  return parts.length > 0 && parts.every((n) => Number.isInteger(n) && n > 0) ? parts : null;
}

function formationLabel(formation: string): string {
  if (formation === "F_WM") return "W–M";
  return parseFormation(formation)?.join("–") ?? formation.replace(/^F_/, "").replaceAll("_", "–");
}

type Line = "GK" | "DEF" | "MID" | "FWD";

function lineOf(position: string): Line {
  if (position === "GK") return "GK";
  const d = depthOf(position);
  if (d <= 2) return "DEF";
  if (d < 4) return "MID";
  return "FWD";
}

function fallbackShape(outfield: LineupPlayerDTO[]): number[] {
  const counts = { DEF: 0, MID: 0, FWD: 0, GK: 0 };
  for (const { position } of outfield) counts[lineOf(position)]++;
  return [counts.DEF, counts.MID, counts.FWD].filter((n) => n > 0);
}

// Rows ordered goalkeeper first, attackers last.
function buildRows(starters: LineupPlayerDTO[], formation: string) {
  const sorted = [...starters].sort((a, b) => depthOf(a.position) - depthOf(b.position));
  const goalkeepers = sorted.filter((p) => p.position === "GK");
  const outfield = sorted.filter((p) => p.position !== "GK");

  const shape = parseFormation(formation);
  const fits = !!shape && shape.reduce((sum, n) => sum + n, 0) === outfield.length;
  const counts = fits && shape ? shape : fallbackShape(outfield);

  const rows: LineupPlayerDTO[][] = [];
  if (goalkeepers.length) rows.push(goalkeepers);

  let cursor = 0;
  for (const count of counts) {
    rows.push(
      outfield.slice(cursor, cursor + count).sort((a, b) => lateralOf(a.position) - lateralOf(b.position))
    );
    cursor += count;
  }
  return { rows, fits };
}

const surname = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
};

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "FC";

/* ------------------------------------------------------------------ */
/* Substitutions from match events                                     */
/* ------------------------------------------------------------------ */

// Only used when lineup statuses can't tell us who came on.
// true  = primaryPlayerId is the player who went off
// false = primaryPlayerId is the player who came on
const SUB_PRIMARY_IS_PLAYER_OFF = true;

interface SubInfo {
  off: Map<number, number>; // playerId -> minute they went off
  on: Map<number, number>; // playerId -> minute they came on
  list: { minute: number; offId: number; onId: number }[];
}

function collectSubs(events: MatchEventDTO[] | undefined, team: MatchLineupDTO): SubInfo {
  const status = new Map<number, LineupStatus>(team.lineup.map((p) => [p.playerId, p.status]));
  const info: SubInfo = { off: new Map(), on: new Map(), list: [] };

  // Match by player id first, then by name, so events with a missing teamId or missing ids still line up.
  const idsInTeam = new Set<number>(team.lineup.map((p) => p.playerId));
  const idByName = new Map<string, number>(team.lineup.map((p) => [p.playerName.trim().toLowerCase(), p.playerId]));
  const resolve = (id: number | null, name: string | null): number | null => {
    if (id != null && idsInTeam.has(id)) return id;
    return name ? (idByName.get(name.trim().toLowerCase()) ?? null) : null;
  };

  const subEvents = (events ?? [])
    .filter((e) => e.eventType === "SUBSTITUTION")
    .sort((a, b) => a.minute - b.minute || a.second - b.second);

  for (const event of subEvents) {
    const a = resolve(event.primaryPlayerId, event.primaryPlayerName);
    const b = resolve(event.secondaryPlayerId, event.secondaryPlayerName);
    if (a == null || b == null) continue; // not a sub for this team

    // A starter replaced by a bench player is unambiguous; otherwise use the convention above.
    const primaryIsOff =
      status.get(a) === "STARTER" && status.get(b) === "SUBSTITUTE"
        ? true
        : status.get(a) === "SUBSTITUTE" && status.get(b) === "STARTER"
          ? false
          : SUB_PRIMARY_IS_PLAYER_OFF;

    const offId = primaryIsOff ? a : b;
    const onId = primaryIsOff ? b : a;
    info.off.set(offId, event.minute);
    info.on.set(onId, event.minute);
    info.list.push({ minute: event.minute, offId, onId });
  }
  return info;
}

/* ------------------------------------------------------------------ */
/* Pitch                                                               */
/* Palette: pale turf #eef5f0 / #e6f0e9, chalk lines #8fb7a0, ink      */
/* slate-900. Players are coloured by role, not by team.               */
/* ------------------------------------------------------------------ */

const LINES: { key: Line; label: string; cls: string }[] = [
  { key: "GK", label: "Goalkeeper", cls: "bg-violet-700 text-white" },
  { key: "DEF", label: "Defender", cls: "bg-sky-700 text-white" },
  { key: "MID", label: "Midfielder", cls: "bg-emerald-700 text-white" },
  { key: "FWD", label: "Forward", cls: "bg-amber-400 text-slate-900" },
];

const LINE_CLASS = Object.fromEntries(LINES.map((l) => [l.key, l.cls])) as Record<Line, string>;

function PitchMarkings() {
  return (
    <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="0" y={i * 15.625} width="100" height="15.625" fill={i % 2 === 0 ? "#eef5f0" : "#e6f0e9"} />
      ))}
      <g fill="none" stroke="#8fb7a0" strokeWidth="0.5" strokeLinejoin="round">
        <rect x="3" y="3" width="94" height="119" />
        <path d="M37 3 A13 13 0 0 0 63 3" />
        <rect x="28" y="102" width="44" height="20" />
        <rect x="39" y="113" width="22" height="9" />
        <path d="M45.9 102 A9 9 0 0 1 54.1 102" />
        <rect x="44" y="122" width="12" height="2.5" />
        <path d="M3 119.5 A2.5 2.5 0 0 1 5.5 122" />
        <path d="M97 119.5 A2.5 2.5 0 0 0 94.5 122" />
      </g>
      <circle cx="50" cy="110" r="0.7" fill="#8fb7a0" />
    </svg>
  );
}

function PlayerToken({
  player,
  captain,
  offMinute,
}: {
  player: LineupPlayerDTO;
  captain: boolean;
  offMinute?: number;
}) {
  const title = `${player.playerName}, ${player.position}${offMinute != null ? `, subbed off ${offMinute}'` : ""}`;
  return (
    <div className="flex flex-col items-center" title={title}>
      <div
        className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold tabular-nums shadow-sm ring-2 ring-white ${
          LINE_CLASS[lineOf(player.position)]
        }`}
      >
        {player.squadNumber}
        {captain && (
          <span
            aria-label="Captain"
            className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-slate-900 text-[9px] font-bold text-white ring-1 ring-white"
          >
            C
          </span>
        )}
        {offMinute != null && (
          <span
            aria-label={`Subbed off ${offMinute} minutes`}
            className="absolute -left-3 -top-1 flex items-center rounded-full bg-rose-600 px-1 py-px text-[9px] font-bold leading-none text-white ring-1 ring-white"
          >
            <ArrowDown size={8} strokeWidth={3} />
            {offMinute}&apos;
          </span>
        )}
      </div>
      <span className="mt-1 max-w-[80px] truncate text-xs font-semibold leading-4 text-slate-800 [text-shadow:0_0_3px_#fff,0_0_3px_#fff]">
        {surname(player.playerName)}
      </span>
    </div>
  );
}

function Pitch({ rows, captainId, subs }: { rows: LineupPlayerDTO[][]; captainId: number; subs: SubInfo }) {
  // Attackers at the top, goalkeeper at the bottom.
  const topToBottom = [...rows].reverse();

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-xl border border-emerald-900/10">
      <PitchMarkings />
      <div className="absolute inset-0 flex flex-col justify-between px-[4%] pb-[4%] pt-[7%]">
        {topToBottom.map((row, index) => (
          <div
            key={index}
            className="mx-auto flex justify-around"
            style={{ width: `${Math.min(100, 38 + row.length * 15)}%` }}
          >
            {row.map((player) => (
              <PlayerToken
                key={player.playerId}
                player={player}
                captain={player.playerId === captainId}
                offMinute={subs.off.get(player.playerId)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team selector                                                       */
/* ------------------------------------------------------------------ */

function TeamTab({ team, side, active, onClick }: { team: MatchLineupDTO; side: Side; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 ${
        active ? "bg-white" : "bg-slate-50 hover:bg-white"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
          active ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
        }`}
      >
        {initials(team.teamName)}
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}>
          {team.teamName}
        </span>
        <span className="block text-sm text-slate-500">
          {side === "home" ? "Home" : "Away"}{" "}
          <span className="font-semibold tabular-nums text-slate-700">{formationLabel(team.formation)}</span>
        </span>
      </span>
      {active && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */

function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
      {children}
      {count != null && (
        <span className="rounded-full bg-slate-100 px-1.5 text-xs font-medium tabular-nums text-slate-500">{count}</span>
      )}
    </h4>
  );
}

function MinutePill({ value, kind }: { value: number; kind: "on" | "off" }) {
  const Icon = kind === "on" ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
        kind === "on" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {value}&apos;
    </span>
  );
}

function PlayerChip({
  player,
  onMinute,
  offMinute,
  muted,
}: {
  player: LineupPlayerDTO;
  onMinute?: number;
  offMinute?: number;
  muted?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
        muted
          ? "border-dashed border-slate-200"
          : onMinute != null
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-slate-200"
      }`}
    >
      <span className="w-5 shrink-0 text-right text-sm font-bold tabular-nums text-slate-400">{player.squadNumber}</span>
      <span className={`min-w-0 flex-1 truncate text-sm font-medium ${muted ? "text-slate-500" : "text-slate-800"}`}>
        {player.playerName}
      </span>
      {onMinute != null && <MinutePill value={onMinute} kind="on" />}
      {offMinute != null && <MinutePill value={offMinute} kind="off" />}
      <span className="w-7 shrink-0 text-right text-xs text-slate-400">{player.position}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Board                                                               */
/* ------------------------------------------------------------------ */

function LineupBoard({
  home,
  away,
  events,
}: {
  home: MatchLineupDTO;
  away: MatchLineupDTO;
  events: MatchEventDTO[] | undefined;
}) {
  const [side, setSide] = useState<Side>("home");
  const team = side === "home" ? home : away;

  const { rows, fits } = useMemo(
    () => buildRows(team.lineup.filter((p) => p.status === "STARTER"), team.formation),
    [team]
  );
  const subs = useMemo(() => collectSubs(events, team), [events, team]);
  const names = useMemo(() => new Map<number, string>(team.lineup.map((p) => [p.playerId, p.playerName])), [team]);
  const bench = useMemo(
    () => team.lineup.filter((p) => p.status === "SUBSTITUTE").sort((a, b) => a.squadNumber - b.squadNumber),
    [team]
  );
  const unavailable = team.lineup.filter((p) => p.status === "MISSING");

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div role="tablist" aria-label="Team" className="flex divide-x divide-slate-200 border-b border-slate-200">
        <TeamTab team={home} side="home" active={side === "home"} onClick={() => setSide("home")} />
        <TeamTab team={away} side="away" active={side === "away"} onClick={() => setSide("away")} />
      </div>

      <div
        role="tabpanel"
        className="grid divide-y divide-slate-200 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:divide-x lg:divide-y-0"
      >
        {/* Pitch */}
        <div className="p-4">
          <Pitch rows={rows} captainId={team.captainId} subs={subs} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            {LINES.map((line) => (
              <span key={line.key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${line.cls}`} />
                {line.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-slate-900 text-[8px] font-bold text-white">
                C
              </span>
              Captain
            </span>
            {subs.list.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="flex items-center rounded-full bg-rose-600 px-1 py-px text-[9px] font-bold leading-none text-white">
                  <ArrowDown size={8} strokeWidth={3} />
                  60&apos;
                </span>
                Subbed off
              </span>
            )}
          </div>
          {!fits && (
            <p className="mt-2 text-center text-xs text-amber-700">
              Submitted positions don&apos;t match this formation, so players are grouped by position.
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5 p-4">
          {subs.list.length > 0 && (
            <div>
              <SectionTitle count={subs.list.length}>Substitutions</SectionTitle>
              <ul className="mt-2 space-y-1.5">
                {subs.list.map((sub) => (
                  <li
                    key={`${sub.minute}-${sub.onId}-${sub.offId}`}
                    className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="w-8 shrink-0 pt-px text-xs font-bold tabular-nums text-slate-500">
                      {sub.minute}&apos;
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-0.5">
                      <span className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-900">
                        <ArrowUp size={13} strokeWidth={2.5} className="shrink-0 text-emerald-600" />
                        <span className="truncate">{names.get(sub.onId) ?? "Unknown player"}</span>
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 text-slate-500">
                        <ArrowDown size={13} strokeWidth={2.5} className="shrink-0 text-rose-500" />
                        <span className="truncate">{names.get(sub.offId) ?? "Unknown player"}</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <SectionTitle count={bench.length}>Bench</SectionTitle>
            {bench.length ? (
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {bench.map((player) => (
                  <PlayerChip
                    key={player.playerId}
                    player={player}
                    onMinute={subs.on.get(player.playerId)}
                    offMinute={subs.off.get(player.playerId)}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No substitutes submitted.</p>
            )}
          </div>

          {unavailable.length > 0 && (
            <div>
              <SectionTitle count={unavailable.length}>Not available</SectionTitle>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {unavailable.map((player) => (
                  <PlayerChip key={player.playerId} player={player} muted />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export default function MatchLineupPanel() {
  const params = useParams<{ matchId: string }>();
  const matchId = Number(params.matchId);
  const validMatchId = Number.isFinite(matchId) && matchId > 0;

  const { data: match, isLoading: matchLoading } = useGetMatchById(validMatchId ? matchId : undefined);
  const { data: lineups, isLoading, isError } = useGetMatchLineup(validMatchId ? matchId : undefined);
  const { data: summaries } = useGetMatchSummaries(validMatchId ? matchId : undefined);
  const events = useMemo(() => summaries?.flatMap((s) => s.summaries) ?? [], [summaries]);

  // Tick once a minute so the reveal window opens on its own, without a refresh.
  const now = useNow(60_000);

  if (!validMatchId)
    return <PanelState icon={<AlertCircle size={18} />} title="Invalid match" message="Open lineups from a valid match page." />;
  if (isLoading || matchLoading) return <LineupSkeleton />;
  if (isError)
    return (
      <PanelState
        icon={<AlertCircle size={18} />}
        title="Lineups unavailable"
        message="The team sheets couldn't be loaded. Refresh the page to try again."
      />
    );

  // Lineups stay hidden — even once submitted — until 30 minutes before
  // kickoff. Once a match is live/finished, matchDate is in the past, so
  // this window has already closed and lineups show as normal below.
  const kickoffMs = match?.matchDate ? new Date(match.matchDate).getTime() : null;
  const revealAtMs = kickoffMs != null ? kickoffMs - LINEUP_REVEAL_MS : null;
  const isBeforeReveal = revealAtMs != null && now < revealAtMs;

  if (isBeforeReveal) {
    return (
      <PanelState
        icon={<Clock size={18} />}
        title="Lineups not yet available"
        message={`Team sheets will be revealed 30 minutes before kickoff — check back in ${formatCountdown(
          revealAtMs - now
        )}.`}
      />
    );
  }

  if (!lineups?.homeTeam || !lineups.awayTeam)
    return (
      <PanelState
        icon={<CircleHelp size={18} />}
        title="Lineups not submitted"
        message="Team sheets appear here once both teams have submitted them."
      />
    );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Lineups</h2>
        {match?.stadium && <p className="text-sm text-slate-500">{match.stadium}</p>}
      </div>
      <LineupBoard home={lineups.homeTeam} away={lineups.awayTeam} events={events} />
    </section>
  );
}

function PanelState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <section className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <h2 className="mt-3 text-sm font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{message}</p>
    </section>
  );
}

function LineupSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-[68px] animate-pulse border-b border-slate-200 bg-slate-50" />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="aspect-[4/5] animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}