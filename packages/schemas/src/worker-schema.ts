import { z } from "zod";

export const WorkerNameSchema = z.enum([
  "DATA_PROCESSOR",
  "WRITER",
  "QA",
  "FINALIZER",
]);

export const WorkerRequestSchema = z.object({
  workflowId: z.string(),

  worker: WorkerNameSchema,

  input: z.record(z.string(), z.any()),

  metadata: z.object({
    retryCount: z.number(),
    timestamp: z.date(),
  }),
});

export const WorkerResponseSchema = z.object({
  worker: WorkerNameSchema,

  success: z.boolean(),

  output: z.record(z.string(), z.any()),

  errors: z.array(z.string()),

  metadata: z.object({
    latencyMs: z.number(),
    tokensUsed: z.number().optional(),
  }),
});

export type WorkerRequest =
  z.infer<typeof WorkerRequestSchema>;

export type WorkerResponse =
  z.infer<typeof WorkerResponseSchema>;

export type WorkerName =
  z.infer<typeof WorkerNameSchema>;