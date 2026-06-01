import {
  WorkflowStage,
} from "@repo/schemas";

export class Router {

  getNextStage(
    currentStage: WorkflowStage
  ): WorkflowStage {

    switch (currentStage) {

      case "CREATED":
        return "PROCESSING";

      case "PROCESSING":
        return "WRITING";

      case "WRITING":
        return "FORMAT_LOGIC";

      case "FORMAT_LOGIC":
        return "APPROVALS";

      case "APPROVALS":
        return "FINALIZING";

      case "FINALIZING":
        return "COMPLETED";

      default:
        return "FAILED";
    }
  }

  getWorkerForStage(
    stage: WorkflowStage
  ) {

    switch (stage) {

      case "PROCESSING":
        return "DATA_PROCESSOR";

      case "WRITING":
        return "WRITER";

      case "FORMAT_LOGIC":
        return "FORMAT_LOGIC";

      case "APPROVALS":
        return "APPROVALS";

      case "FINALIZING":
        return "FINALIZER";

      default:
        throw new Error(
          `No worker mapped for stage: ${stage}`
        );
    }
  }
}
