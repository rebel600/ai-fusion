import { WorkerRequest } from "@repo/schemas";

import { BaseWorker } from "./base-worker";

import { sleep } from "./utils";

export class FinalizerWorker extends BaseWorker {
  name = "FINALIZER";

  async execute(input: WorkerRequest) {
    try {
      await sleep(1000);

      return this.success({
        result: input.input,
      });
    } catch {
      return this.failure(["Finalization failed"]);
    }
  }
}
