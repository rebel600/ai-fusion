import {
  WorkerRequest,
} from "@repo/schemas";

import { BaseWorker }
from "./base-worker";

export class DataProcessorWorker
  extends BaseWorker {

  name = "DATA_PROCESSOR";

  async execute(
    input: WorkerRequest
  ) {
    try {
      const processed =
        input.input.prompt;

      return this.success({
        processedPrompt: processed,
      });

    } catch (error) {

      return this.failure([
        "Data processing failed",
      ]);
    }
  }
}