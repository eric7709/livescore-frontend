// features/shared/sockets/socketClient.ts
"use client";

import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client: Client | null = null;

/**
 * Returns the single shared STOMP connection, creating and activating it
 * on first call. Every feature (match list, match detail, anything else)
 * calls this instead of making its own Client — one phone line, many rooms.
 */
export function getSocketClient(): Client {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws`),
    reconnectDelay: 5000,
  });

  client.activate();
  return client;
}

export function disconnectSocketClient() {
  client?.deactivate();
  client = null;
}

/**
 * Subscribes to a topic once the connection is ready (immediately if already
 * connected, or as soon as it connects). Returns an unsubscribe function you
 * can call from a React effect's cleanup — safe even if called before the
 * socket ever finished connecting.
 */
export function subscribeWhenConnected(
  destination: string,
  callback: (body: string) => void
): () => void {
  const socket = getSocketClient();
  let subscription: StompSubscription | null = null;
  let cancelled = false;

  const trySubscribe = () => {
    if (cancelled) return;
    subscription = socket.subscribe(destination, (message) => callback(message.body));
  };

  if (socket.connected) {
    trySubscribe();
  } else {
    // stompjs only supports one onConnect handler at a time being *set*,
    // but multiple subscribers may call this before the first connection —
    // so we chain onto whatever's already there instead of overwriting it.
    const previousOnConnect = socket.onConnect;
    socket.onConnect = (frame) => {
      previousOnConnect?.(frame);
      trySubscribe();
    };
  }

  return () => {
    cancelled = true;
    subscription?.unsubscribe();
  };
}