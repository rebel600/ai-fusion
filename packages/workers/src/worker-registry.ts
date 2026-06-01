import type { WorkerName } from "@repo/schemas";

import { dataProcessorWorker } from "./data-processor";
import { finalizerWorker } from "./finalizer";
import { formatLogicWorker } from "./format-logic";
import { qaWorker } from "./qa";
import { writerWorker } from "./writer";

type WorkerExecutor = (input: any) => Promise<any>;

export class WorkerRegistry {
  private workers: Record<WorkerName, WorkerExecutor> = {
    DATA_PROCESSOR: dataProcessorWorker,
    WRITER: writerWorker,
    FORMAT_LOGIC: formatLogicWorker,
    APPROVALS: qaWorker,
    FINALIZER: finalizerWorker,
  };

  getWorker(name: WorkerName) {
    return this.workers[name];
  }
}
