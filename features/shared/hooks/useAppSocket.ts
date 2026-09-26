"use client";

import { Client } from "@stomp/stompjs";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAppSocket(queryClient: QueryClient) {
  useEffect(() => {
    const client = new Client({
      brokerURL: "wss://your-api.com/ws",
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe("/topic/matches", () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [queryClient]);
}