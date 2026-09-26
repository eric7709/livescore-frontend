import { z } from 'zod'

import {
  CaptainStatus,
  PlayerStatus,
  Position,
  PreferredFoot,
  ProfileRequestDTO,
  ProfileResponseDTO,
  Role,
} from './profile.types'

const POSITION_VALUES = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'] as const
const PLAYER_STATUS_VALUES = ['ACTIVE', 'INJURED', 'SUSPENDED', 'UNAVAILABLE'] as const
const CAPTAIN_STATUS_VALUES = ['NONE', 'CAPTAIN', 'VICE_CAPTAIN'] as const
const PREFERRED_FOOT_VALUES = ['LEFT', 'RIGHT', 'BOTH'] as const
const ROLE_VALUES = ['PLAYER', 'MANAGER', 'STAFF', 'MODERATOR', 'ADMIN'] as const

export type ProfileFormInput = z.infer<typeof profileSchema>

export const profileSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    avatarUrl: z.string(),
    squadNumber: z.string(),
    teamId: z.string(),
    status: z.enum(PLAYER_STATUS_VALUES).or(z.literal('')),
    role: z.enum(ROLE_VALUES),
    position: z.enum(POSITION_VALUES).or(z.literal('')),
    captainStatus: z.enum(CAPTAIN_STATUS_VALUES).or(z.literal('')),
    preferredFoot: z.enum(PREFERRED_FOOT_VALUES).or(z.literal('')),
    height: z.string(),
    dateOfBirth: z.string(),
  })
  .refine((data) => data.role !== 'PLAYER' || !!data.position, {
    message: 'Position is required for players',
    path: ['position'],
  })
  .refine((data) => data.role !== 'PLAYER' || !!data.status, {
    message: 'Player status is required',
    path: ['status'],
  })

export const defaultValues: ProfileFormInput = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  avatarUrl: '',
  squadNumber: '',
  teamId: '',
  status: 'ACTIVE',
  role: 'PLAYER',
  position: '',
  captainStatus: 'NONE',
  preferredFoot: '',
  height: '',
  dateOfBirth: '',
}

export function toProfileFormValues(p: ProfileResponseDTO): ProfileFormInput {
  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    phoneNumber: p.phoneNumber ?? '',
    avatarUrl: p.avatarUrl ?? '',
    squadNumber: p.squadNumber !== null && p.squadNumber !== undefined ? String(p.squadNumber) : '',
    teamId: p.teamId !== null && p.teamId !== undefined ? String(p.teamId) : '',
    status: (p.status as PlayerStatus) ?? 'ACTIVE',
    role: (p.role as Role) ?? 'PLAYER',
    position: (p.position as Position) ?? '',
    captainStatus: (p.captainStatus as CaptainStatus) ?? 'NONE',
    preferredFoot: (p.preferredFoot as PreferredFoot) ?? '',
    height: p.height !== null && p.height !== undefined ? String(p.height) : '',
    dateOfBirth: p.dateOfBirth ?? '',
  }
}

export function toProfilePayload(
  data: ProfileFormInput,
  resolvedAvatarUrl?: string,
): ProfileRequestDTO {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    role: data.role as Role,
    position: data.position ? (data.position as Position) : undefined,
    squadNumber: data.squadNumber ? Number(data.squadNumber) : undefined,
    status: data.role === 'PLAYER' ? (data.status as PlayerStatus | undefined) : undefined,
    captainStatus: data.role === 'PLAYER' ? (data.captainStatus || 'NONE') as CaptainStatus : undefined,
    preferredFoot: data.role === 'PLAYER' ? (data.preferredFoot || null) as PreferredFoot | null : undefined,
    teamId: data.teamId ? Number(data.teamId) : undefined,
    avatarUrl: resolvedAvatarUrl ?? data.avatarUrl ?? undefined,
    height: data.role === 'PLAYER' && data.height ? Number(data.height) : undefined,
    dateOfBirth: data.role === 'PLAYER' && data.dateOfBirth ? data.dateOfBirth : undefined,
  }
}