import {
  WorkflowStage,
} from "@repo/schemas";

const validTransitions: Record<
  WorkflowStage,
  WorkflowStage[]
> = {
  CREATED: ["PROCESSING"],

  PROCESSING: ["WRITING"],

  WRITING: ["FORMAT_LOGIC"],

  FORMAT_LOGIC: ["APPROVALS"],

  APPROVALS: [
    "FINALIZING",
    "WRITING",
    "FAILED",
  ],

  FINALIZING: ["COMPLETED"],

  COMPLETED: [],

  FAILED: [],
};

export class StateMachine {
  canTransition(
    current: WorkflowStage,
    next: WorkflowStage
  ) {
    return validTransitions[current].includes(next);
  }

  assertTransition(
    current: WorkflowStage,
    next: WorkflowStage
  ) {
    const valid =
      this.canTransition(current, next);

    if (!valid) {
      throw new Error(
        `Invalid transition: ${current} -> ${next}`
      );
    }
  }
}
