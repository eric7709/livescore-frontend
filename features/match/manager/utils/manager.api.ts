// manager.api.ts

import { useQuery } from '@tanstack/react-query';
import {
  FixtureDTO,
  ResultDTO,
  PlayerDTO,
  MatchFilterParams,
  PlayerFilterParams,
} from './manager.types';
import { axiosInstance } from '@/features/shared/utils/axiosInstance';

export const getFixtures = async (
  teamId: number,
  filters: MatchFilterParams = {}
) => {
  const response = await axiosInstance.get<FixtureDTO[]>(
    `/manager/${teamId}/fixtures`,
    { params: filters }
  );
  return response.data;
};

export const getResults = async (
  teamId: number,
  filters: MatchFilterParams = {}
) => {
  const response = await axiosInstance.get<ResultDTO[]>(
    `/manager/${teamId}/results`,
    { params: filters }
  );
  return response.data;
};

export const getPlayers = async (
  teamId: number,
  filters: PlayerFilterParams = {}
) => {
  const response = await axiosInstance.get<PlayerDTO[]>(
    `/manager/${teamId}/players`,
    { params: filters }
  );
  return response.data;
};

// ============ Queries (GET Requests) ============

export const useGetFixtures = (
  teamId?: number,
  filters: MatchFilterParams = {}
) =>
  useQuery({
    queryKey: ['manager', teamId, 'fixtures', filters],
    queryFn: () => getFixtures(teamId!, filters),
    enabled: !!teamId,
  });

export const useGetResults = (
  teamId?: number,
  filters: MatchFilterParams = {}
) =>
  useQuery({
    queryKey: ['manager', teamId, 'results', filters],
    queryFn: () => getResults(teamId!, filters),
    enabled: !!teamId,
  });

export const useGetPlayers = (
  teamId?: number,
  filters: PlayerFilterParams = {}
) =>
  useQuery({
    queryKey: ['manager', teamId, 'players', filters],
    queryFn: () => getPlayers(teamId!, filters),
    enabled: !!teamId,
  });