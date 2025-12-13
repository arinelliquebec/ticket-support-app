"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type RealtimeEvent = {
  type: string;
  data: any;
  userId?: string;
  adminOnly?: boolean;
  timestamp: number;
};

type EventCallback = (event: RealtimeEvent) => void;

export function useRealtimeNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const callbacksRef = useRef<Map<string, EventCallback[]>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: string, callback: EventCallback) => {
    const callbacks = callbacksRef.current.get(eventType) || [];
    callbacksRef.current.set(eventType, [...callbacks, callback]);

    // Return unsubscribe function
    return () => {
      const callbacks = callbacksRef.current.get(eventType) || [];
      callbacksRef.current.set(
        eventType,
        callbacks.filter((cb) => cb !== callback)
      );
    };
  }, []);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    console.log("[Realtime] Connecting to SSE...");
    const eventSource = new EventSource("/api/realtime/notifications");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[Realtime] Connected to SSE");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle connection confirmation
        if (data.type === "connected") {
          setConnectionId(data.connectionId);
          console.log(`[Realtime] Connection ID: ${data.connectionId}`);
          return;
        }

        // Broadcast to all subscribers
        const allCallbacks = callbacksRef.current.get("*") || [];
        allCallbacks.forEach((callback) => callback(data));

        // Trigger specific event callbacks
        const typeCallbacks = callbacksRef.current.get(data.type) || [];
        typeCallbacks.forEach((callback) => callback(data));
      } catch (error) {
        console.error("[Realtime] Error parsing event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[Realtime] SSE error:", error);
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt reconnection with exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;
        console.log(
          `[Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        console.error(
          "[Realtime] Max reconnection attempts reached. Please refresh the page."
        );
      }
    };
  }, []);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      console.log("[Realtime] Disconnecting from SSE");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setConnectionId(null);
    }
  }, []);

  // Auto-connect on mount, cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionId,
    subscribe,
    connect,
    disconnect,
  };
}

