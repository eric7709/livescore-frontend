import { z } from 'zod'
import {
  MatchDTO,
  MatchRequest,
  MATCH_STATUSES,
  MATCH_TYPES,
} from './match.types'

export class MatchForm {
  private static readonly MatchStatusEnum =
    z.enum(MATCH_STATUSES)

  private static readonly MatchTypeEnum =
    z.enum(MATCH_TYPES)

  static readonly schema = z.object({
    competitionId: z.string(),
    competitionName: z.string(),

    homeTeamId: z
      .string()
      .min(1, 'Home team is required'),

    homeTeamName: z.string(),

    awayTeamId: z
      .string()
      .min(1, 'Away team is required'),

    awayTeamName: z.string(),

    matchDate: z
      .string()
      .min(1, 'Match date is required'),

    stadium: z
      .string()
      .min(1, 'Stadium is required'),

    status: MatchForm.MatchStatusEnum,
    matchType: MatchForm.MatchTypeEnum,

    homeScore: z.string(),
    awayScore: z.string(),

  }).refine(
    (data) =>
      data.homeTeamId !== data.awayTeamId ||
      !data.homeTeamId,
    {
      message: 'Away team must be different',
      path: ['awayTeamId'],
    }
  )

  static defaultValues(): MatchFormInput {
    return {
      competitionId: '',
      competitionName: '',

      homeTeamId: '',
      homeTeamName: '',

      awayTeamId: '',
      awayTeamName: '',

      matchDate: '',

      stadium: '',

      status: 'SCHEDULED',
      matchType: 'REGULAR',

      homeScore: '',
      awayScore: '',
    }
  }

  /**
   * MatchDTO → Form values
   */
  static fromMatch(match: MatchDTO): MatchFormInput {
    return {
      competitionId: `${match.competitionId ?? ''}`,
      competitionName: match.competitionName ?? '',

      homeTeamId: `${match.homeTeamId ?? ''}`,
      homeTeamName: match.homeTeamName ?? '',

      awayTeamId: `${match.awayTeamId ?? ''}`,
      awayTeamName: match.awayTeamName ?? '',

      matchDate: this.normalizeDate(match.matchDate),

      stadium: match.stadium ?? '',

      status: match.status,
      matchType: match.matchType,

      homeScore: `${match.homeScore ?? ''}`,
      awayScore: `${match.awayScore ?? ''}`,
    }
  }

  /**
   * Form values → API request
   */
  static toPayload(
    data: MatchFormInput
  ): MatchRequest {
    return {
      competitionId: data.competitionId
        ? Number(data.competitionId)
        : null,

      homeTeamId: Number(data.homeTeamId),
      awayTeamId: Number(data.awayTeamId),

      matchDate: data.matchDate
        ? `${data.matchDate}:00Z`
        : '',

      stadium: data.stadium.trim(),

      status: data.status,
      matchType: data.matchType,
    }
  }

  private static normalizeDate(
    date?: string
  ): string {
    if (!date) return ''

    return date.slice(0, 16)
  }
}

export type MatchFormInput =
  z.infer<typeof MatchForm.schema>