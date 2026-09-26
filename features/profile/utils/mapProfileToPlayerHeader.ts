import type { PlayerHeaderData } from "../components/manageProfile/PageHeader";
import { ProfileResponseDTO } from "./profile.types";

/**
 * Maps the backend ProfileResponseDTO onto the shape PageHeader expects.
 *
 * NOTE: `nationality` / `nationalityFlagUrl` are left undefined — Profile
 * has no nationality field on the backend yet. PageHeader already renders
 * fine without them (that row just doesn't show). Add the field to
 * Profile/ProfileResponseDTO and map it here once it exists.
 */
export function mapProfileToPlayerHeader(profile: ProfileResponseDTO): PlayerHeaderData {
  return {
    id: String(profile.id),
    fullName: profile.fullName,
    position: profile.position ?? null,
    photoUrl: profile.avatarUrl ?? null,
    dateOfBirth: profile.dateOfBirth ?? null,
    heightCm: profile.height ?? null,
    preferredFoot: profile.preferredFoot ?? null,
  };
}