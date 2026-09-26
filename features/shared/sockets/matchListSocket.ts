"use client";

import { QueryClient } from "@tanstack/react-query";
import { subscribeWhenConnected } from "./socketClient";

export function connectMatchListSocket(queryClient: QueryClient): () => void {
  return subscribeWhenConnected("/topic/matches", () => {
    queryClient.invalidateQueries({ queryKey: ["matches"] });
  });
}