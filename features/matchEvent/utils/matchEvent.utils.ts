// utils/matchEvent.utils.ts
import { MatchDTO, MatchPeriod } from "@/features/match/utils/match.types";
import { DEDICATED_MODAL_EVENTS, EventType, MatchEventRequest } from "./matchEvent.types";
import { MatchPlayerStatsBothTeams, PlayerLineupInfo } from "@/features/matchLineup/utils/matchLineup.types";

export type GoalType =
  | "GOAL"
  | "OWN_GOAL"
  | "PENALTY_GOAL"
  | "FREE_KICK_GOAL"
  | "LONG_RANGE_GOAL";

export type TeamSide = "HOME" | "AWAY";

export interface EventVisual {
  glyph: string;
  className: string;
}

export const GOAL_TYPES: GoalType[] = ["GOAL", "OWN_GOAL", "PENALTY_GOAL", "FREE_KICK_GOAL", "LONG_RANGE_GOAL"];
export const NO_ASSIST_TYPES: GoalType[] = ["OWN_GOAL", "PENALTY_GOAL", "FREE_KICK_GOAL"];

export class MatchEventUtils {
  private constructor() { }

  /**
   * Formats event types into human-readable labels.
   */
  public static formatLabel(type: string): string {
    return type.replace(/_/g, " ").toLowerCase();
  }


  public static getBothTeamCode(match?: MatchDTO){
    return [match?.homeTeamCode.trim() ?? "HOME", match?.awayTeamCode.trim() ?? "AWAY"]
  }
  
  
  /**
   * Checks if a team ID corresponds to the home team.
   */
  public static isHomeTeam(match: MatchDTO | null | undefined, teamId: number | null): boolean {
    if (!match || !teamId) return false;
    return teamId === match.homeTeamId;
  }
  public static getBookableSquad(playerStats: MatchPlayerStatsBothTeams | null | undefined, teamId: number, match: MatchDTO | undefined): PlayerLineupInfo[] | null | undefined {
    return playerStats &&
      (MatchEventUtils.isHomeTeam(match, teamId) ? playerStats.homeTeam : playerStats.awayTeam).filter((p) => p.bookable);
  }

  public static getSelectedPlayer(playerId: number | null, bookableSquad: PlayerLineupInfo[] | null | undefined): PlayerLineupInfo | undefined {
    return bookableSquad?.find((p) => p.playerId === playerId)
  }


  /**
   * Resolves the string event type into a strict GoalType.
   */
  public static getGoalType(eventType: string | null | undefined): GoalType {
    if (eventType && GOAL_TYPES.includes(eventType as GoalType)) {
      return eventType as GoalType;
    }
    return "GOAL";
  }

  /**
   * Resolves the code of the team currently selected.
   */
  public static getTeamSideAndCode(teamId: number | null, match?: MatchDTO | null): string {
    if (!match || !teamId) return "";
    return MatchEventUtils.isHomeTeam(match, teamId) ? (match.homeTeamCode ?? "") : (match.awayTeamCode ?? "");
  }

  /**
   * Resolves the actual team ID of the goalscorer.
   * For an OWN_GOAL, the goalscorer belongs to the opposition team.
   */
  public static getScorersTeamId(
    match: MatchDTO | null | undefined,
    clickedTeamId: number | null,
    goalType: GoalType
  ): number | null {
    if (!match || !clickedTeamId) return clickedTeamId;

    if (goalType === "OWN_GOAL") {
      const clickedIsHome = clickedTeamId === match.homeTeamId;
      return clickedIsHome ? (match.awayTeamId ?? null) : (match.homeTeamId ?? null);
    }

    return clickedTeamId;
  }

  /**
   * Checks if assists are allowed for a given GoalType.
   */
  public static areAssistsAllowed(goalType: GoalType): boolean {
    return !NO_ASSIST_TYPES.includes(goalType);
  }

  /**
   * Constructs the standardized request payload for creating match events.
   */
  public static buildEventPayload(
    matchId: number,
    period: MatchPeriod | null | undefined,
    teamId: number | null,
    eventType: EventType | null,
    primaryPlayerId: number | null,
    secondaryPlayerId: number | null = null
  ): MatchEventRequest | null {
    if (!matchId || !period || !teamId || !eventType || !primaryPlayerId) {
      return null;
    }
    return {
      matchId,
      period,
      teamId,
      eventType,
      primaryPlayerId,
      secondaryPlayerId,
    };
  }

  /**
   * Checks if an event requires a dedicated modal.
   */
  public static isModalEvent(type: string, modalEvents: string[]): boolean {
    return modalEvents.includes(type);
  }

  /**
   * Determines if the Generic Modal should render.
   */
  public static shouldRenderGenericModal(modal: string | null): boolean {
    if (modal == null) return false;
    return !DEDICATED_MODAL_EVENTS.includes(modal as EventType);
  }

  /**
   * Determines if the Goal & Assist modal should render.
   */
  public static shouldRenderGoalModal(modal: string | null): boolean {
    if (modal == null) return false;
    return GOAL_TYPES.includes(modal as GoalType);
  }

  /**
   * Checks if an EventType represents any flavor of Goal.
   */
  public static isGoalEvent(type: EventType): boolean {
    return GOAL_TYPES.includes(type as GoalType);
  }

  /**
   * Determines glyph characters and style variants for specific event buttons.
   */
  public static getVisuals(type: EventType): EventVisual {
    if (this.isGoalEvent(type)) {
      return { glyph: "G", className: "border-amber-300/25 bg-amber-300/10 text-amber-200" };
    }

    if (type === "SUBSTITUTION") {
      return { glyph: "↔", className: "border-sky-300/25 bg-sky-300/10 text-sky-200" };
    }

    if (type.includes("YELLOW")) {
      return { glyph: "YC", className: "border-yellow-300/25 bg-yellow-300/10 text-yellow-200" };
    }

    if (type.includes("RED")) {
      return { glyph: "RC", className: "border-rose-300/25 bg-rose-300/10 text-rose-200" };
    }

    if (type.includes("PENALTY")) {
      return { glyph: "P", className: "border-violet-300/25 bg-violet-300/10 text-violet-200" };
    }

    return { glyph: "•", className: "border-white/15 bg-white/5 text-white/60" };
  }

  /**
   * Safely structures display names for teams using shortcodes or safe fallbacks.
   */
  public static getCompactTeamName(
    name: string | null | undefined,
    code: string | null | undefined,
    fallback: string
  ): string {
    return code?.trim() || name?.trim() || fallback;
  }
}