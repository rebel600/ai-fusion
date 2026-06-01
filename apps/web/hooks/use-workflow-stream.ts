"use client";

import { useEffect, useState } from "react";

export interface WorkflowEvent {
  event: string;
  payload: any;
  timestamp: string;
}

export function useWorkflowStream() {

  const [events, setEvents] =
    useState<WorkflowEvent[]>([]);

  const [currentStage, setCurrentStage] =
    useState("CREATED");

  useEffect(() => {

    const source =
      new EventSource(
        "/api/stream"
      );

    source.onopen = () => {

      console.log(
        "SSE CONNECTED"
      );
    };

    source.onmessage = (
      event
    ) => {

      try {

        const parsed =
          JSON.parse(
            event.data
          );

        console.log(
          "EVENT RECEIVED:",
          parsed
        );

        const newEvent = {

          ...parsed,

          timestamp:
            new Date()
              .toLocaleTimeString(),
        };

        setEvents((prev) => [
          newEvent,
          ...prev,
        ]);

        if (
          parsed.event ===
          "workflow:stage"
        ) {

          setCurrentStage(
            parsed.payload.stage
          );
        }

      } catch (error) {

        console.error(error);
      }
    };

    return () => {

      source.close();
    };

  }, []);

  return {
    events,
    currentStage,
  };
}