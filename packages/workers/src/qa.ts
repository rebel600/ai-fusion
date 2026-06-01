export async function qaWorker(
  input: any,
) {

  const originalPrompt =
    (
      input.originalPrompt ||
      ""
    ).toLowerCase();

  let approved = true;

  let feedback: string[] =
    [];

  let detectedIssues: string[] =
    [];

  let qualityScore = 95;

  // =====================
  // FORCE RETRY FLOW
  // =====================

  if (
    originalPrompt.includes(
      "force-retry",
    )
  ) {

    if (
      input.revisionCount < 2
    ) {

      approved = false;

      feedback.push(
        "Retry requested by QA system.",
      );

      detectedIssues.push(
        "Quality below threshold.",
      );

      qualityScore = 45;
    }
  }

  // =====================
  // FORCE BREAKER FLOW
  // =====================

  if (
    originalPrompt.includes(
      "force-breaker",
    )
  ) {

    approved = false;

    feedback.push(
      "Critical orchestration failure detected.",
    );

    detectedIssues.push(
      "Repeated validation failure.",
    );

    qualityScore = 0;
  }

  return {
    success: true,

    output: {
      approved,

      feedback,

      detectedIssues,

      qualityScore,
    },
  };
}
