import {
  WorkerName,
} from "@repo/schemas";

import { BaseWorker }
from "./base-worker";

import {
  DataProcessorWorker,
} from "./data-processor";

import {
  WriterWorker,
} from "./writer";

import {
  ApprovalWorker,
} from "./approvals";

import {
  FinalizerWorker,
} from "./finalizer";

export class WorkerRegistry {
  private workers:
    Record<
      WorkerName,
      BaseWorker
    > = {
      DATA_PROCESSOR:
        new DataProcessorWorker(),

      WRITER:
        new WriterWorker(),

      QA:
        new ApprovalWorker(),

      FINALIZER:
        new FinalizerWorker(),
    };

  getWorker(
    name: WorkerName
  ) {
    return this.workers[name];
  }
}