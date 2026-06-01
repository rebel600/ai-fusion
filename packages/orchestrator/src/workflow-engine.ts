import { WorkflowState, WorkflowStage } from "@repo/schemas";

export class WorkflowEngine {
  transitionStage(state: WorkflowState, stage: WorkflowStage): WorkflowState {
    return {
      ...state,

      currentStage: stage,

      status:
        stage === "COMPLETED"
          ? "SUCCESS"
          : stage === "FAILED"
            ? "ERROR"
            : "RUNNING",

      updatedAt: new Date(),
    };
  }
}
