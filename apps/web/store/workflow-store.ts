import { create } from "zustand";

export interface WorkflowEvent {
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

  addEvent: (event: { event: string; payload: any }) => void;

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

  addEvent: (event) => {
    set((state) => {
      const newEvent: WorkflowEvent = {
        event: event.event,

        payload: event.payload,

        timestamp: new Date().toLocaleTimeString(),
      };

      const metrics = {
        ...state.metrics,
      };

      if (event.event === "workflow:stage") {
        metrics.totalWorkflows += 1;
      }

      if (event.event === "workflow:retry") {
        metrics.retries += 1;
      }

      if (event.event === "workflow:failed") {
        metrics.failures += 1;
      }

      if (event.event === "workflow:completed") {
        metrics.completed += 1;
      }

      return {
        events: [newEvent, ...state.events],

        currentStage:
          event.event === "workflow:stage"
            ? event.payload.stage
            : state.currentStage,

        metrics,
      };
    });
  },

  clear: () => {
    set({
      events: [],

      currentStage: "CREATED",

      metrics: {
        totalWorkflows: 0,
        retries: 0,
        failures: 0,
        completed: 0,
      },
    });
  },
}));
