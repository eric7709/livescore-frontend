// src/profile/utils/positionGroups.ts

import { Position, PositionGroup } from "./profile.types";

export const POSITION_GROUP_MAP: Record<Position, PositionGroup> = {
  GK: "GOALKEEPER",
  CB: "DEFENDER",
  LB: "DEFENDER",
  RB: "DEFENDER",
  LWB: "DEFENDER",
  RWB: "DEFENDER",
  CM: "MIDFIELDER",
  CDM: "MIDFIELDER",
  CAM: "MIDFIELDER",
  LM: "MIDFIELDER",
  RM: "MIDFIELDER",
  LW: "FORWARD",
  RW: "FORWARD",
  ST: "FORWARD",
  CF: "FORWARD",
};

export function getPositionCodesForGroup(group: PositionGroup): Position[] {
  return (Object.keys(POSITION_GROUP_MAP) as Position[]).filter(
    (code) => POSITION_GROUP_MAP[code] === group
  );
}

export function getGroupForPositionCode(code: Position): PositionGroup {
  return POSITION_GROUP_MAP[code];
}