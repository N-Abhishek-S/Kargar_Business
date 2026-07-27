export type EventMap = Record<string, any>;

export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
  clear(): void;
}

export function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: { [K in keyof T]?: Array<EventReceiver<T[K]>> } = {};

  return {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      listeners[eventName]!.push(fn);
    },
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
      const fns = listeners[eventName];
      if (fns) {
        const index = fns.indexOf(fn);
        if (index > -1) {
          fns.splice(index, 1);
        }
      }
    },
    emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
      const fns = listeners[eventName];
      if (fns) {
        fns.slice().forEach((fn) => fn(params));
      }
    },
    clear() {
      for (const key in listeners) {
        delete listeners[key];
      }
    },
  };
}
