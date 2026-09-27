"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CircleHelp, Clock, MapPin } from "lucide-react";
import { useParams } from "next/navigation";

import { useGetMatchById } from "@/features/match/utils/match.api";
import { useGetMatchLineup } from "@/features/matchLineup/utils/matchLineup.api";
import type { LineupPlayerDTO, LineupStatus, MatchLineupDTO } from "@/features/matchLineup/utils/matchLineup.types";
import { useGetMatchSummaries } from "@/features/matchEvent/utils/matchEvent.api";
import type { MatchEventDTO } from "@/features/matchEvent/utils/matchEvent.types";

type Side = "home" | "away";

/* ------------------------------------------------------------------ */
/* Reveal window                                                       */
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
/* ------------------------------------------------------------------ */

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

const safeName = (name: string | null | undefined): string => (name ?? "").trim();

const surname = (name: string | null | undefined) => {
  const trimmed = safeName(name);
  if (!trimmed) return "Unknown";
  const parts = trimmed.split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : trimmed;
};

const initials = (name: string | null | undefined) => {
  const trimmed = safeName(name);
  if (!trimmed) return "FC";
  return trimmed.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "FC";
};

/* ------------------------------------------------------------------ */
/* Substitutions                                                       */
/* ------------------------------------------------------------------ */

const SUB_PRIMARY_IS_PLAYER_OFF = true;

interface SubInfo {
  off: Map<number, number>;
  on: Map<number, number>;
  list: { minute: number; offId: number; onId: number }[];
}

function collectSubs(events: MatchEventDTO[] | undefined, team: MatchLineupDTO): SubInfo {
  const status = new Map<number, LineupStatus>(team.lineup.map((p) => [p.playerId, p.status]));
  const info: SubInfo = { off: new Map(), on: new Map(), list: [] };

  const idsInTeam = new Set<number>(team.lineup.map((p) => p.playerId));
  const idByName = new Map<string, number>(
    team.lineup
      .filter((p) => safeName(p.playerName).length > 0)
      .map((p) => [safeName(p.playerName).toLowerCase(), p.playerId])
  );
  const resolve = (id: number | null, name: string | null): number | null => {
    if (id != null && idsInTeam.has(id)) return id;
    const trimmedName = safeName(name);
    return trimmedName ? (idByName.get(trimmedName.toLowerCase()) ?? null) : null;
  };

  const subEvents = (events ?? [])
    .filter((e) => e.eventType === "SUBSTITUTION")
    .sort((a, b) => a.minute - b.minute || a.second - b.second);

  for (const event of subEvents) {
    const a = resolve(event.primaryPlayerId, event.primaryPlayerName);
    const b = resolve(event.secondaryPlayerId, event.secondaryPlayerName);
    if (a == null || b == null) continue;

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
/* Role palette                                                        */
/* ------------------------------------------------------------------ */

const LINES: { key: Line; label: string; token: string; dot: string }[] = [
  { key: "GK", label: "Goalkeeper", token: "bg-violet-100 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  { key: "DEF", label: "Defender", token: "bg-sky-100 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  { key: "MID", label: "Midfielder", token: "bg-emerald-100 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  { key: "FWD", label: "Forward", token: "bg-amber-100 text-amber-900 ring-amber-200", dot: "bg-amber-500" },
];

const LINE_TOKEN = Object.fromEntries(LINES.map((l) => [l.key, l.token])) as Record<Line, string>;

/* ------------------------------------------------------------------ */
/* Pitch                                                               */
/* ------------------------------------------------------------------ */

function PitchMarkings() {
  return (
    <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={i * 12.5}
          width="100"
          height="12.5"
          fill={i % 2 === 0 ? "#f3f9f5" : "#eaf4ee"}
        />
      ))}

      <g fill="none" stroke="#b8d0c1" strokeWidth="0.5" strokeLinejoin="round">
        <rect x="3" y="3" width="94" height="119" />
        <path d="M3 62.5 H97" />
        <circle cx="50" cy="62.5" r="10.5" />
        <circle cx="50" cy="62.5" r="0.7" fill="#b8d0c1" stroke="none" />
        <rect x="22" y="3" width="56" height="19" />
        <rect x="36" y="3" width="28" height="8" />
        <path d="M41 3 A9 9 0 0 0 59 3" />
        <circle cx="50" cy="13" r="0.6" fill="#b8d0c1" stroke="none" />
        <rect x="22" y="103" width="56" height="19" />
        <rect x="36" y="114" width="28" height="8" />
        <path d="M41 122 A9 9 0 0 1 59 122" />
        <circle cx="50" cy="112" r="0.6" fill="#b8d0c1" stroke="none" />
        <path d="M3 8 A5 5 0 0 0 8 3" />
        <path d="M97 8 A5 5 0 0 1 92 3" />
        <path d="M3 117 A5 5 0 0 1 8 122" />
        <path d="M97 117 A5 5 0 0 0 92 122" />
      </g>
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
  const displayName = safeName(player.playerName) || "Unknown";
  const title = `${displayName}, ${player.position}${offMinute != null ? `, subbed off ${offMinute}'` : ""}`;
  const line = lineOf(player.position);

  return (
    <div className="flex flex-col items-center" title={title}>
      <div className="relative">
        <div
          className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-black tabular-nums ring-2 ring-white shadow-[0_2px_6px_rgba(15,23,42,0.12)] ${LINE_TOKEN[line]}`}
        >
          {player.squadNumber}
        </div>

        {captain && (
          <span
            aria-label="Captain"
            className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-slate-900 text-[8px] font-bold text-white ring-2 ring-white"
          >
            C
          </span>
        )}

        {offMinute != null && (
          <span
            aria-label={`Subbed off ${offMinute} minutes`}
            className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-rose-500 px-1 py-px text-[8px] font-black leading-none text-white ring-2 ring-white"
          >
            <ArrowDown size={7} strokeWidth={3} />
            {offMinute}&apos;
          </span>
        )}
      </div>

      {/* Name — reduced to text-[11px] */}
      <span className="mt-1.5 max-w-[80px] truncate text-[11px] font-semibold leading-4 text-slate-800">
        {surname(player.playerName)}
      </span>
    </div>
  );
}

function Pitch({ rows, captainId, subs }: { rows: LineupPlayerDTO[][]; captainId: number; subs: SubInfo }) {
  const topToBottom = [...rows].reverse();

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-2xl border border-emerald-900/10 shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
      <PitchMarkings />
      <div className="absolute inset-0 flex flex-col justify-between px-[4%] pb-[6%] pt-[10%]">
        {topToBottom.map((row, index) => (
          <div
            key={index}
            className="mx-auto flex justify-around gap-1"
            style={{ width: `${Math.min(100, 40 + row.length * 14)}%` }}
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
/* Team tabs — with slate backdrop                                     */
/* ------------------------------------------------------------------ */

function TabBar({
  home,
  away,
  side,
  onChange,
}: {
  home: MatchLineupDTO;
  away: MatchLineupDTO;
  side: Side;
  onChange: (side: Side) => void;
}) {
  const tabs: { key: Side; team: MatchLineupDTO; label: string }[] = [
    { key: "home", team: home, label: "Home" },
    { key: "away", team: away, label: "Away" },
  ];

  return (
    <nav
      className="flex max-w-full gap-1 overflow-x-auto border-b border-slate-100 bg-slate-100/70 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Team"
    >
      {tabs.map(({ key, team, label }) => {
        const isActive = side === key;

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`group flex min-w-0 flex-1 shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition-colors ${isActive
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[9px] font-black tracking-wide transition-colors ${isActive
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 group-hover:text-slate-600"
                }`}
            >
              {initials(team.teamName)}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-[10px] font-black uppercase tracking-[0.06em] ${isActive ? "text-emerald-700" : "text-slate-600"
                  }`}
              >
                {team.teamName}
              </span>
              <span className="mt-0.5 flex items-baseline gap-1.5 text-[9px]">
                <span
                  className={`uppercase tracking-wider ${isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {label}
                </span>
                <span
                  className={`font-bold tabular-nums ${isActive ? "text-slate-700" : "text-slate-400"
                    }`}
                >
                  {formationLabel(team.formation)}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Details panel                                                       */
/* ------------------------------------------------------------------ */

function SectionTitle({ children, count, accent }: { children: ReactNode; count?: number; accent?: string }) {
  return (
    <h4 className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
      {accent && <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />}
      {children}
      {count != null && (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-slate-600">
          {count}
        </span>
      )}
    </h4>
  );
}

function MinutePill({ value, kind }: { value: number; kind: "on" | "off" }) {
  const Icon = kind === "on" ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black tabular-nums ${kind === "on" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
        }`}
    >
      <Icon size={9} strokeWidth={3} />
      {value}&apos;
    </span>
  );
}

function SubstitutionRow({
  minute,
  onName,
  offName,
}: {
  minute: number;
  onName: string;
  offName: string;
}) {
  return (
    <li className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-colors hover:border-slate-300">
      <div className="flex items-stretch">
        <div className="relative flex w-11 shrink-0 flex-col items-center justify-center bg-slate-50/80 py-2.5">
          <span className="text-[12px] font-black tabular-nums leading-none text-slate-700">
            {minute}
          </span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
            min
          </span>
          <span
            aria-hidden="true"
            className="absolute right-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <ArrowUp size={10} strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-900">
              {onName}
            </span>
          </div>

          <span aria-hidden="true" className="ml-6 h-px w-[calc(100%-1.5rem)] bg-slate-100" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
              <ArrowDown size={10} strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-slate-500 line-through decoration-slate-300">
              {offName}
            </span>
          </div>
        </div>
      </div>
    </li>
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
  const line = lineOf(player.position);
  const dot = LINES.find((l) => l.key === line)?.dot ?? "bg-slate-300";

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${muted
          ? "border-dashed border-slate-200 bg-slate-50/50"
          : onMinute != null
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
    >
      <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-[10px] font-black tabular-nums text-slate-600">
        {player.squadNumber}
        <span className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-white ${dot}`} />
      </span>
      {/* Player name — reduced to text-[13px] */}
      <span className={`min-w-0 flex-1 truncate text-[13px] font-medium ${muted ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800"}`}>
        {safeName(player.playerName) || "Unknown"}
      </span>
      {onMinute != null && <MinutePill value={onMinute} kind="on" />}
      {offMinute != null && <MinutePill value={offMinute} kind="off" />}
      <span className="w-7 shrink-0 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
        {player.position}
      </span>
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
  const names = useMemo(
    () => new Map<number, string>(team.lineup.map((p) => [p.playerId, safeName(p.playerName) || "Unknown"])),
    [team]
  );
  const bench = useMemo(
    () => team.lineup.filter((p) => p.status === "SUBSTITUTE").sort((a, b) => a.squadNumber - b.squadNumber),
    [team]
  );
  const unavailable = team.lineup.filter((p) => p.status === "MISSING");

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TabBar home={home} away={away} side={side} onChange={setSide} />

      <div className="grid divide-y divide-slate-200 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
        {/* Pitch column */}
        <div className="bg-gradient-to-b from-emerald-50/60 to-emerald-50/20 p-4 sm:p-5">
          <Pitch rows={rows} captainId={team.captainId} subs={subs} />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {LINES.map((line) => (
              <span key={line.key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${line.dot}`} />
                {line.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-slate-900 text-[7px] font-black text-white">
                C
              </span>
              Captain
            </span>
            {subs.list.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="flex items-center rounded-full bg-rose-500 px-1 py-px text-[7px] font-black leading-none text-white">
                  <ArrowDown size={6} strokeWidth={3} />
                </span>
                Subbed off
              </span>
            )}
          </div>

          {!fits && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[9px] font-semibold text-amber-800">
              Submitted positions don&apos;t match this formation — players are grouped by position.
            </p>
          )}
        </div>

        {/* Details column */}
        <div className="space-y-5 p-4 sm:p-5">
          {subs.list.length > 0 && (
            <div>
              <SectionTitle count={subs.list.length} accent="bg-rose-400">Substitutions</SectionTitle>
              <ul className="mt-2.5 space-y-1.5">
                {subs.list.map((sub) => (
                  <SubstitutionRow
                    key={`${sub.minute}-${sub.onId}-${sub.offId}`}
                    minute={sub.minute}
                    onName={names.get(sub.onId) ?? "Unknown player"}
                    offName={names.get(sub.offId) ?? "Unknown player"}
                  />
                ))}
              </ul>
            </div>
          )}

          <div>
            <SectionTitle count={bench.length} accent="bg-emerald-400">Bench</SectionTitle>
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
              <p className="mt-2 text-[13px] text-slate-400">No substitutes submitted.</p>
            )}
          </div>

          {unavailable.length > 0 && (
            <div>
              <SectionTitle count={unavailable.length} accent="bg-slate-300">Not available</SectionTitle>
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

  useEffect(() => {
    console.log("[MatchLineupPanel] lineups:", lineups);
  }, [lineups]);

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
  return <LineupBoard home={lineups.homeTeam} away={lineups.awayTeam} events={events} />
}

function PanelState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <section className="flex min-h-45 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      <p className="max-w-xs text-[11px] leading-5 text-slate-500">{message}</p>
    </section>
  );
}

function LineupSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-1 overflow-hidden border-b border-slate-100 bg-slate-100/70 p-1.5">
        <span className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
        <span className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="aspect-[4/5] animate-pulse rounded-xl bg-emerald-50" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </section>
  );
}