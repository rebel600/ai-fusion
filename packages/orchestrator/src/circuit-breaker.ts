export class CircuitBreaker {
  private failureCount = 0;

  private FAILURE_LIMIT = 5;

  recordFailure() {
    this.failureCount++;
  }

  reset() {
    this.failureCount = 0;
  }

  assertNotTripped() {
    if (this.failureCount >= this.FAILURE_LIMIT) {
      throw new Error("Circuit breaker tripped");
    }
  }
}
