export type EventMap = Record<string, unknown>;

export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
  clear(): void;
}

export function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: { [K in keyof T]?: EventReceiver<T[K]>[] } = {};

  return {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      const list = listeners[eventName];
      if (list) {
        list.push(fn);
      }
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
        fns.slice().forEach((fn) => {
          fn(params);
        });
      }
    },
    clear() {
      for (const key in listeners) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete listeners[key];
      }
    },
  };
}
