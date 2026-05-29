import { create } from "zustand";

interface WorkflowEvent {
  event: string;

  payload: any;

  timestamp: string;
}

interface WorkflowMetrics {
  totalWorkflows: number;

  retries: number;

  failures: number;

  completed: number;
}

interface WorkflowStore {
  events: WorkflowEvent[];

  currentStage: string;

  metrics: WorkflowMetrics;

  addEvent: (event: Omit<WorkflowEvent, "timestamp">) => void;

  clear: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  events: [],

  currentStage: "CREATED",

  metrics: {
    totalWorkflows: 0,

    retries: 0,

    failures: 0,

    completed: 0,
  },

  addEvent: (event) =>
    set((state) => {
      const timestamp = new Date().toLocaleTimeString();

      const updatedMetrics = {
        ...state.metrics,
      };

      if (
        event.event === "workflow:stage" &&
        event.payload.stage === "PROCESSING"
      ) {
        updatedMetrics.totalWorkflows += 1;
      }

      if (event.event === "workflow:retry") {
        updatedMetrics.retries += 1;
      }

      if (event.event === "workflow:failed") {
        updatedMetrics.failures += 1;
      }

      if (event.event === "workflow:completed") {
        updatedMetrics.completed += 1;
      }

      return {
        events: [
          ...state.events,

          {
            ...event,
            timestamp,
          },
        ],

        currentStage:
          event.event === "workflow:stage"
            ? event.payload.stage
            : state.currentStage,

        metrics: updatedMetrics,
      };
    }),

  clear: () =>
    set({
      events: [],

      currentStage: "CREATED",

      metrics: {
        totalWorkflows: 0,

        retries: 0,

        failures: 0,

        completed: 0,
      },
    }),
}));
