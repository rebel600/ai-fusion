import type { WorkflowStage, WorkflowState } from "@repo/schemas";

export class DecisionEngine {
  getNextStage(state: WorkflowState): WorkflowStage {
    const { currentStage, revisionCount, workerOutputs } = state;

    switch (currentStage) {
      case "CREATED":
        return "PROCESSING";

      case "PROCESSING":
        return "WRITING";

      case "WRITING":
        return "FORMAT_LOGIC";

      case "FORMAT_LOGIC":
        return "APPROVALS";

      case "APPROVALS": {
        const qaOutput = workerOutputs?.APPROVALS as
          | {
              approved?: boolean;
            }
          | undefined;

        if (qaOutput?.approved) {
          return "FINALIZING";
        }

        if (revisionCount >= 3) {
          return "FAILED";
        }

        return "WRITING";
      }

      case "FINALIZING":
        return "COMPLETED";

      default:
        return "FAILED";
    }
  }

  shouldRetry(state: WorkflowState): boolean {
    return state.revisionCount < 3;
  }

  getFailureReason(state: WorkflowState): string {
    if (state.revisionCount >= 3) {
      return "Retry limit exceeded";
    }

    return "Workflow failed";
  }
}
