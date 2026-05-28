import { z } from "zod";

import {
  WorkflowStageSchema,
  WorkflowStatusSchema,
} from "./workflow-schema";

export const MasterStateSchema = z.object({
  workflowId: z.string(),

  currentStage: WorkflowStageSchema,

  status: WorkflowStatusSchema,

  revisionCount: z.number(),

  routeHistory: z.array(z.string()),

  workerOutputs: z.record(z.string(), z.any()),

  errors: z.array(z.string()),

  createdAt: z.date(),

  updatedAt: z.date(),
});

export type MasterState =
  z.infer<typeof MasterStateSchema>;