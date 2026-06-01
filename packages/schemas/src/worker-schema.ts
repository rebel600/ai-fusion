import { z } from "zod";

export const WorkerNameSchema = z.enum([
  "DATA_PROCESSOR",

  "WRITER",

  "FORMAT_LOGIC",

  "APPROVALS",

  "FINALIZER",
]);

export const WorkerStatusSchema = z.enum(["SUCCESS", "FAILED", "RETRYING"]);

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

  status: WorkerStatusSchema,

  success: z.boolean(),

  output: z.record(z.string(), z.any()),

  feedback: z.array(z.string()).optional(),

  errors: z.array(z.string()),

  metadata: z.object({
    latencyMs: z.number().optional(),

    tokensUsed: z.number().optional(),

    model: z.string().optional(),

    provider: z.string().optional(),
  }),
});

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;

export type WorkerResponse = z.infer<typeof WorkerResponseSchema>;

export type WorkerName = z.infer<typeof WorkerNameSchema>;

export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;
