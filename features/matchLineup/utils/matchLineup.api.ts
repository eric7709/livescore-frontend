import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { axiosInstance } from '@/features/shared/utils/axiosInstance';
import {
  MatchLineupBothTeams,
  MatchLineupDTO,
  MatchLineUpRequest,
  PlayerLineupInfo,
  MatchPlayerStatsBothTeams
} from './matchLineup.types';
import { useGetMatchById } from '@/features/match/utils/match.api';

/**
 * A 404 on any of these GET endpoints means "nothing submitted yet for this
 * match/team" — a normal, expected state, not a fetch failure. Axios throws
 * on any non-2xx by default, which was making react-query mark that as a
 * real error (isError: true) and blank out consuming UI even though there
 * was nothing wrong. This swallows a 404 into `null` and lets everything
 * else (network errors, 500s, etc.) propagate as a genuine error like before.
 */
async function getOrNull<T>(url: string): Promise<T | null> {
  try {
    const response = await axiosInstance.get<T>(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// ============ Queries (GET Requests) ============

// GET /api/match-lineup/match/{matchId}
// null when neither team has a lineup submitted yet.
export const useGetMatchLineup = (matchId?: number) =>
  useQuery({
    queryKey: ['match-lineups', 'match', matchId],
    queryFn: () => getOrNull<MatchLineupBothTeams>(`/match-lineup/match/${matchId}`),
    enabled: !!matchId,
  });

// GET /api/match-lineup/match/{matchId}/team/{teamId}
// null when this team hasn't submitted a lineup for this match yet.
export const useGetTeamLineup = (
  matchId?: number,
  teamId?: number
) =>
  useQuery({
    queryKey: ["match-lineups", "match", matchId, "team", teamId],
    queryFn: () =>
      getOrNull<MatchLineupDTO>(
        `/match-lineup/match/${matchId}/team/${teamId}`
      ),
    enabled: !!matchId && !!teamId,
  });
  
export const useGetOpponentLineup = (matchId?: number, teamId?: number) =>
  useQuery({
    queryKey: ["match-lineups", "match", matchId, "team", teamId, "opponent"],
    queryFn: () =>
      getOrNull<MatchLineupDTO>(
        `/match-lineup/match/${matchId}/team/${teamId}/opponent`
      ),
    enabled: !!matchId && !!teamId,
  });


// GET /api/match-lineup/match/{matchId}/team/{teamId}/stats
// null when there's no lineup for this team yet to derive stats from.
export const useGetTeamPlayerStats = (matchId?: number, teamId?: number) =>
  useQuery({
    queryKey: ['match-lineups', 'match', matchId, 'team', teamId, 'stats'],
    queryFn: () => getOrNull<PlayerLineupInfo[]>(`/match-lineup/match/${matchId}/team/${teamId}/stats`),
    enabled: !!matchId && !!teamId,
  });

// GET /api/match-lineup/match/{matchId}/stats
// null when neither team has a lineup yet to derive stats from.
export const useGetMatchPlayerStats = (matchId?: number) =>
  useQuery({
    queryKey: ['match-lineups', 'match', matchId, 'stats'],
    queryFn: () => getOrNull<MatchPlayerStatsBothTeams>(`/match-lineup/match/${matchId}/stats`),
    enabled: !!matchId,
  });

// ============ Mutations (POST, PUT Requests) ============

// POST /api/match-lineup
export const useSubmitLineup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: MatchLineUpRequest) => {
      const response = await axiosInstance.post<MatchLineupDTO>('/match-lineup', request);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['match-lineups', 'match', variables.matchId, 'team', variables.teamId],
        data
      );
      queryClient.invalidateQueries({ queryKey: ['match-lineups'] });
    },
  });
};

// PUT /api/match-lineup/match/{matchId}/team/{teamId}
export const useUpdateLineup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
      request
    }: {
      matchId: number;
      teamId: number;
      request: MatchLineUpRequest;
    }) => {
      const response = await axiosInstance.put<MatchLineupDTO>(
        `/match-lineup/match/${matchId}/team/${teamId}`,
        request
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific queries related to this match/team
      queryClient.invalidateQueries({
        queryKey: ['match-lineups', 'match', variables.matchId]
      });
      queryClient.invalidateQueries({
        queryKey: ['match-lineups', 'match', variables.matchId, 'team', variables.teamId]
      });
      // Also invalidate stats queries
      queryClient.invalidateQueries({
        queryKey: ['match-lineups', 'match', variables.matchId, 'team', variables.teamId, 'stats']
      });
    },
  });
};