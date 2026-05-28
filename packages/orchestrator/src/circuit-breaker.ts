import {
  MasterState,
} from "@repo/schemas";

export class CircuitBreaker {

  private maxRouteHistory = 15;

  isTripped(
    state: MasterState
  ) {

    return (
      state.routeHistory.length >=
      this.maxRouteHistory
    );
  }

  assertNotTripped(
    state: MasterState
  ) {

    if (
      this.isTripped(state)
    ) {

      throw new Error(
        "Circuit breaker triggered: workflow exceeded safe execution limit"
      );
    }
  }
}