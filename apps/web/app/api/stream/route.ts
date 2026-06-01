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

        const safeSend = (
          data: any
        ) => {

          if (closed) {
            return;
          }

          try {

            controller.enqueue(

              encoder.encode(

                `data: ${JSON.stringify(data)}\n\n`
              )
            );

          } catch {

            closed = true;
          }
        };

        // Initial handshake
        safeSend({

          event:
            "stream:connected",

          payload: {
            ok: true,
          },
        });

        const events = [

          "workflow:stage",

          "worker:start",

          "worker:complete",

          "workflow:retry",

          "workflow:revision",

          "workflow:forced-approval",

          "workflow:completed",

          "workflow:failed",

          "workflow:error",
        ];

        const listeners =
          events.map((eventName) => {

            const handler =
              (payload: any) => {

                safeSend({

                  event:
                    eventName,

                  payload,
                });
              };

            globalEventBus.on(
              eventName,
              handler
            );

            return {
              eventName,
              handler,
            };
          });

        const heartbeat =
          setInterval(() => {

            if (closed) {
              return;
            }

            try {

              controller.enqueue(

                encoder.encode(
                  `: heartbeat\n\n`
                )
              );

            } catch {

              closed = true;
            }

          }, 15000);

        return () => {

          closed = true;

          clearInterval(
            heartbeat
          );

          listeners.forEach(

            ({
              eventName,
              handler,
            }) => {

              globalEventBus.off(
                eventName,
                handler
              );
            }
          );
        };
      },
    });

  return new Response(stream, {

    headers: {

      "Content-Type":
        "text/event-stream",

      "Cache-Control":
        "no-cache",

      Connection:
        "keep-alive",
    },
  });
}
