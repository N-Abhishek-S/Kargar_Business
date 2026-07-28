/**
 * Strongly typed EventBus for loose coupling across the Media SDK.
 */

export type EventType = string;

export interface EventMessage<T = unknown> {
  type: EventType;
  payload?: T;
  timestamp: number;
}

export type EventHandler<T = unknown> = (event: EventMessage<T>) => void;

export class EventBus {
  private listeners = new Map<EventType, Set<EventHandler>>();

  public subscribe<T>(type: EventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(handler as EventHandler);

    return () => { this.unsubscribe(type, handler as EventHandler); };
  }

  public unsubscribe<T>(type: EventType, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  public publish(type: EventType, payload?: unknown): void {
    const event: EventMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

// Global instance for the Media SDK
export const mediaEventBus = new EventBus();
