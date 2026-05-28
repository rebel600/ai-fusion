import { WorkerRequest } from "@repo/schemas";

import { BaseWorker } from "./base-worker";

import { sleep } from "./utils";

export class ApprovalWorker extends BaseWorker {
  name = "QA";

  async execute(input: WorkerRequest) {
    try {
      await sleep(1500);

      const approved = Math.random() > 0.3;

      return this.success({
        approved,
      });
    } catch {
      return this.failure(["QA failed"]);
    }
  }
}
