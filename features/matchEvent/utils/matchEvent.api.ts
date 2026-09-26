import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  MatchEventDTO,
  MatchEventRequest,
  MatchStatistic,
  MatchSummary
} from './matchEvent.types';

import { axiosInstance } from '@/features/shared/utils/axiosInstance';




export const useGetMatchEvents = (matchId?: number) =>
  useQuery({
    queryKey: ['match-events', matchId],
    queryFn: async () => {
      const response = await axiosInstance.get<MatchEventDTO[]>('/match-events', {
        params: { matchId },
      });
      return response.data;
    },
    enabled: !!matchId,
  });
  




export const useGetMatchEventById = (id?: number) =>
  useQuery({
    queryKey: ['match-event', id],
    queryFn: async () => {
      const response = await axiosInstance.get<MatchEventDTO>(`/match-events/${id}`);
      return response.data;
    },
    enabled: !!id,
  });




export const useGetMatchStats = (matchId?: number,) =>
  useQuery({
    queryKey: ['match-events', matchId, 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get<MatchStatistic[]>(`/match-events/${matchId}/statistics`);
      return response.data;
    },
    enabled: !!matchId
  });




export const useGetMatchSummaries = (matchId?: number) =>
  useQuery({
    queryKey: ['match-events', matchId, 'summary'],
    queryFn: async () => {
      const response = await axiosInstance.get<MatchSummary[]>(`/match-events/${matchId}/summary`);
      return response.data;
    },
    enabled: !!matchId,
  });




// ============ Mutations (POST, DELETE) ============




export const useCreateMatchEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEvent: MatchEventRequest) => {
      const response = await axiosInstance.post<MatchEventDTO>('/match-events', newEvent);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 1. Matches ['match', variables.matchId] perfectly now
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
      // 2. Double-check your other keys too! 
      // If your match-event list queries use ['match-events', matchId], update this one as well:
      queryClient.invalidateQueries({ queryKey: ['match-events', variables.matchId] });
      
      // These look good as long as your queries use individual arguments after the base key
      queryClient.invalidateQueries({ queryKey: ['match-events', variables.matchId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['match-events', variables.matchId, 'summary'] });

      // Invalidate lineup stats for the team that had the event
      queryClient.invalidateQueries({ queryKey: ['match-lineups', 'match', variables.matchId, 'team', variables.teamId, 'stats'] });
      // Invalidate lineup stats for both teams
      queryClient.invalidateQueries({ queryKey: ['match-lineups', 'match', variables.matchId, 'stats'] });
    },
  });
};




export const useDeleteMatchEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/match-events/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match-events'] }),
  });
};
