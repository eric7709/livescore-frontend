"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Formation,
  LineupStatus,
  MissingReason,
  LineupPlayerRequest,
  MatchLineUpRequest,
  DragTargetType,
  SidebarTab,
  SlotCoordinate,
  RowLayoutTemplate,
} from "../../../utils/matchLineup.types";
import { Position, PlayerStatus } from "@/features/profile/utils/profile.types";
import { useTeamSquad } from "@/features/team/utils/team.api";
import { useGetMatchById } from "@/features/match/utils/match.api";
import { MatchDTO } from "@/features/match/utils/match.types";
import {
  useGetOpponentLineup,
  useGetTeamLineup,
  useSubmitLineup,
  useUpdateLineup,
} from "../../../utils/matchLineup.api";
import { FaTimes } from "react-icons/fa";
import { Player } from "@/features/team/utils/team.types";

// ============================================================
// CONSTANTS
// ============================================================

const FORMATIONS: Formation[] = [
  "F_4_4_2", "F_4_4_1_1", "F_4_3_3", "F_4_3_2_1", "F_4_3_1_2", "F_4_2_3_1", "F_4_2_2_2",
  "F_4_2_4", "F_4_1_4_1", "F_4_1_3_2", "F_4_1_2_1_2", "F_4_1_2_3", "F_4_5_1", "F_3_4_3",
  "F_3_4_2_1", "F_3_4_1_2", "F_3_5_2", "F_3_5_1_1", "F_3_6_1", "F_3_2_4_1", "F_5_4_1",
  "F_5_3_2", "F_5_2_3", "F_2_3_5", "F_WM",
];

const MISSING_REASONS: MissingReason[] = ["INJURED", "SUSPENDED", "ILLNESS", "PERSONAL", "UNKNOWN"];

const REASON_LABEL: Record<MissingReason, string> = {
  INJURED: "Injured",
  SUSPENDED: "Suspended",
  ILLNESS: "Illness",
  PERSONAL: "Personal",
  UNKNOWN: "Unknown",
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getManagerDashboardPath(teamId: string | null): string {
  return teamId ? `/manager/${teamId}/fixtures` : "/manager";
}

type PendingAction = "picking-reason" | null;
type Toast = { type: "success" | "error"; message: string } | null;
type TeamSide = "home" | "away" | "unknown";

interface MissingEntry {
  playerId: string;
  reason: MissingReason;
}

// Shape we rely on from an opponent lineup entry. Names and numbers are
// filled in from the opponent's squad (looked up by playerId), falling back
// to whatever the lineup payload itself carries. slotLabel is the exact
// formation slot ("LCM", "RCM", "GK", ...) the player occupied when the
// lineup was saved — present on anything saved after the slotLabel change,
// absent on older data, which falls back to canonical position matching.
type OpponentLineupPlayer = {
  playerId: number | string;
  position: Position;
  status: string;
  slotLabel?: string;
  fullName?: string;
  squadNumber?: number;
};

const unique = (ids: string[]): string[] => Array.from(new Set(ids));

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// "Last F." — used for the compact name tag under a pitch token, on both
// the player's own lineup and the opponent overlay. A single-word name
// (no first name on record) is shown as-is rather than adding a stray ".".
function pitchName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name;
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const firstInitial = parts[0][0];
  return `${lastName} ${firstInitial}.`;
}

function formationLabel(formation: Formation): string {
  if (formation === "F_WM") return "WM · 3-2-2-3";
  return formation.replace(/^F_/, "").split("_").filter((item) => /^\d+$/.test(item)).join("-");
}

function mapSlotLabelToPosition(label: string): Position {
  const positions: Record<string, Position> = {
    GK: "GK", CB: "CB", LCB: "CB", RCB: "CB", LB: "LB", RB: "RB",
    LWB: "LWB", RWB: "RWB", CM: "CM", LCM: "CM", RCM: "CM",
    LM: "LM", RM: "RM", CDM: "CDM", LCDM: "CDM", RCDM: "CDM",
    CAM: "CAM", ST: "ST", LS: "ST", RS: "ST", LW: "LW", RW: "RW",
    CF: "CF", LCF: "CF", RCF: "CF", LF: "CF", RF: "CF",
  };
  return positions[label] ?? "CM";
}

// Assigns a flat list of players to formation slots. Three passes:
//   1. Exact slot label match ("LCM" -> "LCM") — deterministic, used for
//      anything saved with a slotLabel.
//   2. Canonical position match ("LCM"/"CM"/"RCM" all -> "CM") — fallback
//      for lineups saved before slotLabel existed. This pass is ambiguous
//      when more than one player shares a canonical position, which is
//      exactly the bug slotLabel exists to avoid; it's kept only so old
//      data still renders something reasonable.
//   3. Leftovers fill whatever empty slots remain, in no particular order.
// Used for the opponent's read-only overlay.
function assignPlayersToSlots<T extends { position: Position; slotLabel?: string }>(
  players: T[],
  layout: SlotCoordinate[],
): Array<T | null> {
  const pool = players.slice();
  const result: Array<T | null> = layout.map(() => null);

  layout.forEach((slot, index) => {
    const matchIndex = pool.findIndex((player) => player.slotLabel === slot.label);
    if (matchIndex >= 0) {
      result[index] = pool[matchIndex];
      pool.splice(matchIndex, 1);
    }
  });

  layout.forEach((slot, index) => {
    if (result[index] != null) return;
    const slotPosition = mapSlotLabelToPosition(slot.label);
    const matchIndex = pool.findIndex((player) => player.position === slotPosition);
    if (matchIndex >= 0) {
      result[index] = pool[matchIndex];
      pool.splice(matchIndex, 1);
    }
  });

  result.forEach((slot, index) => {
    if (slot != null || pool.length === 0) return;
    result[index] = pool.shift() ?? null;
  });

  return result;
}

function isMatchLocked(match: MatchDTO | undefined): boolean {
  if (!match) return false;
  return (
    match.status === "LIVE" ||
    match.status === "FINISHED" ||
    match.status === "ABANDONED" ||
    match.startedAt != null
  );
}

function lockedReasonLabel(match: MatchDTO | undefined): string {
  if (match?.status === "FINISHED") return "This match has finished";
  if (match?.status === "ABANDONED") return "This match was abandoned";
  return "This match has started";
}

// A player is only eligible to start or sit on the bench when their status
// is ACTIVE. INJURED/SUSPENDED (and anything else non-active) must default
// to — and stay in — the "missing" group, both when a lineup is first
// auto-built and when a saved lineup is reopened after their status changed.
function isPlayerAvailable(player: Player): boolean {
  return player.status === "ACTIVE";
}

function missingReasonForStatus(status: PlayerStatus): MissingReason {
  if (status === "INJURED") return "INJURED";
  if (status === "SUSPENDED") return "SUSPENDED";
  return "UNKNOWN";
}

function findCaptainCandidates(squad: Player[]): { captain: Player | null; vice: Player | null } {
  const captain = squad.find((player) => player.captainStatus === "CAPTAIN") ?? null;
  const vice = squad.find((player) => player.captainStatus === "VICE_CAPTAIN") ?? null;
  return { captain, vice };
}

function rowLabels(size: number, type: "DEF" | "MID" | "FWD"): string[] {
  const labels: Record<"DEF" | "MID" | "FWD", Record<number, string[]>> = {
    DEF: {
      1: ["CB"],
      2: ["CB", "CB"],
      3: ["LCB", "CB", "RCB"],
      4: ["LB", "LCB", "RCB", "RB"],
      5: ["LWB", "LCB", "CB", "RCB", "RWB"],
    },
    MID: {
      1: ["CM"],
      2: ["CM", "CM"],
      3: ["LCM", "CM", "RCM"],
      4: ["LM", "LCM", "RCM", "RM"],
      5: ["LM", "LCM", "CM", "RCM", "RM"],
      6: ["LM", "LCM", "CM", "CM", "RCM", "RM"],
    },
    FWD: {
      1: ["ST"],
      2: ["LS", "RS"],
      3: ["LW", "ST", "RW"],
      4: ["LW", "LCF", "RCF", "RW"],
      5: ["LW", "LF", "CF", "RF", "RW"],
      6: ["LW", "LF", "LCF", "RCF", "RF", "RW"],
    },
  };
  return labels[type][size] ?? Array.from({ length: size }, () => type);
}

function layoutRow(size: number, type: "DEF" | "MID" | "FWD"): RowLayoutTemplate[] {
  const spreadBySize: Record<number, number> = { 1: 0, 2: 38, 3: 54, 4: 64, 5: 68, 6: 70 };
  const labels = rowLabels(size, type);
  const spread = spreadBySize[size] ?? 64;
  if (size === 1) return [{ xOff: 0, y: 50, label: labels[0] }];
  return Array.from({ length: size }, (_, index) => ({
    xOff: 0,
    y: 50 - spread / 2 + (spread * index) / (size - 1),
    label: labels[index],
  }));
}

function computeHorizontalLayout(formation: Formation): SlotCoordinate[] {
  const rows =
    formation === "F_WM"
      ? [3, 2, 2, 3]
      : formation.replace(/^F_/, "").split("_").map(Number).filter((value) => !Number.isNaN(value) && value > 0);

  const firstOutfieldRowX = 24;
  const finalOutfieldRowX = 82;
  const slots: SlotCoordinate[] = [{ x: 10, y: 50, label: "GK" }];

  rows.forEach((size, rowIndex) => {
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === rows.length - 1;
    const type: "DEF" | "MID" | "FWD" = isFirstRow ? "DEF" : isLastRow ? "FWD" : "MID";
    const x =
      rows.length === 1
        ? (firstOutfieldRowX + finalOutfieldRowX) / 2
        : firstOutfieldRowX + (rowIndex * (finalOutfieldRowX - firstOutfieldRowX)) / (rows.length - 1);

    layoutRow(size, type).forEach((slot) => {
      slots.push({ x: x + slot.xOff, y: slot.y, label: slot.label });
    });
  });

  return slots;
}

function computeLayout(formation: Formation, isMobile: boolean): SlotCoordinate[] {
  const horizontal = computeHorizontalLayout(formation);
  if (!isMobile) return horizontal;
  return horizontal.map(({ x, y, label }) => ({ x: y, y: 100 - x, label }));
}

function teamInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) ?? "FC").toUpperCase();
}

// ============================================================
// PRESENTATIONAL COMPONENTS
// ============================================================

function ErrorState({ title, message }: { title: string; message: string }): React.JSX.Element {
  return (
    <main className="lb-error-page">
      <style>{`
        .lb-error-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #090d10;
          color: #f4f7f5;
        }
        .lb-error-card {
          width: min(100%, 460px);
          padding: 36px;
          text-align: center;
          border: 2px solid rgba(255,112,104,.30);
          border-radius: 22px;
          background: linear-gradient(145deg, rgba(52,20,23,.90), rgba(19,21,24,.96));
          box-shadow: 0 24px 80px rgba(0,0,0,.38);
        }
        .lb-error-icon { font-size: 38px; margin-bottom: 12px; }
        .lb-error-card h1 { margin: 0 0 8px; color: #ff9d96; font-size: 20px; }
        .lb-error-card p { margin: 0 0 20px; color: rgba(255,255,255,.70); line-height: 1.6; font-size: 13px; }
        .lb-error-card a {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 38px; padding: 0 15px; border-radius: 11px;
          color: #fff; background: rgba(255,255,255,.08);
          border: 2px solid rgba(255,255,255,.14); text-decoration: none;
          font-size: 12px; font-weight: 800;
        }
        .lb-error-card a:hover { background: rgba(255,255,255,.14); }
      `}</style>
      <section className="lb-error-card">
        <div className="lb-error-icon" aria-hidden="true">⚠</div>
        <h1>{title}</h1>
        <p>{message}</p>
        <a href="/manager">Return to dashboard</a>
      </section>
    </main>
  );
}

function FormationSelect({
  value,
  disabled,
  onChange,
}: {
  value: Formation;
  disabled: boolean;
  onChange: (formation: Formation) => void;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lb-formation-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`lb-formation-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold">{formationLabel(value)}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="lb-formation-menu" role="listbox">
          {FORMATIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              className={`lb-formation-item font-semibold! text-sm! ${formation === value ? "active" : ""}`}
              onClick={() => {
                onChange(formation);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={formation === value}
            >
              {formationLabel(formation)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  player,
  status,
  selected,
  locked = false,
  onClick,
}: {
  player: Player;
  status: "starter" | "bench" | "missing" | "pool";
  selected: boolean;
  locked?: boolean;
  onClick: () => void;
}): React.JSX.Element {
  const statusText: Record<typeof status, string> = {
    starter: "XI",
    bench: "SUB",
    missing: "OUT",
    pool: "POOL",
  };

  return (
    <button
      type="button"
      className={`lb-player-card ${status} ${selected ? "selected" : ""}`}
      onClick={onClick}
      disabled={locked}
      aria-pressed={selected}
      aria-disabled={locked}
    >
      <span className="lb-player-number">{player.squadNumber}</span>
      <span className="lb-player-copy">
        <span className="lb-player-fullname">{player.fullName}</span>
        <span className="lb-player-role">
          {player.position} <i /> {statusText[status]}
        </span>
      </span>
      <span className="lb-card-select" aria-hidden="true">›</span>
    </button>
  );
}

function TeamCrest({
  name,
  logoUrl,
  compact = false,
}: {
  name: string;
  logoUrl: string | null;
  compact?: boolean;
}): React.JSX.Element {
  return (
    <span className={`lb-team-crest ${compact ? "compact" : ""}`} aria-label={`${name} crest`}>
      <span className="lb-crest-monogram" aria-hidden="true">{teamInitials(name)}</span>
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          className="lb-crest-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "starter" | "captain" | "sub" | "out" | "pool";
  children: React.ReactNode;
}): React.JSX.Element {
  return <span className={`lb-status-pill ${tone}`}>{children}</span>;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LineupBuilder({
  matchId,
  teamId,
}: {
  matchId: number;
  teamId: number;
}): React.JSX.Element {
  if (!matchId || !teamId) {
    return (
      <ErrorState
        title="Invalid lineup link"
        message="This lineup needs a valid match and team. Open it from the match dashboard and try again."
      />
    );
  }

  return <LineupBuilderContent matchId={matchId} teamId={teamId} />;
}

function LineupBuilderContent({
  matchId,
  teamId,
}: {
  matchId: number;
  teamId: number;
}): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const teamIdParam = searchParams.get("team");
  const managerDashboardPath = getManagerDashboardPath(teamIdParam);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const { data: squadData, isLoading: squadLoading, isError: squadError } = useTeamSquad(teamId);
  const { data: existingLineup, isLoading: lineupLoading, isError: lineupError } = useGetTeamLineup(matchId, teamId);
  const { data: match, isLoading: matchLoading, isError: matchError } = useGetMatchById(matchId);
  const { data: opponentLineUp } = useGetOpponentLineup(matchId, teamId);

  // The opponent's id comes from the match. useTeamSquad should skip the
  // request while this is falsy (add `enabled: !!teamId` inside it if not).
  const opponentTeamId = match?.homeTeamId === teamId ? match?.awayTeamId : match?.homeTeamId;
  const { data: opponentSquadData } = useTeamSquad(opponentTeamId as number);

  const submitLineup = useSubmitLineup();
  const updateLineup = useUpdateLineup();

  // ============================================================
  // DERIVED DATA
  // ============================================================

  const squad = useMemo<Player[]>(() => squadData?.squad ?? [], [squadData]);
  const playerById = useMemo(() => new Map(squad.map((player) => [player.id, player])), [squad]);

  const opponentPlayerById = useMemo(
    () => new Map((opponentSquadData?.squad ?? []).map((player) => [String(player.id), player])),
    [opponentSquadData],
  );

  const teamPresentation = useMemo<{
    side: TeamSide;
    name: string;
    logoUrl: string | null;
    opponentName: string | null;
    opponentLogoUrl: string | null;
  }>(() => {
    if (match?.homeTeamId === teamId) {
      return {
        side: "home",
        name: match.homeTeamName?.trim() || "Home Team",
        logoUrl: match.homeTeamLogoUrl,
        opponentName: match.awayTeamName?.trim() || null,
        opponentLogoUrl: match.awayTeamLogoUrl,
      };
    }

    if (match?.awayTeamId === teamId) {
      return {
        side: "away",
        name: match.awayTeamName?.trim() || "Away Team",
        logoUrl: match.awayTeamLogoUrl,
        opponentName: match.homeTeamName?.trim() || null,
        opponentLogoUrl: match.homeTeamLogoUrl,
      };
    }

    return {
      side: "unknown",
      name: matchLoading ? "Loading team…" : "Team Lineup",
      logoUrl: null,
      opponentName: null,
      opponentLogoUrl: null,
    };
  }, [match, matchLoading, teamId]);

  const { side: teamSide, name: teamName, logoUrl: teamLogoUrl, opponentName, opponentLogoUrl } = teamPresentation;

  const isLiveOrDecided = match?.status === "LIVE" || match?.status === "FINISHED" || match?.status === "ABANDONED";

  const matchScore =
    isLiveOrDecided && match?.homeScore != null && match?.awayScore != null
      ? `${match.homeScore} — ${match.awayScore}`
      : "VS";

  const isLoading = squadLoading || lineupLoading || matchLoading;
  const hasLoadError = squadError || lineupError || matchError;
  const isEditing = existingLineup != null;
  const isLocked = isMatchLocked(match);
  const isSaving = submitLineup.isPending || updateLineup.isPending;
  const saveHasError = submitLineup.isError || updateLineup.isError;

  // ============================================================
  // STATE
  // ============================================================

  const [formation, setFormation] = useState<Formation>("F_4_3_3");
  const [slots, setSlots] = useState<Array<string | null>>([]);
  const [bench, setBench] = useState<string[]>([]);
  const [missing, setMissing] = useState<MissingEntry[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>("bench");
  const [toast, setToast] = useState<Toast>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [formationPulse, setFormationPulse] = useState(0);
  const [isSeeded, setIsSeeded] = useState(false);
  const [viewingOpponent, setViewingOpponent] = useState(false);

  const seedKeyRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // ============================================================
  // MEMOIZED DERIVATIONS
  // ============================================================

  const layout = useMemo(() => computeLayout(formation, isMobile), [formation, isMobile]);
  const missingIds = useMemo(() => missing.map((entry) => entry.playerId), [missing]);

  const opponentLayout = useMemo(
    () => (opponentLineUp ? computeLayout(opponentLineUp.formation, isMobile) : []),
    [opponentLineUp, isMobile],
  );

  // Opponent starters, enriched with names / numbers from their squad.
  const opponentStarters = useMemo<OpponentLineupPlayer[]>(
    () =>
      ((opponentLineUp?.lineup ?? []) as OpponentLineupPlayer[])
        .filter((player) => player.status === "STARTER")
        .map((player) => {
          const squadPlayer = opponentPlayerById.get(String(player.playerId));
          return {
            ...player,
            fullName: squadPlayer?.fullName ?? player.fullName,
            squadNumber: squadPlayer?.squadNumber ?? player.squadNumber,
          };
        }),
    [opponentLineUp, opponentPlayerById],
  );

  const opponentSlotAssignments = useMemo(
    () => assignPlayersToSlots(opponentStarters, opponentLayout),
    [opponentLayout, opponentStarters],
  );

  const swapTargets = useMemo(() => {
    if (selectedId == null) return [];
    const selected = playerById.get(selectedId);
    if (!selected || slots.includes(selectedId)) return [];

    const targets = slots.flatMap((occupantId, slotIndex) => {
      if (occupantId == null) return [];
      const occupant = playerById.get(occupantId);
      if (!occupant) return [];
      const slotPosition = mapSlotLabelToPosition(layout[slotIndex]?.label ?? "CM");
      return [{ player: occupant, slotIndex, samePosition: slotPosition === selected.position }];
    });

    return [...targets.filter((t) => t.samePosition), ...targets.filter((t) => !t.samePosition)];
  }, [layout, playerById, selectedId, slots]);

  const selectedPlayer = selectedId == null ? undefined : playerById.get(selectedId);
  const selectedIsStarter = selectedId != null && slots.includes(selectedId);
  const selectedIsBench = selectedId != null && bench.includes(selectedId);
  const selectedMissingEntry = useMemo(
    () => missing.find((entry) => entry.playerId === selectedId),
    [missing, selectedId],
  );
  const selectedIsMissing = selectedMissingEntry != null;

  const unassignedPlayers = useMemo(
    () => squad.filter((player) => !slots.includes(player.id) && !bench.includes(player.id) && !missingIds.includes(player.id)),
    [bench, missingIds, slots, squad],
  );

  const missingPlayers = useMemo(
    () => missing.flatMap((entry) => {
      const player = playerById.get(entry.playerId);
      return player ? [{ entry, player }] : [];
    }),
    [missing, playerById],
  );

  const starterCount = slots.filter((id): id is string => id != null).length;
  const openSlots = layout.length - starterCount;

  const assignedPlayerIds = useMemo(
    () => [...slots.filter((id): id is string => id != null), ...bench, ...missingIds],
    [bench, missingIds, slots],
  );

  const allPlayersAssigned =
    assignedPlayerIds.length === squad.length && unique(assignedPlayerIds).length === squad.length;

  const isValid = isSeeded && openSlots === 0 && captainId != null && slots.includes(captainId) && allPlayersAssigned;

  // Human-readable reasons the Save/Update button is disabled. Without this,
  // an action like subbing off (or swapping out) the current captain clears
  // captainId behind the scenes and the button just goes dark with nothing
  // in the UI explaining why — this makes the cause visible and actionable.
  const invalidReasons = useMemo(() => {
    if (!isSeeded) return [];
    const reasons: string[] = [];
    if (openSlots > 0) {
      reasons.push(`${openSlots} starting position${openSlots > 1 ? "s" : ""} still empty`);
    }
    if (captainId == null || !slots.includes(captainId)) {
      reasons.push("Select a captain from your starting XI");
    }
    if (!allPlayersAssigned) {
      reasons.push("Some squad players aren't assigned a status yet");
    }
    return reasons;
  }, [allPlayersAssigned, captainId, isSeeded, openSlots, slots]);

  // ============================================================
  // EFFECTS
  // ============================================================

  // Viewport detection
  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Reset on match/team change
  useEffect(() => {
    seedKeyRef.current = null;
    setIsSeeded(false);
    setSlots([]);
    setBench([]);
    setMissing([]);
    setCaptainId(null);
    setSelectedId(null);
    setPendingAction(null);
    setActiveTab("bench");
    setViewingOpponent(false);
  }, [matchId, teamId]);

  // Seed lineup data
  useEffect(() => {
    const seedKey = `${matchId}:${teamId}`;

    if (seedKeyRef.current === seedKey || isLoading || hasLoadError || squad.length === 0) {
      return;
    }

    const knownPlayerIds = new Set(squad.map((player) => player.id));
    const squadById = new Map(squad.map((player) => [player.id, player]));
    const initialFormation = existingLineup?.formation ?? "F_4_3_3";
    const initialLayout = computeHorizontalLayout(initialFormation);
    const nextSlots: Array<string | null> = Array.from({ length: initialLayout.length }, () => null);

    if (existingLineup) {
      // ===== EXISTING LINEUP: restore from saved data =====
      // Three passes, same logic as assignPlayersToSlots for the opponent
      // overlay: exact slotLabel match first (deterministic — this is what
      // keeps "your own view" and "opponent's view of you" identical),
      // canonical position match as a fallback for lineups saved before
      // slotLabel existed, then leftovers fill whatever's left.
      const starters = existingLineup.lineup
        .filter((player) => player.status === "STARTER" && knownPlayerIds.has(String(player.playerId)))
        .slice();

      initialLayout.forEach((slot, slotIndex) => {
        const starterIndex = starters.findIndex((player) => player.slotLabel === slot.label);
        if (starterIndex >= 0) {
          nextSlots[slotIndex] = String(starters[starterIndex].playerId);
          starters.splice(starterIndex, 1);
        }
      });

      initialLayout.forEach((slot, slotIndex) => {
        if (nextSlots[slotIndex] != null) return;
        const slotPosition = mapSlotLabelToPosition(slot.label);
        const starterIndex = starters.findIndex((player) => player.position === slotPosition);
        if (starterIndex >= 0) {
          nextSlots[slotIndex] = String(starters[starterIndex].playerId);
          starters.splice(starterIndex, 1);
        }
      });

      let remainingStarterIndex = 0;
      nextSlots.forEach((slot, slotIndex) => {
        if (slot != null || remainingStarterIndex >= starters.length) return;
        nextSlots[slotIndex] = String(starters[remainingStarterIndex].playerId);
        remainingStarterIndex += 1;
      });

      let nextBench = existingLineup.lineup
        .filter((player) => player.status === "SUBSTITUTE" && knownPlayerIds.has(String(player.playerId)))
        .map((player) => String(player.playerId));

      let nextMissing: MissingEntry[] = existingLineup.lineup
        .filter((player) => player.status === "MISSING" && knownPlayerIds.has(String(player.playerId)))
        .map((player) => ({
          playerId: String(player.playerId),
          reason: "UNKNOWN" as MissingReason,
        }));

      // A player may have become INJURED/SUSPENDED since this lineup was
      // last saved. Never trust the saved STARTER/SUBSTITUTE status over
      // their current one — bump them to missing and free their spot,
      // rather than silently letting an unavailable player stay selected.
      const demotedIds = new Set<string>();

      nextSlots.forEach((id, index) => {
        if (id == null) return;
        const player = squadById.get(id);
        if (player && !isPlayerAvailable(player)) {
          demotedIds.add(id);
          nextSlots[index] = null;
        }
      });

      nextBench = nextBench.filter((id) => {
        const player = squadById.get(id);
        if (player && !isPlayerAvailable(player)) {
          demotedIds.add(id);
          return false;
        }
        return true;
      });

      if (demotedIds.size > 0) {
        const autoDemoted: MissingEntry[] = Array.from(demotedIds).map((playerId) => {
          const player = squadById.get(playerId)!;
          return { playerId, reason: missingReasonForStatus(player.status) };
        });
        nextMissing = [...nextMissing, ...autoDemoted];
      }

      const resolvedCaptainId =
        existingLineup.captainId != null && knownPlayerIds.has(String(existingLineup.captainId))
          ? String(existingLineup.captainId)
          : null;

      setSlots(nextSlots);
      setBench(unique(nextBench));
      setMissing(nextMissing);
      setCaptainId(
        resolvedCaptainId != null && !demotedIds.has(resolvedCaptainId) ? resolvedCaptainId : null,
      );
    } else {
      // ===== NEW LINEUP: auto-assign all players =====
      // INJURED/SUSPENDED (anything non-ACTIVE) never enters availablePlayers,
      // so they can never be auto-picked as a starter or bench player.
      const autoMissing: MissingEntry[] = [];
      const availablePlayers: Player[] = [];

      squad.forEach((player) => {
        if (isPlayerAvailable(player)) {
          availablePlayers.push(player);
        } else {
          autoMissing.push({ playerId: player.id, reason: missingReasonForStatus(player.status) });
        }
      });

      const { captain, vice } = findCaptainCandidates(squad);
      const priorityIds = new Set<string>();
      if (captain && isPlayerAvailable(captain)) priorityIds.add(captain.id);
      if (vice && isPlayerAvailable(vice)) priorityIds.add(vice.id);

      const sortedAvailable = [
        ...availablePlayers.filter((player) => priorityIds.has(player.id)),
        ...availablePlayers.filter((player) => !priorityIds.has(player.id)),
      ];

      const starterIds = sortedAvailable.slice(0, initialLayout.length).map((player) => player.id);
      const benchIds = sortedAvailable.slice(initialLayout.length).map((player) => player.id);

      const allAssignedIds = new Set([...starterIds, ...benchIds]);
      const missingIdsSet = new Set(autoMissing.map((m) => m.playerId));
      const unassignedAvailable = availablePlayers
        .filter((p) => !allAssignedIds.has(p.id) && !missingIdsSet.has(p.id))
        .map((p) => p.id);

      const finalBenchIds = unique([...benchIds, ...unassignedAvailable]);
      const filledSlots = Array.from({ length: initialLayout.length }, (_, index) => starterIds[index] ?? null);

      const captainInStarters = captain != null && starterIds.includes(captain.id);
      const viceInStarters = vice != null && starterIds.includes(vice.id);
      const autoCaptain = captainInStarters ? captain!.id : viceInStarters ? vice!.id : null;

      setSlots(filledSlots);
      setBench(finalBenchIds);
      setMissing(autoMissing);
      setCaptainId(autoCaptain);
    }

    setFormation(initialFormation);
    seedKeyRef.current = seedKey;
    setIsSeeded(true);
  }, [existingLineup, hasLoadError, isLoading, matchId, squad, teamId]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4200);
    return () => {
      if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  // Clear selection when locked
  useEffect(() => {
    if (!isLocked) return;
    setSelectedId(null);
    setPendingAction(null);
  }, [isLocked]);

  // Clear selection if player no longer exists
  useEffect(() => {
    if (selectedId != null && !playerById.has(selectedId)) {
      setSelectedId(null);
      setPendingAction(null);
    }
  }, [playerById, selectedId]);

  // Auto-assign captain if current captain removed from starters
  useEffect(() => {
    if (captainId != null && slots.includes(captainId)) return;
    const vice = squad.find((player) => player.captainStatus === "VICE_CAPTAIN");
    const viceInStarters = vice != null && slots.includes(vice.id);
    setCaptainId(viceInStarters ? vice!.id : null);
  }, [captainId, slots, squad]);

  // Leave the opponent overlay if their lineup disappears
  useEffect(() => {
    if (!opponentLineUp) setViewingOpponent(false);
  }, [opponentLineUp]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setPendingAction(null);
  }, []);

  const openOpponentView = useCallback(() => {
    if (!opponentLineUp) return;
    setSelectedId(null);
    setPendingAction(null);
    setViewingOpponent(true);
  }, [opponentLineUp]);

  const closeOpponentView = useCallback(() => {
    setViewingOpponent(false);
  }, []);

  const toggleSelection = useCallback(
    (playerId: string) => {
      if (isLocked) return;
      setSelectedId((current) => (current === playerId ? null : playerId));
      setPendingAction(null);
    },
    [isLocked],
  );

  const movePlayer = useCallback(
    (playerId: string, target: DragTargetType) => {
      if (isLocked) return;

      // An INJURED/SUSPENDED (non-ACTIVE) player can never end up as a
      // starter or substitute, even via a manual swap/sub action — force
      // any such attempt to land them in "missing" with their real reason
      // instead of silently placing them on the pitch or bench.
      let resolvedTarget = target;
      if (resolvedTarget.type !== "missing") {
        const player = playerById.get(playerId);
        if (player && !isPlayerAvailable(player)) {
          resolvedTarget = { type: "missing", reason: missingReasonForStatus(player.status) };
        }
      }

      setSlots((currentSlots) => {
        const sourceSlotIndex = currentSlots.indexOf(playerId);
        const nextSlots = currentSlots.map((id) => (id === playerId ? null : id));
        let displacedPlayerId: string | null = null;

        if (resolvedTarget.type === "slot") {
          const currentOccupant = currentSlots[resolvedTarget.slotIndex] ?? null;

          if (currentOccupant != null && currentOccupant !== playerId) {
            if (sourceSlotIndex >= 0) {
              nextSlots[sourceSlotIndex] = currentOccupant;
            } else {
              displacedPlayerId = currentOccupant;
            }
          }

          nextSlots[resolvedTarget.slotIndex] = playerId;
        }

        setBench((currentBench) => {
          const nextBench = currentBench.filter((id) => id !== playerId && id !== displacedPlayerId);
          if (resolvedTarget.type === "bench") nextBench.push(playerId);
          if (displacedPlayerId != null) nextBench.push(displacedPlayerId);
          return unique(nextBench);
        });

        setMissing((currentMissing) => {
          let nextMissing = currentMissing.filter(
            (entry) => entry.playerId !== playerId && entry.playerId !== displacedPlayerId,
          );

          if (resolvedTarget.type === "missing") {
            nextMissing = [...nextMissing, { playerId, reason: resolvedTarget.reason ?? "UNKNOWN" }];
          }

          return nextMissing;
        });

        return nextSlots;
      });

      if (resolvedTarget.type !== "slot") {
        setCaptainId((currentCaptain) => (currentCaptain === playerId ? null : currentCaptain));
      }
    },
    [isLocked, playerById],
  );

  const placeStarter = useCallback(
    (slotIndex: number) => {
      if (selectedId == null || isLocked) return;
      movePlayer(selectedId, { type: "slot", slotIndex });
      clearSelection();
    },
    [clearSelection, isLocked, movePlayer, selectedId],
  );

  const sendToBench = useCallback(() => {
    if (selectedId == null || isLocked) return;
    movePlayer(selectedId, { type: "bench" });
    clearSelection();
  }, [clearSelection, isLocked, movePlayer, selectedId]);

  const markMissing = useCallback(
    (reason: MissingReason) => {
      if (selectedId == null || isLocked) return;
      movePlayer(selectedId, { type: "missing", reason });
      clearSelection();
    },
    [clearSelection, isLocked, movePlayer, selectedId],
  );

  const handlePlayerCardClick = useCallback(
    (playerId: string, status: "starter" | "bench" | "missing" | "pool") => {
      if (isLocked) return;

      if (selectedId != null && selectedId !== playerId) {
        const selectedIsCurrentStarter = slots.includes(selectedId);

        if (selectedIsCurrentStarter && (status === "bench" || status === "pool" || status === "missing")) {
          const slotIndex = slots.indexOf(selectedId);
          movePlayer(playerId, { type: "slot", slotIndex });
          clearSelection();
          return;
        }

        if (!selectedIsCurrentStarter && status === "starter") {
          const slotIndex = slots.indexOf(playerId);
          movePlayer(selectedId, { type: "slot", slotIndex });
          clearSelection();
          return;
        }
      }

      toggleSelection(playerId);
    },
    [clearSelection, isLocked, movePlayer, selectedId, slots, toggleSelection],
  );

  // Changing formation must re-seat the CURRENT starters into the new
  // formation's slots, not just swap `formation` and let `layout` recompute
  // around whatever `slots` happened to contain. Without this, switching
  // formation can leave `slots` at the old formation's length/shape, which
  // silently desyncs `openSlots` (layout.length - starterCount) from reality
  // and keeps isValid false — the button then looks stuck disabled until an
  // unrelated action (a sub, a captain change) happens to touch `slots` and
  // incidentally fixes it up. Any starter the new formation can't place
  // (fewer slots than before) drops to the bench rather than vanishing.
  const changeFormation = useCallback(
    (nextFormation: Formation) => {
      if (isLocked) return;

      const nextLayout = computeHorizontalLayout(nextFormation);
      const currentStarters = slots
        .flatMap((playerId, slotIndex) => {
          if (playerId == null) return [];
          const player = playerById.get(playerId);
          if (!player) return [];
          return [{ playerId, position: player.position, slotLabel: layout[slotIndex]?.label }];
        });

      const pool = currentStarters.slice();
      const nextSlots: Array<string | null> = nextLayout.map(() => null);

      // Pass 1: same slot label as before (e.g. still "LCM" -> "LCM").
      nextLayout.forEach((slot, slotIndex) => {
        const matchIndex = pool.findIndex((entry) => entry.slotLabel === slot.label);
        if (matchIndex >= 0) {
          nextSlots[slotIndex] = pool[matchIndex].playerId;
          pool.splice(matchIndex, 1);
        }
      });

      // Pass 2: canonical position match for anyone not placed by slot label.
      nextLayout.forEach((slot, slotIndex) => {
        if (nextSlots[slotIndex] != null) return;
        const slotPosition = mapSlotLabelToPosition(slot.label);
        const matchIndex = pool.findIndex((entry) => entry.position === slotPosition);
        if (matchIndex >= 0) {
          nextSlots[slotIndex] = pool[matchIndex].playerId;
          pool.splice(matchIndex, 1);
        }
      });

      // Pass 3: fill any remaining empty slots with whoever's left.
      nextSlots.forEach((slot, slotIndex) => {
        if (slot != null || pool.length === 0) return;
        nextSlots[slotIndex] = pool.shift()!.playerId;
      });

      // Anyone who still didn't fit (new formation has fewer slots) goes to
      // the bench instead of being silently dropped from the squad.
      const overflowIds = pool.map((entry) => entry.playerId);

      setSlots(nextSlots);
      if (overflowIds.length > 0) {
        setBench((currentBench) => unique([...currentBench, ...overflowIds]));
      }
      if (captainId != null && !nextSlots.includes(captainId)) {
        setCaptainId(null);
      }

      setFormation(nextFormation);
      setFormationPulse((current) => current + 1);
    },
    [captainId, isLocked, layout, playerById, slots],
  );

  const saveLineup = useCallback(
    async (payload: MatchLineUpRequest) => {
      if (existingLineup) {
        return updateLineup.mutateAsync({ matchId: payload.matchId, teamId: payload.teamId, request: payload });
      }
      return submitLineup.mutateAsync(payload);
    },
    [existingLineup, submitLineup, updateLineup],
  );

  // Payload: every squad player is a STARTER, SUBSTITUTE (bench) or MISSING.
  const payload = useMemo<MatchLineUpRequest>(
    () => ({
      matchId,
      teamId,
      captainId: captainId != null ? Number(captainId) : 0,
      formation,
      players: squad.map((player): LineupPlayerRequest => {
        const slotIndex = slots.indexOf(player.id);
        const missingEntry = missing.find((entry) => entry.playerId === player.id);

        if (slotIndex >= 0) {
          const slotLabel = layout[slotIndex]?.label ?? "CM";
          return {
            playerId: Number(player.id),
            position: mapSlotLabelToPosition(slotLabel),
            slotLabel,
            status: "STARTER" as LineupStatus,
            missingReason: null,
          };
        }

        if (missingEntry) {
          return {
            playerId: Number(player.id),
            position: player.position,
            status: "MISSING" as LineupStatus,
            missingReason: missingEntry.reason,
          };
        }

        return {
          playerId: Number(player.id),
          position: player.position,
          status: "SUBSTITUTE" as LineupStatus,
          missingReason: null,
        };
      }),
    }),
    [captainId, formation, layout, matchId, missing, slots, squad, teamId],
  );

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSaving || isLocked) return;

    try {
      await saveLineup(payload);
      setToast({
        type: "success",
        message: isEditing ? `Lineup updated successfully for ${teamName}.` : `Lineup submitted successfully for ${teamName}.`,
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save the lineup. Please try again.",
      });
    }
  }, [isEditing, isLocked, isSaving, isValid, payload, saveLineup, teamName]);

  const teamIsNotInMatch = !isLoading && !hasLoadError && teamSide === "unknown";

  const selectedStatusPill = useMemo(() => {
    if (!selectedPlayer) return null;
    if (selectedIsStarter) {
      return captainId === selectedId
        ? { tone: "captain" as const, label: "Captain" }
        : { tone: "starter" as const, label: "Starting XI" };
    }
    if (selectedIsBench) return { tone: "sub" as const, label: "Substitute" };
    if (selectedIsMissing && selectedMissingEntry) {
      return { tone: "out" as const, label: REASON_LABEL[selectedMissingEntry.reason] };
    }
    return { tone: "pool" as const, label: "Pool" };
  }, [captainId, selectedId, selectedIsBench, selectedIsMissing, selectedIsStarter, selectedMissingEntry, selectedPlayer]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`lb-root lb-${teamSide}`}>
      <style>{`
        .lb-root {
          --bg: #090d10;
          --panel: rgba(15, 20, 24, .94);
          --panel-soft: rgba(255, 255, 255, .055);
          --panel-strong: rgba(255, 255, 255, .095);
          --line: rgba(255, 255, 255, .12);
          --text: #f4f7f5;
          --muted: rgba(244, 247, 245, .59);

          --accent: #b8c2cc;
          --accent-rgb: 184, 194, 204;
          --accent-light: #edf3f8;
          --accent-mid: #d4dee7;
          --accent-ink: #0a1118;
          --accent-soft: rgba(var(--accent-rgb), .16);
          --accent-strong: rgba(var(--accent-rgb), .30);
          --pitch-a: #23514a;
          --pitch-b: #2b6258;

          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(296px, 356px) minmax(0, 1fr);
          background: var(--bg);
          color: var(--text);
        }

        .lb-root.lb-home {
          --accent: #4ade80;
          --accent-rgb: 74, 222, 128;
          --accent-light: #bbf7d0;
          --accent-mid: #86efac;
          --accent-ink: #052e16;
          --pitch-a: #166534;
          --pitch-b: #15803d;
        }

        .lb-root.lb-away {
          --accent: #60a5fa;
          --accent-rgb: 96, 165, 250;
          --accent-light: #bfdbfe;
          --accent-mid: #93c5fd;
          --accent-ink: #172554;
          --pitch-a: #1e3a5f;
          --pitch-b: #1e4a7a;
        }

        .lb-root *, .lb-root *::before, .lb-root *::after { box-sizing: border-box; }
        .lb-root button, .lb-root select { font: inherit; }
        .lb-root button { -webkit-tap-highlight-color: transparent; }

        /* ===== SIDEBAR ===== */
        .lb-sidebar {
          z-index: 10;
          display: flex;
          min-width: 0;
          height: 100vh;
          flex-direction: column;
          overflow: hidden;
          border-right: 2px solid var(--line);
          background:
            radial-gradient(circle at 5% 0%, rgba(var(--accent-rgb), .12), transparent 28%),
            linear-gradient(180deg, #151d21 0%, #0a0e11 100%);
        }

        .lb-sidebar-head {
          padding: 14px 14px 10px;
          border-bottom: 2px solid var(--line);
        }

        .lb-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .lb-team-identity {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
        }

        .lb-team-heading { min-width: 0; }

        .lb-team-crest {
          position: relative;
          display: grid;
          width: 38px;
          height: 38px;
          flex: none;
          place-items: center;
          overflow: hidden;
          border: 2px solid rgba(var(--accent-rgb), .5);
          border-radius: 12px;
          color: var(--accent-ink);
          background:
            linear-gradient(145deg, rgba(255,255,255,.5), transparent 42%),
            linear-gradient(145deg, var(--accent-light), var(--accent));
          box-shadow:
            0 8px 20px rgba(0,0,0,.2),
            inset 0 1px 0 rgba(255,255,255,.5),
            0 0 0 3px rgba(var(--accent-rgb),.08);
        }
        .lb-team-crest::after {
          position: absolute;
          inset: 3px;
          content: "";
          border: 2px solid rgba(7,14,17,.12);
          border-radius: 9px;
          pointer-events: none;
        }
        .lb-team-crest.compact {
          width: 24px;
          height: 24px;
          border-radius: 7px;
        }
        .lb-team-crest.compact::after { inset: 2px; border-radius: 5px; }
        .lb-crest-monogram {
          color: var(--accent-ink);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: -.04em;
        }
        .lb-team-crest.compact .lb-crest-monogram { font-size: 7px; }
        .lb-crest-image {
          position: absolute;
          z-index: 1;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: var(--accent-light);
        }

        .lb-kicker {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 3px;
          color: var(--muted);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .lb-kicker::before {
          width: 5px;
          height: 5px;
          content: "";
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .lb-title {
          max-width: 150px;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          background: linear-gradient(135deg, #fff 12%, var(--accent-light) 110%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-size: clamp(17px, 1.6vw, 20px);
          font-weight: 700;
          letter-spacing: -.03em;
          line-height: 1.1;
        }

        .lb-team-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 3px;
          color: var(--muted);
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: .07em;
          text-transform: uppercase;
        }
        .lb-team-meta-side { color: var(--accent); }
        .lb-team-meta-dot { color: rgba(255,255,255,.3); }

        .lb-header-actions {
          display: flex;
          flex: none;
          align-items: center;
          gap: 6px;
        }

        .lb-readiness {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          border: 2px solid var(--line);
          border-radius: 999px;
          padding: 0 8px;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .lb-readiness.ready { border-color: rgba(74,222,128,.4); color: #86efac; background: rgba(74,222,128,.1); }
        .lb-readiness.warn { border-color: rgba(var(--accent-rgb),.35); color: var(--accent-light); background: var(--accent-soft); }
        .lb-readiness.locked { border-color: rgba(255,112,104,.4); color: #fca5a5; background: rgba(255,112,104,.08); }

        .lb-close-button {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border: 2px solid var(--line);
          border-radius: 50%;
          color: var(--muted);
          background: rgba(255,255,255,.04);
          cursor: pointer;
          font-size: 15px;
          line-height: 1;
          transition: .15s ease;
        }
        .lb-close-button:hover { border-color: rgba(255,112,104,.4); color: #fca5a5; background: rgba(255,112,104,.08); }

        /* ===== FORMATION DROPDOWN ===== */
        .lb-formation-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 11px;
        }
        .lb-formation-row label {
          flex: none;
          color: var(--muted);
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .lb-formation-dropdown {
          position: relative;
          flex: 1;
          min-width: 0;
        }

        .lb-formation-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 30px;
          border: 2px solid var(--line);
          border-radius: 8px;
          padding: 0 9px;
          color: var(--text);
          background: rgba(255,255,255,.05);
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition: border-color .15s ease, background .15s ease;
        }
        .lb-formation-trigger:hover:not(:disabled) { border-color: var(--accent-strong); background: rgba(255,255,255,.08); }
        .lb-formation-trigger.open { border-color: var(--accent); background: rgba(var(--accent-rgb),.08); }
        .lb-formation-trigger:disabled { cursor: not-allowed; opacity: .5; }
        .lb-formation-trigger svg { flex: none; margin-left: 6px; color: var(--muted); }

        .lb-formation-menu {
          position: absolute;
          z-index: 50;
          top: calc(100% + 4px);
          left: 0;
          width: 100%;
          max-height: 208px;
          overflow-y: auto;
          border: 2px solid var(--line);
          border-radius: 8px;
          padding: 4px;
          background: #1a2228;
          box-shadow: 0 12px 32px rgba(0,0,0,.4);
        }
        .lb-formation-menu::-webkit-scrollbar { width: 4px; }
        .lb-formation-menu::-webkit-scrollbar-thumb { border-radius: 999px; background: rgba(255,255,255,.15); }

        .lb-formation-item {
          display: block;
          width: 100%;
          padding: 5px 9px;
          border: 0;
          border-radius: 6px;
          color: var(--text);
          background: transparent;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          text-align: left;
          transition: background .12s ease, color .12s ease;
        }
        .lb-formation-item:hover { background: rgba(255,255,255,.06); }
        .lb-formation-item.active { color: var(--accent-light); background: var(--accent-soft); }

        /* ===== FIXTURE CARD ===== */
        .lb-fixture-card {
          position: relative;
          margin: 10px 10px 0;
          overflow: hidden;
          border: 2px solid rgba(var(--accent-rgb),.25);
          border-radius: 12px;
          padding: 10px 12px;
          background:
            radial-gradient(circle at 8% 0%, rgba(var(--accent-rgb),.15), transparent 38%),
            linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          box-shadow: 0 8px 24px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .lb-fixture-card::after {
          position: absolute;
          right: -30px;
          bottom: -50px;
          width: 120px;
          height: 120px;
          border: 2px solid rgba(var(--accent-rgb),.1);
          border-radius: 50%;
          content: "";
          pointer-events: none;
        }
        .lb-fixture-topline, .lb-fixture-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .lb-fixture-caption {
          overflow: hidden;
          color: var(--muted);
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: .1em;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .lb-fixture-main {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 46px minmax(0, 1fr);
          align-items: center;
          gap: 6px;
          margin: 8px 0 6px;
        }
        .lb-fixture-team {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 6px;
          color: var(--text);
          font-size: 9.5px;
          font-weight: 700;
        }
        .lb-fixture-team > span:not(.lb-team-crest) {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lb-fixture-team.opponent { justify-content: flex-end; color: rgba(244,247,245,.7); text-align: right; }
        .lb-fixture-score {
          display: grid;
          min-height: 34px;
          place-items: center;
          border-right: 2px solid rgba(255,255,255,.08);
          border-left: 2px solid rgba(255,255,255,.08);
          text-align: center;
        }
        .lb-fixture-score small { color: var(--muted); font-size: 6.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        .lb-fixture-score strong { margin-top: 1px; color: var(--accent-light); font-size: 12px; font-weight: 700; letter-spacing: -.04em; }
        .lb-fixture-footer {
          border-top: 2px solid rgba(255,255,255,.08);
          padding-top: 7px;
          color: var(--muted);
          font-size: 8px;
          font-weight: 600;
        }
        .lb-side-badge, .lb-editing-badge {
          display: inline-flex;
          align-items: center;
          min-height: 17px;
          flex: none;
          border-radius: 999px;
          padding: 0 7px;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          border: 2px solid transparent;
        }
        .lb-side-badge { border-color: rgba(var(--accent-rgb),.4); color: var(--accent-light); background: rgba(var(--accent-rgb),.12); }
        .lb-editing-badge { border-color: rgba(182,149,255,.3); color: #dccaff; background: rgba(182,149,255,.08); }

        .lb-lock-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 9px 10px 0;
          border: 2px solid rgba(255,112,104,.3);
          border-radius: 10px;
          padding: 7px 9px;
          color: #fca5a5;
          background: rgba(255,112,104,.06);
          font-size: 10px;
          font-weight: 600;
          line-height: 1.3;
        }

        /* ===== ACTION PANEL ===== */
        .lb-action-panel {
          margin: 9px 10px 0;
          border: 2px solid rgba(var(--accent-rgb),.3);
          border-radius: 13px;
          padding: 10px 11px;
          background: linear-gradient(145deg, rgba(var(--accent-rgb),.12), rgba(255,255,255,.02));
          box-shadow: 0 10px 24px rgba(0,0,0,.14);
          animation: lb-panel-in .2s cubic-bezier(.22,1,.36,1);
        }
        @keyframes lb-panel-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .lb-selected-summary { display: flex; align-items: flex-start; gap: 9px; }
        .lb-selected-number {
          display: grid;
          width: 28px;
          height: 28px;
          flex: none;
          place-items: center;
          border-radius: 8px;
          color: var(--accent-ink);
          background: var(--accent);
          font-size: 11px;
          font-weight: 700;
          border: 2px solid rgba(0,0,0,.1);
          margin-top: 1px;
        }
        .lb-selected-copy { min-width: 0; flex: 1; }
        .lb-selected-name {
          display: block;
          overflow: hidden;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -.01em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lb-selected-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 5px;
        }
        .lb-selected-position {
          color: var(--muted);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .lb-status-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 9px;
          border-radius: 999px;
          border: 2px solid var(--line);
          color: var(--muted);
          background: rgba(255,255,255,.04);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          line-height: 1;
        }
        .lb-status-pill.starter { border-color: rgba(var(--accent-rgb),.4); color: var(--accent-light); background: var(--accent-soft); }
        .lb-status-pill.captain { border-color: rgba(255,215,0,.45); color: #ffd700; background: rgba(255,215,0,.12); }
        .lb-status-pill.sub { border-color: rgba(96,165,250,.4); color: #93c5fd; background: rgba(96,165,250,.1); }
        .lb-status-pill.out { border-color: rgba(255,112,104,.4); color: #fca5a5; background: rgba(255,112,104,.1); }
        .lb-status-pill.pool { border-color: rgba(255,255,255,.16); color: var(--muted); background: rgba(255,255,255,.05); }

        .lb-selection-close {
          display: grid;
          width: 24px;
          height: 24px;
          flex: none;
          place-items: center;
          border: 2px solid var(--line);
          border-radius: 50%;
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          font-size: 13px;
        }
        .lb-selection-close:hover { color: var(--text); border-color: rgba(255,255,255,.25); }

        .lb-action-hint {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 9px;
          font-weight: 600;
          line-height: 1.35;
        }

        .lb-swap-list { display: flex; flex-direction: column; gap: 4px; max-height: 132px; overflow-y: auto; margin-top: 6px; }
        .lb-swap-row {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr) auto;
          align-items: center;
          gap: 6px;
          border-width: 2px;
          border-style: solid;
          border-color: var(--line);
          border-radius: 999px;
          padding: 9px 11px;
          color: var(--text);
          background: rgba(255,255,255,.03);
          cursor: pointer;
          text-align: left;
          font-size: 8px;
          font-weight: 600;
          transition: .14s ease;
        }
        .lb-swap-row:hover { border-color: rgba(var(--accent-rgb),.4); background: var(--accent-soft); }
        .lb-swap-row.match { border-color: rgba(var(--accent-rgb),.45); background: rgba(var(--accent-rgb),.1); }
        .lb-swap-number {
          display: grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border-radius: 6px;
          color: var(--accent-ink);
          background: var(--accent);
          font-size: 7.5px;
          font-weight: 700;
          border: 2px solid rgba(0,0,0,.1);
        }
        .lb-swap-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lb-swap-pos { color: var(--muted); font-size: 7px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }

        .lb-action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 9px; }
        .lb-action-button {
          border-width: 2px;
          border-style: solid;
          border-color: var(--line);
          border-radius: 999px;
          padding: 9px 8px;
          color: var(--text);
          background: rgba(255,255,255,.04);
          cursor: pointer;
          font-size: 6px;
          font-weight: 600;
          letter-spacing: .02em;
          transition: .14s ease;
        }
        .lb-action-button:hover { border-color: rgba(var(--accent-rgb),.4); background: var(--accent-soft); }
        .lb-action-button.current { border-color: rgba(var(--accent-rgb),.45); color: var(--accent-light); background: rgba(var(--accent-rgb),.18); }
        .lb-action-button.captain {
          grid-column: 1 / -1;
          border-color: rgba(255,215,0,.4);
          background: rgba(255,215,0,.08);
        }
        .lb-action-button.captain:hover { border-color: rgba(255,215,0,.6); background: rgba(255,215,0,.15); }
        .lb-action-button.captain.current { border-color: rgba(255,215,0,.6); color: #ffd700; background: rgba(255,215,0,.18); }

        .lb-reason-panel {
          margin-top: 9px;
          padding-top: 9px;
          border-top: 2px solid rgba(255,255,255,.08);
        }
        .lb-reason-title {
          display: block;
          color: var(--text);
          font-size: 10.5px;
          font-weight: 700;
        }
        .lb-reason-subtitle {
          display: block;
          margin-top: 2px;
          color: var(--muted);
          font-size: 9px;
          font-weight: 600;
          line-height: 1.3;
        }
        .lb-reason-option {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 2px solid var(--line);
          border-radius: 10px;
          padding: 9px 10px;
          color: var(--text);
          background: rgba(255,255,255,.03);
          cursor: pointer;
          text-align: left;
          font-size: 10px;
          font-weight: 600;
          transition: border-color .14s ease, background .14s ease, transform .14s ease;
        }
        .lb-reason-option:hover {
          border-color: rgba(255,112,104,.4);
          background: rgba(255,112,104,.08);
          transform: translateY(-1px);
        }
        .lb-reason-dot {
          width: 8px;
          height: 8px;
          flex: none;
          border-radius: 50%;
          background: #94a3b8;
          box-shadow: 0 0 0 3px rgba(148,163,184,.15);
        }
        .lb-reason-dot.injured   { background: #f87171; box-shadow: 0 0 0 3px rgba(248,113,113,.15); }
        .lb-reason-dot.suspended { background: #fb923c; box-shadow: 0 0 0 3px rgba(251,146,60,.15); }
        .lb-reason-dot.illness   { background: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,.15); }
        .lb-reason-dot.personal  { background: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,.15); }
        .lb-reason-dot.unknown   { background: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.15); }

        /* ===== PLAYER LIST ===== */
        .lb-player-list {
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          padding: 7px 10px 10px;
        }
        .lb-player-list::-webkit-scrollbar { width: 6px; }
        .lb-player-list::-webkit-scrollbar-thumb { border: 2px solid #0e1417; border-radius: 999px; background: rgba(255,255,255,.14); }

        .lb-player-stack { display: flex; flex-direction: column; gap: 4px; }
        .lb-empty-list { margin: 14px 4px; color: var(--muted); font-size: 10.5px; font-weight: 600; line-height: 1.5; text-align: center; }

        .lb-player-card {
          display: grid;
          width: 100%;
          grid-template-columns: 30px minmax(0, 1fr) 13px;
          align-items: center;
          gap: 7px;
          border: 2px solid var(--line);
          border-radius: 9px;
          padding: 7px 9px;
          color: var(--text);
          background: var(--panel-soft);
          cursor: pointer;
          text-align: left;
          font-size: 10.5px;
          font-weight: 600;
          transition: transform .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease;
        }
        .lb-player-card:hover { border-color: rgba(var(--accent-rgb),.4); background: var(--panel-strong); transform: translateY(-1px); }
        .lb-player-card.selected { border-color: var(--accent); background: rgba(var(--accent-rgb),.1); box-shadow: 0 0 0 2px rgba(var(--accent-rgb),.08); }
        .lb-player-card:disabled { cursor: not-allowed; opacity: .5; transform: none; }
        .lb-player-card:disabled:hover { border-color: var(--line); background: var(--panel-soft); }

        .lb-player-number {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border-radius: 8px;
          color: #071014;
          background: #b9c3cb;
          font-size: 9.5px;
          font-weight: 700;
          border: 2px solid rgba(0,0,0,.06);
        }
        .lb-player-card.starter .lb-player-number { background: #4ade80; border-color: rgba(0,0,0,.1); }
        .lb-player-card.bench .lb-player-number { background: #60a5fa; border-color: rgba(0,0,0,.1); }
        .lb-player-card.missing .lb-player-number { background: #f87171; border-color: rgba(0,0,0,.1); }
        .lb-player-card.pool .lb-player-number { color: rgba(255,255,255,.7); background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.05); }

        .lb-player-copy { min-width: 0; }
        .lb-player-fullname { display: block; overflow: hidden; font-size: 11px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
        .lb-player-role { display: flex; align-items: center; gap: 4px; margin-top: 1px; color: var(--muted); font-size: 8.5px; font-weight: 600; }
        .lb-player-role i { width: 2px; height: 2px; border-radius: 50%; background: currentColor; opacity: .5; }
        .lb-card-select { color: var(--muted); font-size: 15px; line-height: 1; }
        .lb-player-card.selected .lb-card-select { color: var(--accent); }

        /* ===== SAVE BUTTON ===== */
        .lb-sidebar-footer {
          padding: 9px 11px;
          border-top: 2px solid var(--line);
          background: rgba(0,0,0,.12);
        }
        .lb-save-button {
          position: relative;
          width: 100%;
          min-height: 36px;
          overflow: hidden;
          border: 2px solid rgba(var(--accent-rgb),.5);
          border-radius: 10px;
          color: var(--accent-ink);
          background: linear-gradient(110deg, var(--accent-light), var(--accent) 48%, var(--accent-mid));
          box-shadow: 0 8px 20px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.5);
          cursor: pointer;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .015em;
          transition: transform .14s ease, filter .14s ease, opacity .14s ease;
        }
        .lb-save-button::before {
          position: absolute;
          top: -70%;
          left: -30%;
          width: 35%;
          height: 240%;
          content: "";
          background: rgba(255,255,255,.35);
          opacity: 0;
          transform: rotate(22deg);
          transition: left .4s ease, opacity .18s ease;
        }
        .lb-save-button:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
        .lb-save-button:hover:not(:disabled)::before { left: 115%; opacity: 1; }
        .lb-save-button:active:not(:disabled) { transform: translateY(0) scale(.98); }
        .lb-save-button:disabled { border-color: var(--line); color: var(--muted); background: rgba(255,255,255,.06); box-shadow: none; cursor: not-allowed; }

        .lb-save-hint {
          margin: 7px 2px 0;
          color: rgba(255,255,255,.55);
          font-size: 9px;
          font-weight: 600;
          line-height: 1.4;
          text-align: center;
        }
        .lb-save-hint span { display: block; }

        /* ===== PITCH ===== */
        .lb-pitch {
          position: relative;
          min-width: 0;
          height: 100vh;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,.1), transparent 32%),
            linear-gradient(90deg, rgba(0,0,0,.3), transparent 18%, transparent 82%, rgba(0,0,0,.3)),
            repeating-linear-gradient(90deg, var(--pitch-a) 0 92px, var(--pitch-b) 92px 184px);
        }
        .lb-pitch::before {
          position: absolute;
          z-index: 1;
          inset: 0;
          content: "";
          pointer-events: none;
          background:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px),
            radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,.25));
          background-size: 48px 48px, 48px 48px, 100% 100%;
        }
        .lb-pitch-lines {
          position: absolute;
          z-index: 2;
          inset: 30px;
          width: calc(100% - 60px);
          height: calc(100% - 60px);
          filter: drop-shadow(0 6px 14px rgba(0,0,0,.2));
        }
        .lb-formation-flash {
          position: absolute;
          z-index: 3;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb),.25), transparent 62%);
          animation: lb-formation-flash .7s ease-out;
        }
        @keyframes lb-formation-flash { from { opacity: .8; transform: scale(.86); } to { opacity: 0; transform: scale(1.16); } }

        .lb-pitch-orb {
          position: absolute;
          z-index: 0;
          width: 38vw;
          height: 38vw;
          max-width: 500px;
          max-height: 500px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(18px);
          opacity: .12;
          background: var(--accent);
          animation: lb-orb-drift 10s ease-in-out infinite alternate;
        }
        .lb-pitch-orb-one { top: -18vw; right: -14vw; }
        .lb-pitch-orb-two { bottom: -24vw; left: -14vw; opacity: .08; animation-delay: -4.5s; }
        @keyframes lb-orb-drift { from { transform: translate3d(-2%, -1%, 0) scale(.96); } to { transform: translate3d(4%, 5%, 0) scale(1.06); } }

        .lb-pitch-hud-opp {
          position: absolute;
          z-index: 25;
          bottom: 12px;
          right: 14px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.15);
          border-radius: 10px;
          color: #fff;
          background: rgba(7,13,16,.6);
          box-shadow: 0 10px 24px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(12px);
        }
        button.lb-pitch-hud-opp {
          cursor: pointer;
          text-align: left;
          transition: border-color .14s ease, background .14s ease, transform .14s ease;
        }
        button.lb-pitch-hud-opp:hover { border-color: rgba(255,255,255,.32); transform: translateY(-1px); }
        button.lb-pitch-hud-opp.active {
          border-color: var(--accent);
          background: rgba(var(--accent-rgb),.14);
          box-shadow: 0 10px 24px rgba(0,0,0,.2), 0 0 0 3px var(--accent-soft);
        }

        .lb-pitch-hud {
          position: absolute;
          z-index: 25;
          top: 12px;
          right: 14px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.15);
          border-radius: 10px;
          color: #fff;
          background: rgba(7,13,16,.6);
          box-shadow: 0 10px 24px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(12px);
        }
        .lb-pitch-hud-team {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 6px;
          padding: 5px 8px 5px 6px;
          font-size: 9px;
          font-weight: 700;
        }
        .lb-pitch-hud-team > span:last-child { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lb-pitch-hud-system {
          display: grid;
          min-width: 42px;
          place-items: center;
          border-left: 2px solid rgba(255,255,255,.1);
          padding: 3px 8px;
          text-align: center;
        }
        .lb-pitch-hud-system small { color: var(--muted); font-size: 6.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        .lb-pitch-hud-system strong { color: var(--accent); font-size: 10px; font-weight: 700; }

        .lb-pitch-message {
          position: absolute;
          z-index: 30;
          top: 12px;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: calc(100% - 32px);
          border: 2px solid rgba(var(--accent-rgb),.4);
          border-radius: 999px;
          padding: 6px 10px 6px 12px;
          color: #fff;
          background: rgba(6,11,14,.8);
          box-shadow: 0 10px 24px rgba(0,0,0,.25);
          backdrop-filter: blur(10px);
          font-size: 10px;
          font-weight: 600;
          transform: translateX(-50%);
          white-space: nowrap;
        }
        .lb-pitch-message span { overflow: hidden; text-overflow: ellipsis; }
        .lb-pitch-message button { border: 0; color: var(--accent); background: transparent; cursor: pointer; font-size: 10px; font-weight: 700; }
        .lb-pitch-message--opponent { border-color: rgba(255,255,255,.35); }
        .lb-pitch-message--opponent button { color: #fff; text-decoration: underline; }

        .lb-pitch-slot {
          position: absolute;
          z-index: 5;
          display: flex;
          width: 96px;
          flex-direction: column;
          align-items: center;
          border: 0;
          padding: 0;
          color: inherit;
          background: transparent;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: left .5s cubic-bezier(.34,1.5,.64,1) var(--stagger), top .5s cubic-bezier(.34,1.5,.64,1) var(--stagger), transform .14s ease;
        }
        .lb-pitch-slot:hover:not(:disabled) { transform: translate(-50%, -50%) scale(1.04); }
        .lb-pitch-slot:disabled { cursor: default; }
        .lb-pitch-slot.selected { z-index: 20; }
        .lb-pitch-slot--opponent { cursor: default; }
        .lb-pitch-slot--opponent:hover { transform: translate(-50%, -50%); }

        .lb-slot-label {
          margin-bottom: 3px;
          border: 2px solid rgba(255,255,255,.14);
          border-radius: 999px;
          padding: 2px 5px;
          color: rgba(255,255,255,.75);
          background: rgba(0,0,0,.25);
          backdrop-filter: blur(6px);
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: .07em;
          line-height: 1;
          transition: .14s ease;
        }
        .lb-slot-token {
          position: relative;
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 2px solid rgba(4,8,10,.85);
          border-radius: 50%;
          color: #091014;
          background: radial-gradient(circle at 34% 26%, #fff 0%, #eff4f1 35%, #d3dfd9 100%);
          box-shadow: 0 10px 24px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.8);
          font-size: 13px;
          font-weight: 700;
          transition: .14s ease;
        }
        .lb-pitch-slot:hover:not(:disabled) .lb-slot-token { box-shadow: 0 12px 28px rgba(0,0,0,.4), 0 0 0 4px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.8); }
        .lb-pitch-slot.selected .lb-slot-token {
          border-color: var(--accent);
          color: var(--accent-ink);
          background: radial-gradient(circle at 34% 26%, #fff 0%, var(--accent-mid) 42%, var(--accent) 100%);
          box-shadow: 0 14px 30px rgba(0,0,0,.42), 0 0 0 4px rgba(5,10,12,.8), 0 0 0 8px rgba(var(--accent-rgb),.5), 0 0 24px rgba(var(--accent-rgb),.7), inset 0 1px 0 rgba(255,255,255,.85);
        }
        .lb-slot-token--opponent {
          border-color: rgba(255,255,255,.4);
          color: #f4f7f5;
          background: radial-gradient(circle at 34% 26%, #4a5158 0%, #2b3138 45%, #171b1e 100%);
          box-shadow: 0 10px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.15);
        }
        .lb-empty-token {
          display: grid;
          width: 36px;
          height: 36px;
          place-items: center;
          border: 2px dashed rgba(255,255,255,.45);
          border-radius: 50%;
          color: rgba(255,255,255,.65);
          background: rgba(0,0,0,.12);
          font-size: 15px;
          font-weight: 700;
          transition: .14s ease;
        }
        .lb-pitch-slot:hover:not(:disabled) .lb-empty-token { border-color: var(--accent); color: var(--accent); background: rgba(var(--accent-rgb),.1); }
        .lb-pitch-slot.armed .lb-empty-token {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(var(--accent-rgb),.14);
          box-shadow: 0 0 0 6px var(--accent-soft);
          animation: lb-arm-pulse 1.4s ease-in-out infinite;
        }
        .lb-pitch-slot.armed .lb-slot-token { box-shadow: 0 0 0 3px rgba(255,112,104,.4), 0 0 0 7px rgba(255,112,104,.1), 0 12px 28px rgba(0,0,0,.38); }
        @keyframes lb-arm-pulse { 0%,100% { box-shadow: 0 0 0 6px var(--accent-soft); } 50% { box-shadow: 0 0 0 10px rgba(var(--accent-rgb),.03); } }

        .lb-player-name {
          max-width: 94px;
          overflow: hidden;
          margin-top: 4px;
          border-radius: 999px;
          padding: 2px 7px;
          color: #fff;
          background: rgba(0,0,0,.28);
          font-size: 8.5px;
          font-weight: 700;
          text-align: center;
          text-overflow: ellipsis;
          text-shadow: 0 2px 6px rgba(0,0,0,.6);
          white-space: nowrap;
        }
        .lb-pitch-slot.selected .lb-slot-label, .lb-pitch-slot.selected .lb-player-name { border-color: rgba(0,0,0,.6); color: var(--accent-ink); background: var(--accent); text-shadow: none; }

        .lb-captain-mark {
          position: absolute;
          top: -7px;
          right: -7px;
          display: grid;
          width: 20px;
          height: 20px;
          place-items: center;
          border: 2px solid rgba(4,8,10,.85);
          border-radius: 50%;
          color: var(--accent-ink);
          background: #ffd700;
          box-shadow: 0 4px 12px rgba(0,0,0,.28);
          font-size: 8.5px;
          font-weight: 900;
        }

        .lb-loading, .lb-load-error, .lb-invalid-team {
          margin: 18px 12px;
          color: var(--muted);
          font-size: 10.5px;
          font-weight: 600;
          line-height: 1.5;
          text-align: center;
        }
        .lb-load-error, .lb-invalid-team { color: #fca5a5; }

        .lb-toast {
          position: fixed;
          z-index: 100;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          width: min(360px, calc(100vw - 32px));
          border: 2px solid var(--line);
          border-radius: 12px;
          padding: 10px 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,.3);
          backdrop-filter: blur(12px);
          animation: lb-toast-in .22s cubic-bezier(.22,1,.36,1);
          font-size: 10.5px;
          font-weight: 600;
        }
        @keyframes lb-toast-in { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .lb-toast.success { border-color: rgba(74,222,128,.3); color: #bbf7d0; background: rgba(21,56,37,.9); }
        .lb-toast.error { border-color: rgba(255,112,104,.3); color: #fca5a5; background: rgba(67,24,25,.9); }
        .lb-toast-close { margin-left: auto; border: 0; border-radius: 6px; padding: 3px 6px; color: inherit; background: rgba(255,255,255,.08); cursor: pointer; font-size: 11px; font-weight: 700; }
        .lb-toast-close:hover { background: rgba(255,255,255,.14); }

        .lb-root button:focus-visible, .lb-root select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        @media (max-width: 900px) {
          .lb-root { display: block; overflow-x: hidden; }
          .lb-sidebar { height: auto; min-height: 0; max-height: none; border-right: 0; border-bottom: 2px solid var(--line); }
          .lb-player-list { max-height: 280px; }
          .lb-pitch { height: 68vh; min-height: 460px; }
        }

        @media (max-width: 600px) {
          .lb-pitch-hud { top: 10px; right: 10px; }
          .lb-pitch-hud-team { padding: 4px; font-size: 8px; }
          .lb-pitch-hud-team > span:last-child { display: none; }
          .lb-pitch-message { top: 52px; font-size: 9px; }
        }

        @media (max-width: 420px) {
          .lb-sidebar-head { padding: 12px 9px 9px; }
          .lb-team-identity { gap: 7px; }
          .lb-team-crest:not(.compact) { width: 34px; height: 34px; border-radius: 9px; }
          .lb-title { max-width: 96px; font-size: 16px; }
          .lb-team-meta { font-size: 7px; }
          .lb-readiness { padding: 0 6px; font-size: 7.5px; min-height: 20px; }
          .lb-fixture-card { margin-inline: 7px; padding: 7px; }
          .lb-fixture-main { grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr); gap: 4px; margin: 7px 0 5px; }
          .lb-fixture-team { font-size: 8.5px; }
          .lb-fixture-score strong { font-size: 10px; }
          .lb-pitch-lines { inset: 14px; width: calc(100% - 28px); height: calc(100% - 28px); }
          .lb-player-list { padding: 6px 7px 9px; max-height: 220px; }
          .lb-player-card { padding: 6px 7px; font-size: 9.5px; grid-template-columns: 26px minmax(0, 1fr) 11px; gap: 6px; }
          .lb-player-number { width: 26px; height: 26px; font-size: 8.5px; }
          .lb-player-fullname { font-size: 9.5px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lb-root *, .lb-root *::before, .lb-root *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`lb-toast ${toast.type}`} role="status" aria-live="polite">
          <span>{toast.message}</span>
          <button
            type="button"
            className="lb-toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="lb-sidebar" aria-label="Lineup controls">
        <header className="lb-sidebar-head">
          <div className="lb-heading-row">
            <div className="lb-team-identity">
              <TeamCrest name={teamName} logoUrl={teamLogoUrl} />
              <div className="lb-team-heading">
                <p className="lb-kicker">
                  {teamSide === "home" ? "Home team" : teamSide === "away" ? "Away team" : "Lineup builder"}
                </p>
                <h1 className="lb-title" title={teamName}>{teamName}</h1>
                <div className="lb-team-meta">
                  <span className="lb-team-meta-side">{teamSide === "unknown" ? "Team" : teamSide}</span>
                  <span className="lb-team-meta-dot" aria-hidden="true">•</span>
                  <span>Tactical board</span>
                </div>
              </div>
            </div>

            <div className="lb-header-actions">
              <span className={`lb-readiness ${isLocked ? "locked" : isValid ? "ready" : "warn"}`}>
                {isLocked ? "Locked" : isValid ? "Ready" : "Draft"}
              </span>
              <button
                type="button"
                className="lb-close-button"
                onClick={() => router.push(managerDashboardPath)}
                aria-label="Return to dashboard"
                title="Return to dashboard"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          <div className="lb-formation-row">
            <label htmlFor="formation">System</label>
            <FormationSelect
              value={formation}
              disabled={isLocked || isLoading || hasLoadError}
              onChange={changeFormation}
            />
          </div>
        </header>

        {isLoading && <p className="lb-loading">Loading team, match and lineup…</p>}
        {hasLoadError && (
          <p className="lb-load-error">We could not load this lineup. Check your connection and try again.</p>
        )}
        {teamIsNotInMatch && (
          <p className="lb-invalid-team">This team is not registered as the home or away team for this match.</p>
        )}

        {!isLoading && !hasLoadError && !teamIsNotInMatch && (
          <>
            {/* Fixture Card */}
            <section className="lb-fixture-card" aria-label="Match context">
              <div className="lb-fixture-topline">
                <span className="lb-fixture-caption">
                  {isEditing ? "Saved tactical setup" : "Matchday tactical setup"}
                </span>
                <span className="lb-side-badge">{teamSide === "unknown" ? "team" : teamSide}</span>
              </div>

              {match && (
                <div className="lb-fixture-main">
                  <div className="lb-fixture-team current">
                    <TeamCrest name={match.homeTeamName ?? "Home"} logoUrl={match.homeTeamLogoUrl} compact />
                    <span title={match.homeTeamName ?? ""}>{match.homeTeamName}</span>
                  </div>

                  <div className="lb-fixture-score" aria-label={`Match score ${matchScore}`}>
                    <small>{match.status === "SCHEDULED" ? "Kick-off" : match.status ?? "Match"}</small>
                    <strong>{matchScore}</strong>
                  </div>

                  <div className="lb-fixture-team opponent">
                    {opponentName ? (
                      <>
                        <span title={match.awayTeamName ?? ""}>{match.awayTeamName}</span>
                        <TeamCrest name={match.awayTeamName ?? "Away"} logoUrl={match.awayTeamLogoUrl} compact />
                      </>
                    ) : (
                      <span>Opponent</span>
                    )}
                  </div>
                </div>
              )}

              <div className="lb-fixture-footer">
                <span>{isEditing ? "Editing saved lineup" : "Select starting XI and captain"}</span>
                {isEditing && <span className="lb-editing-badge">Saved</span>}
              </div>
            </section>

            {isLocked && (
              <div className="lb-lock-notice" role="status">
                <span aria-hidden="true">🔒</span>
                <span>{lockedReasonLabel(match)}. This lineup is now read-only.</span>
              </div>
            )}

            {/* Action Panel */}
            {selectedPlayer && !isLocked && !viewingOpponent && (
              <section className="lb-action-panel" aria-label={`Actions for ${selectedPlayer.fullName}`}>
                <div className="lb-selected-summary">
                  <span className="lb-selected-number">{selectedPlayer.squadNumber}</span>
                  <div className="lb-selected-copy">
                    <span className="lb-selected-name">{selectedPlayer.fullName}</span>
                    <div className="lb-selected-meta-row">
                      <span className="lb-selected-position">{selectedPlayer.position}</span>
                      {selectedStatusPill && (
                        <StatusPill tone={selectedStatusPill.tone}>{selectedStatusPill.label}</StatusPill>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lb-selection-close"
                    onClick={clearSelection}
                    aria-label="Clear player selection"
                  >
                    ×
                  </button>
                </div>

                {pendingAction === "picking-reason" ? (
                  <div className="lb-reason-panel">
                    <div>
                      <span className="lb-reason-title">Mark unavailable</span>
                      <span className="lb-reason-subtitle">
                        Choose a reason for {firstName(selectedPlayer.fullName)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 mt-3 gap-x-1 gap-y-2">
                      {MISSING_REASONS.map((reason, idx) => (
                        <button
                          key={reason}
                          type="button"
                          className={`lb-reason-option rounded-full! ${idx === 4 ? "col-span-2 text-center items-center flex justify-center" : ""}`}
                          onClick={() => markMissing(reason)}
                        >
                          <span className={`lb-reason-dot ${reason.toLowerCase()}`} aria-hidden="true" />
                          <span className="text-[13px]! font-semibold!">{REASON_LABEL[reason]}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="text-sm! cursor-pointer duration-300 active:scale-90 py-2 rounded-full border-red-600 text-white border-2 w-full mt-2"
                      onClick={() => setPendingAction(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {!selectedIsStarter && swapTargets.length > 0 && (
                      <div className="lb-swap-list">
                        <span className="lb-reason-subtitle">Swap in for</span>
                        {swapTargets.map(({ player, slotIndex, samePosition }) => (
                          <button
                            key={player.id}
                            type="button"
                            className={`lb-swap-row ${samePosition ? "match" : ""}`}
                            onClick={() => {
                              movePlayer(selectedId!, { type: "slot", slotIndex });
                              clearSelection();
                            }}
                          >
                            <span className="lb-swap-number">{player.squadNumber}</span>
                            <span className="lb-swap-name text-[13px]!">{player.fullName}</span>
                            <span className="lb-swap-pos">{player.position}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="lb-action-hint">
                      {selectedIsStarter
                        ? "Tap a bench player to substitute them in instantly."
                        : "Tap a starter above to bring them straight on."}
                    </p>
                    <div className="lb-action-grid">
                      <button
                        type="button"
                        className={`lb-action-button text-sm! font-semibold! ${selectedIsBench ? "current" : ""}`}
                        onClick={sendToBench}
                      >
                        Substitute
                      </button>
                      <button
                        type="button"
                        className={`lb-action-button text-sm! font-semibold! ${selectedIsMissing ? "current" : ""}`}
                        onClick={() => setPendingAction("picking-reason")}
                      >
                        Unavailable
                      </button>

                      {selectedIsStarter && (
                        <button
                          type="button"
                          className={`lb-action-button text-sm! font-semibold! captain ${captainId === selectedId ? "current" : ""}`}
                          onClick={() => setCaptainId((current) => (current === selectedId ? null : selectedId))}
                        >
                          {captainId === selectedId ? "Remove captain" : "Make captain"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Tabs */}
            <nav
              className="grid bg-black/10 backdrop-blur-2xl pb-2.5 px-4 mt-2 gap-1 grid-cols-4"
              role="tablist"
              aria-label="Squad groups"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "bench"}
                className={`text-xs! duration-300 cursor-pointer active:scale-95 py-1.5 rounded-full font-medium! border-2 ${activeTab === "bench" ? "bg-blue-700" : "border-blue-300"}`}
                onClick={() => setActiveTab("bench")}
              >
                Bench {bench.length}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "missing"}
                className={`text-xs! duration-300 cursor-pointer active:scale-95 py-1.5 rounded-full font-medium! border-2 ${activeTab === "missing" ? "bg-red-700" : "border-red-400"}`}
                onClick={() => setActiveTab("missing")}
              >
                Out {missingPlayers.length}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "unassigned"}
                className={`text-xs! duration-300 cursor-pointer active:scale-95 py-1.5 rounded-full font-medium! border-2 ${activeTab === "unassigned" ? "bg-amber-600" : "border-amber-300"}`}
                onClick={() => setActiveTab("unassigned")}
              >
                Pool {unassignedPlayers.length}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "all"}
                className={`text-xs! duration-300 cursor-pointer active:scale-95 py-1.5 rounded-full font-medium! border-2 ${activeTab === "all" ? "bg-emerald-600" : "border-emerald-300"}`}
                onClick={() => setActiveTab("all")}
              >
                Squad {squad.length}
              </button>
            </nav>

            {/* Player List */}
            <section className="lb-player-list" aria-live="polite">
              {activeTab === "bench" && (
                <div className="lb-player-stack">
                  {bench.length === 0 ? (
                    <p className="lb-empty-list">No substitutes yet. Select a player and choose Substitute.</p>
                  ) : (
                    bench.flatMap((id) => {
                      const player = playerById.get(id);
                      return player
                        ? [
                            <PlayerCard
                              key={id}
                              player={player}
                              status="bench"
                              selected={selectedId === id}
                              locked={isLocked}
                              onClick={() => handlePlayerCardClick(id, "bench")}
                            />,
                          ]
                        : [];
                    })
                  )}
                </div>
              )}

              {activeTab === "missing" && (
                <div className="lb-player-stack">
                  {missingPlayers.length === 0 ? (
                    <p className="lb-empty-list">No players are marked unavailable.</p>
                  ) : (
                    missingPlayers.map(({ player }) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        status="missing"
                        selected={selectedId === player.id}
                        locked={isLocked}
                        onClick={() => handlePlayerCardClick(player.id, "missing")}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "unassigned" && (
                <div className="lb-player-stack">
                  {unassignedPlayers.length === 0 ? (
                    <p className="lb-empty-list">Every player has a lineup status.</p>
                  ) : (
                    unassignedPlayers.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        status="pool"
                        selected={selectedId === player.id}
                        locked={isLocked}
                        onClick={() => handlePlayerCardClick(player.id, "pool")}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "all" && (
                <div className="lb-player-stack">
                  {squad.map((player) => {
                    const isStarter = slots.includes(player.id);
                    const isBenchPlayer = bench.includes(player.id);
                    const isMissingPlayer = missingIds.includes(player.id);
                    const status = isStarter
                      ? "starter"
                      : isBenchPlayer
                        ? "bench"
                        : isMissingPlayer
                          ? "missing"
                          : "pool";

                    return (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        status={status}
                        selected={selectedId === player.id}
                        locked={isLocked}
                        onClick={() => handlePlayerCardClick(player.id, status)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Save Button */}
            <footer className="lb-sidebar-footer">
              <button
                type="button"
                className="lb-save-button text-sm! font-semibold! py-2.5! rounded-full!"
                onClick={handleSubmit}
                disabled={!isValid || isSaving || isLocked}
              >
                {isLocked
                  ? "Lineup locked"
                  : isSaving
                    ? isEditing ? "Updating…" : "Submitting…"
                    : saveHasError
                      ? "Try again"
                      : isEditing
                        ? "Update lineup"
                        : "Submit lineup"}
              </button>
              {!isLocked && !isValid && !isSaving && invalidReasons.length > 0 && (
                <p className="lb-save-hint" role="status">
                  {invalidReasons.map((reason) => (
                    <span key={reason}>{reason}</span>
                  ))}
                </p>
              )}
            </footer>
          </>
        )}
      </aside>

      {/* Pitch */}
      <main className="lb-pitch" aria-label="Football pitch lineup">
        <div key={formationPulse} className="lb-formation-flash" aria-hidden="true" />
        <div className="lb-pitch-orb lb-pitch-orb-one" aria-hidden="true" />
        <div className="lb-pitch-orb lb-pitch-orb-two" aria-hidden="true" />

        <div className="lb-pitch-hud" aria-label="Lineup summary">
          <div className="lb-pitch-hud-team">
            <TeamCrest name={teamName} logoUrl={teamLogoUrl} compact />
            <span>{teamName}</span>
          </div>
          <div className="lb-pitch-hud-system">
            <small>System</small>
            <strong>{formationLabel(formation)}</strong>
          </div>
        </div>

        {opponentLineUp && (
          <button
            type="button"
            className={`lb-pitch-hud-opp ${viewingOpponent ? "active" : ""}`}
            onClick={viewingOpponent ? closeOpponentView : openOpponentView}
            aria-pressed={viewingOpponent}
            aria-label={
              viewingOpponent
                ? `Stop viewing ${opponentLineUp.teamName}'s formation`
                : `View ${opponentLineUp.teamName}'s formation on the pitch`
            }
          >
            <div className="lb-pitch-hud-team">
              <TeamCrest name={opponentLineUp.teamName} logoUrl={opponentLogoUrl} compact />
              <span>{opponentLineUp.teamName}</span>
            </div>
            <div className="lb-pitch-hud-system">
              <small>System</small>
              <strong>{formationLabel(opponentLineUp.formation)}</strong>
            </div>
          </button>
        )}

        {selectedPlayer && !isLocked && pendingAction !== "picking-reason" && !viewingOpponent && (
          <div className="lb-pitch-message" role="status">
            <span>Tap a position to place {firstName(selectedPlayer.fullName)}</span>
            <button type="button" onClick={clearSelection}>Cancel</button>
          </div>
        )}

        {viewingOpponent && opponentLineUp && (
          <div className="lb-pitch-message lb-pitch-message--opponent" role="status">
            <span>
              Viewing {opponentLineUp.teamName}&apos;s {formationLabel(opponentLineUp.formation)} lineup
            </span>
            <button type="button" onClick={closeOpponentView}>Back to your lineup</button>
          </div>
        )}

        {/* Pitch Lines */}
        {isMobile ? (
          <svg className="lb-pitch-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="3" y="3" width="94" height="94" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <circle cx="50" cy="50" r="11" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <circle cx="50" cy="50" r=".65" fill="rgba(255,255,255,.72)" />
            <rect x="22" y="3" width="56" height="16" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="36" y="3" width="28" height="6" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <path d="M 40 19 A 12 12 0 0 1 60 19" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="22" y="81" width="56" height="16" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="36" y="91" width="28" height="6" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <path d="M 40 81 A 12 12 0 0 0 60 81" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
          </svg>
        ) : (
          <svg className="lb-pitch-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="3" y="3" width="94" height="94" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <line x1="50" y1="3" x2="50" y2="97" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <circle cx="50" cy="50" r="11" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <circle cx="50" cy="50" r=".65" fill="rgba(255,255,255,.72)" />
            <rect x="3" y="22" width="16" height="56" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="3" y="36" width="6" height="28" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <path d="M 19 40 A 12 12 0 0 1 19 60" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="81" y="22" width="16" height="56" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <rect x="91" y="36" width="6" height="28" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
            <path d="M 81 40 A 12 12 0 0 0 81 60" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth=".4" />
          </svg>
        )}

        {/* Pitch Slots */}
        {viewingOpponent
          ? opponentLayout.map((slot, index) => {
              const entry = opponentSlotAssignments[index];
              const isCaptain =
                entry != null &&
                opponentLineUp?.captainId != null &&
                String(entry.playerId) === String(opponentLineUp.captainId);

              return (
                <div
                  key={`opp-slot-${index}`}
                  className="lb-pitch-slot lb-pitch-slot--opponent"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                >
                  <span className="lb-slot-label">{slot.label}</span>
                  {entry ? (
                    <span className="lb-slot-token lb-slot-token--opponent">
                      {entry.squadNumber ?? "•"}
                      {isCaptain && <span className="lb-captain-mark">C</span>}
                    </span>
                  ) : (
                    <span className="lb-empty-token">?</span>
                  )}
                  {entry && (
                    <span className="lb-player-name" title={entry.fullName}>
                      {entry.fullName ? pitchName(entry.fullName) : "Player"}
                    </span>
                  )}
                </div>
              );
            })
          : layout.map((slot, index) => {
              const playerId = slots[index] ?? null;
              const player = playerId == null ? undefined : playerById.get(playerId);
              const isSelected = playerId != null && playerId === selectedId;
              const isArmed = selectedId != null && !isLocked;

              return (
                <button
                  key={`slot-${index}`}
                  type="button"
                  className={`lb-pitch-slot ${isSelected ? "selected" : ""} ${isArmed ? "armed" : ""}`}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    ["--stagger" as string]: `${index * 20}ms`,
                  }}
                  onClick={() => {
                    if (isLocked) return;
                    if (selectedId != null) {
                      placeStarter(index);
                    } else if (playerId != null) {
                      toggleSelection(playerId);
                    }
                  }}
                  disabled={isLocked}
                  aria-label={player ? `${slot.label}: ${player.fullName}` : `${slot.label}: empty position`}
                  aria-pressed={isSelected}
                >
                  <span className="lb-slot-label">{slot.label}</span>
                  {player ? (
                    <span className="lb-slot-token">
                      {player.squadNumber}
                      {captainId === playerId && <span className="lb-captain-mark">C</span>}
                    </span>
                  ) : (
                    <span className="lb-empty-token">+</span>
                  )}
                  {player && <span className="lb-player-name">{pitchName(player.fullName)}</span>}
                </button>
              );
            })}
      </main>
    </div>
  );
}