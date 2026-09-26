// app/providers.tsx
"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { connectMatchListSocket } from "@/features/shared/sockets/matchListSocket";
import { disconnectSocketClient } from "@/features/shared/sockets/socketClient";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = connectMatchListSocket(queryClient);
    return () => {
      unsubscribe();
      disconnectSocketClient(); // only call this if nothing else needs the connection anymore
    };
  }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}