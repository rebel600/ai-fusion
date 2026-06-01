interface FinalizerInput {
  writerOutput: any;

  formattedOutput: any;

  approvalOutput: any;

  qaOutput?: any;

  revisionCount: number;
}

export async function finalizerWorker(input: FinalizerInput) {
  const startedAt = Date.now();

  const formatted = input.formattedOutput?.formattedOutput;
  const approval = input.approvalOutput || {};

  try {
    return {
      worker: "FINALIZER",

      status: "SUCCESS",

      success: true,

      output: {
        finalOutput: {
          title: formatted?.title || "AI Generated Response",

          summary: input.writerOutput?.summary || "No summary generated.",

          content:
            formatted?.body ||
            input.writerOutput?.draft ||
            "No content generated.",

          approved: Boolean(approval.approved),

          forcedAccepted: Boolean(approval.forcedAccepted),

          revisionCount: input.revisionCount,

          workflowStatus: "Finalized",

          generatedAt: new Date().toISOString(),
        },
      },

      errors: [],

      metadata: {
        latencyMs: Date.now() - startedAt,

        model: "system",

        provider: "local",
      },
    };
  } catch (error) {
    return {
      worker: "FINALIZER",

      status: "FAILED",

      success: false,

      output: {
        finalOutput: {
          title: "Finalization failed",

          summary: "Finalization failed.",

          content: "Unable to generate final output.",

          approved: false,

          forcedAccepted: false,

          revisionCount: input.revisionCount,

          workflowStatus: "FAILED",

          generatedAt: new Date().toISOString(),
        },
      },

      errors: [
        error instanceof Error ? error.message : "Unknown finalizer error",
      ],

      metadata: {
        latencyMs: Date.now() - startedAt,

        model: "system",

        provider: "local",
      },
    };
  }
}
