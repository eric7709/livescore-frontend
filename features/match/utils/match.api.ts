import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  MatchDTO,
  MatchRequest,
  MatchSearchRequest,
  MatchOverviewDTO,
  CompetitionMatchesDTO,
  MatchesByDateRequest,
  MatchStatus,
} from './match.types';
import { axiosInstance } from '@/features/shared/utils/axiosInstance';
import { PageParams, PageResponse } from '@/features/shared/types/pages.types';

// ============ API Functions (usable in server components) ============

export const getMatches = async (competitionId?: number) => {
  const response = await axiosInstance.get<MatchDTO[]>('/matches', {
    params: competitionId ? { competitionId } : {}
  });
  return response.data;
};

export const getMatchById = async (id: number) => {
  const response = await axiosInstance.get<MatchDTO>(`/matches/${id}`);
  return response.data;
};

export const getMatchOverview = async (matchId: number) => {
  const response = await axiosInstance.get<MatchOverviewDTO>(
    `/matches/${matchId}/overview`
  );
  return response.data;
};

export const searchMatches = async (
  queryParams: MatchSearchRequest = {},
  pageParams: PageParams = { size: 200, sort: 'matchDate,desc' }
) => {
  const response = await axiosInstance.get<PageResponse<MatchDTO>>(
    '/matches/search',
    {
      params: { ...queryParams, ...pageParams }
    }
  );
  return response.data;
};

export const createMatch = async (newMatch: MatchRequest) => {
  const response = await axiosInstance.post<MatchDTO>('/matches', newMatch);
  return response.data;
};

export const updateMatch = async (id: number, payload: MatchRequest) => {
  const response = await axiosInstance.put<MatchDTO>(`/matches/${id}`, payload);
  return response.data;
};

export const deleteMatch = async (id: number) => {
  await axiosInstance.delete(`/matches/${id}`);
};

// Matches for a given date (defaults to today server-side), grouped by
// competition, optionally filtered by one or more statuses.
export const getMatchesByDate = async ({ date, status }: MatchesByDateRequest = {}) => {
  const response = await axiosInstance.get<CompetitionMatchesDTO[]>('/matches/by-date', {
    params: { date, status },
  });
  return response.data;
};

// All matches in the DB (grouped by competition, optionally filtered by status)
export const getAllMatches = async (status?: MatchStatus[]) => {
  const response = await axiosInstance.get<CompetitionMatchesDTO[]>('/matches/all', {
    params: { status },
  });
  return response.data;
};

// ============ Queries (GET Requests) ============

export const useGetMatches = (competitionId?: number) =>
  useQuery({
    queryKey: ['matches', { competitionId }],
    queryFn: () => getMatches(competitionId),
  });
  
export const useGetMatchById = (
  id?: number,
  options?: Partial<UseQueryOptions<MatchDTO>>
) =>
  useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatchById(id!),
    enabled: !!id,
    ...options, // Merges custom options like refetchInterval
  });

export const useGetMatchOverview = (matchId?: number) =>
  useQuery({
    queryKey: ['match', matchId, 'overview'],
    queryFn: () => getMatchOverview(matchId!),
    enabled: !!matchId,
  });

export const useSearchMatches = (
  queryParams: MatchSearchRequest = {},
  pageParams: PageParams = { size: 20, sort: 'matchDate,desc' },
  enabled: boolean = true
) =>
  useQuery<PageResponse<MatchDTO>>({
    queryKey: ['matches', 'search', { queryParams, pageParams }],
    queryFn: () => searchMatches(queryParams, pageParams),
    enabled
  });

export const useGetMatchesByDate = (
  { date, status }: MatchesByDateRequest = {},
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['matches', 'by-date', { date, status }],
    queryFn: () => getMatchesByDate({ date, status }),
    enabled,
  });

export const useGetAllMatches = (
  status?: MatchStatus[],
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['matches', 'all', { status }],
    queryFn: () => getAllMatches(status),
    enabled,
  });

// ============ Mutations (POST, PUT, DELETE) ============

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MatchRequest }) =>
      updateMatch(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', variables.id] });
    },
  });
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
};

export const useGetLiveMatches = (competitionId?: number) =>
  useQuery({
    queryKey: ['competition', competitionId, 'live-team-ids'],
    queryFn: async () => {
      const response = await axiosInstance.get<number[]>(
        `/competitions/${competitionId}/matches/live`
      );
      return response.data;
    },
    enabled: !!competitionId,
    refetchInterval: 15000,
  });