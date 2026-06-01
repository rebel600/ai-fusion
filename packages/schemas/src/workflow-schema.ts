import { z } from "zod";

export const WorkflowStageSchema = z.enum([
  "CREATED",
  "PROCESSING",
  "WRITING",
  "FORMAT_LOGIC",
  "APPROVALS",
  "FINALIZING",
  "COMPLETED",
  "FAILED",
]);

export const WorkflowStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "ERROR",
]);

export const WorkerOutputSchema = z.record(z.string(), z.any());

export const WorkflowStateSchema = z.object({
  workflowId: z.string(),

  currentStage: WorkflowStageSchema,

  status: WorkflowStatusSchema,

  revisionCount: z.number(),

  routeHistory: z.array(z.string()),

  workerOutputs: WorkerOutputSchema.optional(),

  errors: z.array(z.string()),

  createdAt: z.date(),

  updatedAt: z.date(),
});

export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
