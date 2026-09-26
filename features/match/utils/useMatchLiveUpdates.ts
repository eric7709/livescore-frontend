// features/match/hooks/useMatchLiveUpdates.ts
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeWhenConnected } from "@/features/shared/sockets/socketClient";
import { MatchDTO } from "@/features/match/utils/match.types";

export function useMatchLiveUpdates(matchId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const unsubscribeState = subscribeWhenConnected(
      `/topic/matches/${matchId}/state`,
      (body) => {
        const match: MatchDTO = JSON.parse(body);
        queryClient.setQueryData(["match", matchId], match);
      }
    );

    const unsubscribeEvents = subscribeWhenConnected(
      `/topic/matches/${matchId}/events`,
      (body) => {
        const payload = JSON.parse(body);
        if (payload.deleted) {
          queryClient.setQueryData(["match", matchId, "summaries"], (old: any) =>
            removeEvent(old, payload.id)
          );
        } else {
          queryClient.invalidateQueries({ queryKey: ["match", matchId, "summaries"] });
        }
      }
    );

    return () => {
      unsubscribeState();
      unsubscribeEvents();
    };
  }, [matchId, queryClient]);
}

function removeEvent(periods: any, eventId: number) {
  if (!periods) return periods;
  return periods.map((period: any) => ({
    ...period,
    summaries: period.summaries.filter((e: any) => e.id !== eventId),
  }));
}