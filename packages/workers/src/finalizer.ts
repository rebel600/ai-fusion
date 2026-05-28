import {
  WorkerRequest,
} from "@repo/schemas";

import { BaseWorker }
from "./base-worker";

export class FinalizerWorker
  extends BaseWorker {

  name = "FINALIZER";

  async execute(
    input: WorkerRequest
  ) {
    try {

      return this.success({
        result: input.input,
      });

    } catch {

      return this.failure([
        "Finalization failed",
      ]);
    }
  }
}