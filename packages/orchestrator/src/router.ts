import {
  WorkflowStage,
  WorkerName,
} from "@repo/schemas";

export class Router {

  getNextWorker(
    stage: WorkflowStage
  ): WorkerName | null {

    switch (stage) {

      case "PROCESSING":
        return "DATA_PROCESSOR";

      case "WRITING":
        return "WRITER";

      case "QA":
        return "QA";

      case "FINALIZING":
        return "FINALIZER";

      default:
        return null;
    }
  }

  getNextStage(
    current: WorkflowStage
  ): WorkflowStage {

    switch (current) {

      case "CREATED":
        return "PROCESSING";

      case "PROCESSING":
        return "WRITING";

      case "WRITING":
        return "QA";

      case "QA":
        return "FINALIZING";

      case "FINALIZING":
        return "COMPLETED";

      default:
        return current;
    }
  }
}