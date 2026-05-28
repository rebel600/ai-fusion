import {
  MasterState,
} from "@repo/schemas";

export class StateManager {
  private workflows =
    new Map<string, MasterState>();

  save(
    state: MasterState
  ) {
    this.workflows.set(
      state.workflowId,
      state
    );
  }

  get(
    workflowId: string
  ) {
    return this.workflows.get(
      workflowId
    );
  }

  update(
    state: MasterState
  ) {
    this.workflows.set(
      state.workflowId,
      state
    );
  }

  getAll() {
    return Array.from(
      this.workflows.values()
    );
  }
}