import { WorkflowState } from "@repo/schemas";

export class RetryEngine {
  private MAX_RETRIES = 3;

  shouldRetry(state: WorkflowState) {
    return state.revisionCount < this.MAX_RETRIES;
  }

  incrementRevision(state: WorkflowState): WorkflowState {
    return {
      ...state,

      revisionCount: state.revisionCount + 1,

      updatedAt: new Date(),
    };
  }

  async wait(attempt: number) {
    const delay = 1000 * Math.pow(2, attempt);

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
