import { z } from "zod";

export const RetryStateSchema = z.object({
  retryCount: z.number(),

  maxRetries: z.number(),

  lastAttemptAt: z.date().nullable(),

  cooldownUntil: z.date().nullable(),
});

export type RetryState =
  z.infer<typeof RetryStateSchema>;