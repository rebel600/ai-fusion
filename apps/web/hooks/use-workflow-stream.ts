"use client";

import { useEffect } from "react";

import { useWorkflowStore } from "@/store/workflow-store";

export function useWorkflowStream() {
  const addEvent = useWorkflowStore((s) => s.addEvent);

  useEffect(() => {
    const source = new EventSource("/api/stream");

    source.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      addEvent(parsed);
    };

    return () => {
      source.close();
    };
  }, [addEvent]);
}
