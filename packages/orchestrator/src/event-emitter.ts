type Listener = (
  payload: any
) => void;

export class EventEmitter {

  private listeners:
    Record<
      string,
      Listener[]
    > = {};

  on(
    event: string,
    callback: Listener
  ) {

    if (
      !this.listeners[event]
    ) {

      this.listeners[event] = [];
    }

    this.listeners[event]
      .push(callback);
  }

  emit(
    event: string,
    payload: any
  ) {

    const handlers =
      this.listeners[event] || [];

    handlers.forEach(
      (handler) =>
        handler(payload)
    );
  }
}