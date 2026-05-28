import {
  MasterState,
  WorkerRequest,
} from "@repo/schemas";

import {
  WorkflowEngine,
} from "./workflow-engine";

import {
  Router,
} from "./router";

import {
  RetryEngine,
} from "./retry-engine";

import {
  CircuitBreaker,
} from "./circuit-breaker";

import {
  EventEmitter,
} from "./event-emitter";

import {
  WorkerRegistry,
} from "@repo/workers";

export class Manager {

  private workflowEngine =
    new WorkflowEngine();

  private router =
    new Router();

  private registry =
    new WorkerRegistry();

  private retryEngine =
    new RetryEngine();

  private breaker =
    new CircuitBreaker();

  private events =
    new EventEmitter();

  getEventEmitter() {
    return this.events;
  }

  async run(
    state: MasterState
  ) {

    let currentState = state;

    try {

      while (
        currentState.currentStage !==
        "COMPLETED"
      ) {

        this.breaker
          .assertNotTripped(
            currentState
          );

        const nextStage =
          this.router.getNextStage(
            currentState.currentStage
          );

        currentState =
          this.workflowEngine
            .transitionStage(
              currentState,
              nextStage
            );

        this.events.emit(
          "workflow:stage",

          {
            workflowId:
              currentState.workflowId,

            stage:
              currentState.currentStage,
          }
        );

        const workerName =
          this.router.getNextWorker(
            currentState.currentStage
          );

        if (!workerName) {
          continue;
        }

        this.events.emit(
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

        this.events.emit(
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

            this.events.emit(
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

          this.events.emit(
            "workflow:retry",

            {
              workflowId:
                currentState.workflowId,

              revisionCount:
                currentState
                  .revisionCount,
            }
          );

          continue;
        }

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

            this.events.emit(
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

            continue;
          }
        }

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

      this.events.emit(
        "workflow:completed",

        {
          workflowId:
            currentState.workflowId,
        }
      );

      return {
        ...currentState,

        status: "SUCCESS",
      };

    } catch (error) {

      this.events.emit(
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