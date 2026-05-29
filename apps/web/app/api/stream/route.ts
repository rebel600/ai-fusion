import {
  globalEventBus,
} from "@repo/orchestrator";

export async function GET() {

  const encoder =
    new TextEncoder();

  const stream =
    new ReadableStream({

      start(controller) {

        let closed = false;

        const listeners:
          Array<() => void> = [];

        const safeSend = (
          data: string
        ) => {

          if (closed) {
            return;
          }

          try {

            controller.enqueue(
              encoder.encode(data)
            );

          } catch {

            closed = true;
          }
        };

        const sendEvent = (
          event: string,
          payload: any
        ) => {

          safeSend(
            `data: ${JSON.stringify({
              event,
              payload,
            })}\n\n`
          );
        };

        const events = [
          "workflow:stage",
          "worker:start",
          "worker:complete",
          "workflow:retry",
          "workflow:revision",
          "workflow:completed",
          "workflow:error",
          "workflow:failed",
        ];

        events.forEach(
          (eventName) => {

            const handler = (
              payload: any
            ) => {

              sendEvent(
                eventName,
                payload
              );
            };

            globalEventBus.on(
              eventName,
              handler
            );

            listeners.push(() => {

              globalEventBus.off(
                eventName,
                handler
              );
            });
          }
        );

        const heartbeat =
          setInterval(() => {

            safeSend(
              `: heartbeat\n\n`
            );

          }, 15000);

        return () => {

          closed = true;

          clearInterval(
            heartbeat
          );

          listeners.forEach(
            (cleanup) =>
              cleanup()
          );
        };
      },
    });

  return new Response(stream, {
    headers: {
      "Content-Type":
        "text/event-stream",

      "Cache-Control":
        "no-cache, no-transform",

      Connection:
        "keep-alive",
    },
  });
}