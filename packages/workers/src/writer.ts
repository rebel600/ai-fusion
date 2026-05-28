import {
  WorkerRequest,
} from "@repo/schemas";

import {
  LLMGateway,
} from "@repo/ai";

import {
  BaseWorker,
} from "./base-worker";

export class WriterWorker
  extends BaseWorker {

  name = "WRITER";

  private llm =
    new LLMGateway();

  async execute(
    input: WorkerRequest
  ) {
    try {

      const prompt =
        `Write content about: ${input.input.processedPrompt}`;

      const content =
        await this.llm.generate(
          "openai",
          prompt
        );

      return this.success({
        content,
      });

    } catch {

      return this.failure([
        "Writer failed",
      ]);
    }
  }
}