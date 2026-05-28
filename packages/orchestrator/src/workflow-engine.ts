import {
  MasterState,
  WorkflowStage,
} from "@repo/schemas";

import { StateMachine } from "./state-machine";

export class WorkflowEngine {
  private stateMachine: StateMachine;

  constructor() {
    this.stateMachine =
      new StateMachine();
  }

  transitionStage(
    state: MasterState,
    nextStage: WorkflowStage
  ): MasterState {
    this.stateMachine.assertTransition(
      state.currentStage,
      nextStage
    );

    return {
      ...state,

      currentStage: nextStage,

      updatedAt: new Date(),
    };
  }
}