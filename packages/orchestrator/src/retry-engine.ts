export class RetryEngine {

  private maxRetries = 3;

  canRetry(
    retryCount: number
  ) {
    return retryCount <
      this.maxRetries;
  }

  increment(
    retryCount: number
  ) {
    return retryCount + 1;
  }

  getMaxRetries() {
    return this.maxRetries;
  }
}