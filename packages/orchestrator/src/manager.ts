import {
  MasterState,
  WorkerRequest,
} from "@repo/schemas";

import {
  WorkflowEngine,
} from "./workflow-engine";

import {
  RetryEngine,
} from "./retry-engine";

import {
  CircuitBreaker,
} from "./circuit-breaker";

import {
  globalEventBus,
} from "./event-emitter";

import {
  WorkerRegistry,
} from "@repo/workers";

export class Manager {

  private workflowEngine =
    new WorkflowEngine();

  private registry =
    new WorkerRegistry();

  private retryEngine =
    new RetryEngine();

  private breaker =
    new CircuitBreaker();

  private getWorkerForStage(
    stage: string
  ) {

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

  private getNextStage(
    stage: string
  ) {

    switch (stage) {

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
        return "COMPLETED";
    }
  }

  async run(
    state: MasterState
  ) {

    let currentState = state;

    let shouldAdvanceStage =
      true;

    try {

      while (
        currentState.currentStage !==
        "COMPLETED"
      ) {

        this.breaker
          .assertNotTripped(
            currentState
          );

        // =========================
        // STAGE TRANSITION
        // =========================

        if (shouldAdvanceStage) {

          const nextStage =
            this.getNextStage(
              currentState.currentStage
            );

          currentState =
            this.workflowEngine
              .transitionStage(
                currentState,
                nextStage
              );

          globalEventBus.emit(
            "workflow:stage",

            {
              workflowId:
                currentState.workflowId,

              stage:
                currentState.currentStage,
            }
          );
        }

        shouldAdvanceStage =
          true;

        // =========================
        // COMPLETION CHECK
        // =========================

        if (
          currentState.currentStage ===
          "COMPLETED"
        ) {

          break;
        }

        // =========================
        // WORKER RESOLUTION
        // =========================

        const workerName =
          this.getWorkerForStage(
            currentState.currentStage
          );

        if (!workerName) {
          continue;
        }

        globalEventBus.emit(
          "worker:start",

          {
            workflowId:
              currentState.workflowId,

            worker:
              workerName,
          }
        );

        const worker =
          this.registry.getWorker(
            workerName
          );

        const request:
          WorkerRequest = {

          workflowId:
            currentState.workflowId,

          worker:
            workerName,

          input:
            currentState.workerOutputs || {},

          metadata: {
            retryCount:
              currentState.revisionCount,

            timestamp:
              new Date(),
          },
        };

        const response =
          await worker.execute(
            request
          );

        globalEventBus.emit(
          "worker:complete",

          {
            workflowId:
              currentState.workflowId,

            worker:
              workerName,

            success:
              response.success,
          }
        );

        // =========================
        // FAILURE HANDLING
        // =========================

        if (!response.success) {

          const canRetry =
            this.retryEngine
              .canRetry(
                currentState
                  .revisionCount
              );

          if (!canRetry) {

            currentState = {
              ...currentState,

              currentStage:
                "FAILED",

              status:
                "ERROR",

              errors: [
                ...currentState.errors,

                ...response.errors,
              ],

              updatedAt:
                new Date(),
            };

            globalEventBus.emit(
              "workflow:failed",

              {
                workflowId:
                  currentState.workflowId,

                errors:
                  response.errors,
              }
            );

            break;
          }

          currentState = {
            ...currentState,

            revisionCount:
              this.retryEngine
                .increment(
                  currentState
                    .revisionCount
                ),

            updatedAt:
              new Date(),
          };

          globalEventBus.emit(
            "workflow:retry",

            {
              workflowId:
                currentState.workflowId,

              revisionCount:
                currentState
                  .revisionCount,
            }
          );

          // IMPORTANT:
          // Retry same stage again
          // without advancing.

          shouldAdvanceStage =
            false;

          continue;
        }

        // =========================
        // QA REVISION LOOP
        // =========================

        if (
          workerName === "QA"
        ) {

          const approved =
            response.output
              .approved;

          if (!approved) {

            currentState = {
              ...currentState,

              revisionCount:
                currentState
                  .revisionCount + 1,

              updatedAt:
                new Date(),
            };

            globalEventBus.emit(
              "workflow:revision",

              {
                workflowId:
                  currentState.workflowId,

                revisionCount:
                  currentState
                    .revisionCount,
              }
            );

            currentState =
              this.workflowEngine
                .transitionStage(
                  currentState,
                  "WRITING"
                );

            globalEventBus.emit(
              "workflow:stage",

              {
                workflowId:
                  currentState.workflowId,

                stage:
                  "WRITING",
              }
            );

            shouldAdvanceStage =
              false;

            continue;
          }
        }

        // =========================
        // SUCCESSFUL OUTPUT
        // =========================

        currentState = {
          ...currentState,

          workerOutputs: {
            ...(currentState.workerOutputs || {}),

            [workerName]:
              response.output,
          },

          routeHistory: [
            ...currentState.routeHistory,

            workerName,
          ],

          status:
            "RUNNING",

          updatedAt:
            new Date(),
        };
      }

      // =========================
      // FINAL STATE HANDLING
      // =========================

      if (
        currentState.currentStage ===
        "COMPLETED"
      ) {

        globalEventBus.emit(
          "workflow:completed",

          {
            workflowId:
              currentState.workflowId,
          }
        );

        return {
          ...currentState,

          status:
            "SUCCESS",
        };
      }

      return currentState;

    } catch (error) {

      globalEventBus.emit(
        "workflow:error",

        {
          workflowId:
            currentState.workflowId,

          error:
            error instanceof Error
              ? error.message
              : "Unknown orchestration error",
        }
      );

      return {
        ...currentState,

        currentStage:
          "FAILED",

        status:
          "ERROR",

        errors: [
          ...currentState.errors,

          error instanceof Error
            ? error.message
            : "Unknown orchestration error",
        ],

        updatedAt:
          new Date(),
      };
    }
  }
}