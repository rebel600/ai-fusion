type Listener = (payload: any) => void;

class EventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
  }

  emit(event: string, payload: any) {
    const handlers = this.listeners[event] || [];

    handlers.forEach((handler) => handler(payload));
  }

  off(event: string, callback: Listener) {
    const handlers = this.listeners[event];

    if (!handlers) {
      return;
    }

    this.listeners[event] = handlers.filter((handler) => handler !== callback);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __eventBus: EventEmitter | undefined;
}

export const globalEventBus = global.__eventBus || new EventEmitter();

if (!global.__eventBus) {
  global.__eventBus = globalEventBus;
}
