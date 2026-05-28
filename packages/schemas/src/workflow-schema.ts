import { z } from "zod";

export const WorkflowStageSchema = z.enum([
  "CREATED",
  "PROCESSING",
  "WRITING",
  "QA",
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

export const WorkflowSchema = z.object({
  workflowId: z.string(),
  userPrompt: z.string(),

  stage: WorkflowStageSchema,
  status: WorkflowStatusSchema,

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Workflow =
  z.infer<typeof WorkflowSchema>;

export type WorkflowStage =
  z.infer<typeof WorkflowStageSchema>;

export type WorkflowStatus =
  z.infer<typeof WorkflowStatusSchema>;