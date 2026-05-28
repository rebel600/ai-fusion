import {
  OpenAIProvider,
} from "./openai";

import {
  GeminiProvider,
} from "./gemini";

export type Provider =
  "openai" | "gemini";

export class LLMGateway {
  private openai =
    new OpenAIProvider();

  private gemini =
    new GeminiProvider();

  async generate(
    provider: Provider,

    prompt: string
  ) {
    switch (provider) {

      case "openai":
        return this.openai.generate(
          prompt
        );

      case "gemini":
        return this.gemini.generate(
          prompt
        );

      default:
        throw new Error(
          "Invalid provider"
        );
    }
  }
}