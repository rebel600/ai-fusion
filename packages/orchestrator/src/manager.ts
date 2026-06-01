import {
  dataProcessorWorker,
  writerWorker,
  formatLogicWorker,
  qaWorker,
  finalizerWorker,
} from "@repo/workers";

import { globalEventBus } from "./event-bus";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class WorkflowManager {
  private events = globalEventBus;

  async run(state: any) {
    const startedAt = Date.now();

    state.status = "RUNNING";

    state.workerOutputs = state.workerOutputs || {};

    state.revisionCount = state.revisionCount || 0;

    try {
      const workflowId = state.workflowId;

      // DATA PROCESSOR

      this.events.emit("workflow:stage", {
        workflowId,

        stage: "DATA_PROCESSOR",
      });

      await sleep(150);

      const dataProcessorResponse = await dataProcessorWorker(
        state.workerOutputs?.originalPrompt,
      );

      state.workerOutputs.DATA_PROCESSOR = dataProcessorResponse.output;

      state.routeHistory.push("DATA_PROCESSOR");

      // WRITER

      this.events.emit("workflow:stage", {
        workflowId,

        stage: "WRITER",
      });

      await sleep(150);

      let writerResponse = await writerWorker({
        processorOutput: state.workerOutputs?.DATA_PROCESSOR,

        previousDraft: state.workerOutputs?.WRITER,

        qaFeedback: state.workerOutputs?.QA,
      });

      state.workerOutputs.WRITER = writerResponse.output;

      state.routeHistory.push("WRITER");

      // FORMAT LOGIC

      this.events.emit("workflow:stage", {
        workflowId,

        stage: "FORMAT_LOGIC",
      });

      await sleep(150);

      const formatResponse = await formatLogicWorker(
        state.workerOutputs?.WRITER,
      );

      state.workerOutputs.FORMAT_LOGIC = formatResponse.output;

      state.routeHistory.push("FORMAT_LOGIC");

      // QA LOOP

      let qaApproved = false;

      let retryCount = 0;

      while (!qaApproved && retryCount < 3) {
        this.events.emit("workflow:stage", {
          workflowId,

          stage: "QA",
        });

        await sleep(150);

        const qaResponse = await qaWorker({
          formattedOutput: state.workerOutputs?.FORMAT_LOGIC,

          revisionCount: retryCount,

          originalPrompt: state.workerOutputs?.originalPrompt,
        });

        state.workerOutputs.QA = qaResponse.output;

        state.routeHistory.push("QA");

        qaApproved = qaResponse.output?.approved;

        if (!qaApproved) {
          this.events.emit("workflow:retry", {
            workflowId,

            retryCount: retryCount + 1,

            reason: qaResponse.output?.feedback || [],
          });

          retryCount++;

          state.revisionCount = retryCount;

          state.status = "RETRYING";

          this.events.emit("workflow:status", {
            workflowId,

            status: "RETRYING",

            retryCount,
          });

          writerResponse = await writerWorker({
            processorOutput: state.workerOutputs?.DATA_PROCESSOR,

            previousDraft: state.workerOutputs?.WRITER,

            qaFeedback: qaResponse.output,
          });

          state.workerOutputs.WRITER = writerResponse.output;

          state.routeHistory.push("WRITER");

          const retryFormatResponse = await formatLogicWorker(
            state.workerOutputs?.WRITER,
          );

          state.workerOutputs.FORMAT_LOGIC = retryFormatResponse.output;

          state.routeHistory.push("FORMAT_LOGIC");
        }
      }

      // CIRCUIT BREAKER

      if (!qaApproved) {
        this.events.emit("workflow:circuit-breaker", {
          workflowId,

          maxRetries: 3,

          strategy: "FAIL_WORKFLOW",
        });

        state.currentStage = "FAILED";

        state.status = "CIRCUIT_BREAKER";

        state.errors.push("QA approval failed after maximum retries.");

        return state;
      }

      // FINALIZER

      this.events.emit("workflow:stage", {
        workflowId,

        stage: "FINALIZER",
      });

      await sleep(150);

      const finalizerResponse = await finalizerWorker({
        writerOutput: state.workerOutputs?.WRITER,

        formattedOutput: state.workerOutputs?.FORMAT_LOGIC,

        approvalOutput: state.workerOutputs?.QA,

        qaOutput: state.workerOutputs?.QA,

        revisionCount: state.revisionCount,
      });

      state.workerOutputs.FINALIZER = finalizerResponse.output;

      state.routeHistory.push("FINALIZER");

      // SYSTEM METRICS

      state.workerOutputs.SYSTEM = {
        executionTimeMs: Date.now() - startedAt,

        executionTimeSeconds: ((Date.now() - startedAt) / 1000).toFixed(2),
      };

      state.currentStage = "COMPLETED";

      state.status = "SUCCESS";

      state.updatedAt = new Date().toISOString();

      this.events.emit("workflow:completed", {
        workflowId,

        state,
      });

      return state;
    } catch (error: any) {
      state.currentStage = "FAILED";

      state.status = "FAILED";

      state.errors.push(error?.message || "Unknown workflow error");

      this.events.emit("workflow:error", {
        workflowId: state.workflowId,

        error: error?.message,
      });

      return state;
    }
  }
}
