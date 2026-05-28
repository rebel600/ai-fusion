import { WorkerRequest } from "@repo/schemas";

import { BaseWorker } from "./base-worker";

import { sleep } from "./utils";

export class DataProcessorWorker extends BaseWorker {
  name = "DATA_PROCESSOR";

  async execute(input: WorkerRequest) {
    try {
      await sleep(1200);

      const processed = input.input.originalPrompt;

      return this.success({
        processedPrompt: processed,
      });
    } catch {
      return this.failure(["Data processing failed"]);
    }
  }
}
