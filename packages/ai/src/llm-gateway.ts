import { generateGeminiText } from "./gemini";
import { generateOllamaText } from "./ollama";
import { generateOpenAIText } from "./openai";

type GenerateTextParams = {
  systemPrompt: string;

  userPrompt: string;
};

const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown) {
  const value = error as {
    status?: number;
    code?: string;
    message?: string;
  };

  return (
    value?.status === 429 ||
    value?.status === 500 ||
    value?.status === 502 ||
    value?.status === 503 ||
    value?.status === 504 ||
    value?.message?.includes("429") ||
    value?.code === "ETIMEDOUT" ||
    value?.code === "ECONNRESET"
  );
}

function getProvider() {
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "ollama";
}

export async function generateText(
  params: GenerateTextParams,
): Promise<string> {
  const provider = getProvider();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      if (provider === "gemini") {
        return await generateGeminiText(params);
      }

      if (provider === "openai") {
        const response = await generateOpenAIText(params);

        if (!response) {
          throw new Error("OpenAI returned an empty response");
        }

        return response;
      }

      return await generateOllamaText(params);
    } catch (error) {
      const finalAttempt = attempt === MAX_RETRIES - 1;

      if (!isRetryable(error) || finalAttempt) {
        throw error;
      }

      await sleep(1000 * Math.pow(2, attempt + 1));
    }
  }

  throw new Error("LLM generation failed after retries");
}
