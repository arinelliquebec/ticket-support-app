// Server-side event bus for real-time notifications
// Singleton pattern to share across API routes

type EventType =
  | "ticket:created"
  | "ticket:updated"
  | "ticket:deleted"
  | "comment:created"
  | "ticket:status_changed"
  | "kpi:ticket_created"
  | "kpi:ticket_resolved";

export interface RealtimeEvent {
  type: EventType;
  data: any;
  userId?: string; // Target specific user
  adminOnly?: boolean; // Only send to admins
  timestamp: number;
}

type EventListener = (event: RealtimeEvent) => void;

class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();

  private constructor() {}

  // Subscribe to events with a unique connection ID
  subscribe(connectionId: string, listener: EventListener) {
    console.log(
      `[EventBus] ✅ SUBSCRIBE called for connection: ${connectionId}`
    );
    const existingListeners = this.listeners.get(connectionId) || [];
    this.listeners.set(connectionId, [...existingListeners, listener]);
    console.log(
      `[EventBus] Total connections after subscribe: ${this.listeners.size}`
    );
    console.log(
      `[EventBus] Active connections:`,
      Array.from(this.listeners.keys())
    );

    // Return unsubscribe function
    return () => {
      console.log(
        `[EventBus] ⬇️ UNSUBSCRIBE called for connection: ${connectionId}`
      );
      const listeners = this.listeners.get(connectionId) || [];
      this.listeners.set(
        connectionId,
        listeners.filter((l) => l !== listener)
      );

      // Clean up if no listeners left
      if (this.listeners.get(connectionId)?.length === 0) {
        this.listeners.delete(connectionId);
        console.log(`[EventBus] 🗑️ Connection removed: ${connectionId}`);
      }
      console.log(
        `[EventBus] Total connections after unsubscribe: ${this.listeners.size}`
      );
    };
  }

  // Unsubscribe all listeners for a connection
  unsubscribe(connectionId: string) {
    this.listeners.delete(connectionId);
  }

  // Broadcast event to all connected clients
  broadcast(event: RealtimeEvent) {
    const eventToSend = {
      ...event,
      timestamp: Date.now(),
    };

    console.log(
      `[EventBus] Broadcasting event type: ${event.type} to ${this.listeners.size} connections`
    );

    if (this.listeners.size === 0) {
      console.warn(
        "[EventBus] ⚠️ No listeners connected! Event will not be delivered."
      );
    }

    this.listeners.forEach((listeners, connectionId) => {
      console.log(`[EventBus] Sending to connection: ${connectionId}`);
      listeners.forEach((listener) => {
        try {
          listener(eventToSend);
          console.log(`[EventBus] ✅ Event sent to ${connectionId}`);
        } catch (error) {
          console.error(
            `[EventBus] ❌ Error sending event to ${connectionId}:`,
            error
          );
        }
      });
    });
  }

  // Get number of active connections
  getConnectionCount(): number {
    return this.listeners.size;
  }

  // Alias for getConnectionCount
  getListenerCount(): number {
    return this.listeners.size;
  }

  // Get all connection IDs
  getConnectionIds(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Ensure singleton across HMR and separate route modules
declare global {
  // eslint-disable-next-line no-var
  var __eventBus: EventBus | undefined;
}

if (!globalThis.__eventBus) {
  globalThis.__eventBus = new EventBus();
}

export const eventBus = globalThis.__eventBus as EventBus;
