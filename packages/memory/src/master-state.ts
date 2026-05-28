import {
  MasterState,
} from "@repo/schemas";

export function createMasterState(
  workflowId: string,

  prompt: string
): MasterState {

  return {
    workflowId,

    currentStage: "CREATED",

    status: "PENDING",

    revisionCount: 0,

    routeHistory: [],

    workerOutputs: {
      originalPrompt: prompt,
    },

    errors: [],

    createdAt: new Date(),

    updatedAt: new Date(),
  };
}