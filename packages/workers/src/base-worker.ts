import {
  WorkerRequest,
  WorkerResponse,
} from "@repo/schemas";

export abstract class BaseWorker {
  abstract name: string;

  abstract execute(
    input: WorkerRequest
  ): Promise<WorkerResponse>;

  protected success(
    output: Record<string, any>
  ): WorkerResponse {
    return {
      worker: this.name as any,

      status: "SUCCESS",

      success: true,

      output,

      errors: [],

      metadata: {
        latencyMs: 0,
      },
    };
  }

  protected failure(
    errors: string[]
  ): WorkerResponse {
    return {
      worker: this.name as any,

      status: "FAILED",

      success: false,

      output: {},

      errors,

      metadata: {
        latencyMs: 0,
      },
    };
  }
}
