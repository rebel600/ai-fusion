
import {
  generateOllamaText,
} from "@repo/ai";

interface WriterInput {
  processorOutput: any;

  previousDraft?: any;

  qaFeedback?: any;
}

export async function writerWorker(
  input: WriterInput,
) {

  const startedAt =
    Date.now();

  try {

    const prompt = `
You are an expert AI systems writer.

TASK:
${input.processorOutput?.objective}

REQUIREMENTS:
${JSON.stringify(
  input.processorOutput
    ?.requirements || [],
)}

Write a detailed, structured technical explanation.

Do NOT return JSON.
Return only plain text.
`;

    const response =
      await generateOllamaText({
        systemPrompt:
          "You are a technical AI writer.",

        userPrompt:
          prompt,
      });

    return {
      worker: "WRITER",

      status: "SUCCESS",

      success: true,

      output: {
        draft:
          response ||
          "Failed to generate content.",

        summary:
          response?.slice(
            0,
            180,
          ) ||
          "No summary available.",

        revisionApplied:
          Boolean(
            input.qaFeedback,
          ),
      },

      errors: [],

      metadata: {
        latencyMs:
          Date.now() -
          startedAt,

        model:
          "qwen2.5-coder:7b",

        provider:
          "ollama",
      },
    };

  } catch (error) {

    return {
      worker: "WRITER",

      status: "FAILED",

      success: false,

      output: {
        draft:
          "Writer failed to generate content.",

        summary:
          "Writer worker failed.",

        revisionApplied:
          true,
      },

      errors: [
        error instanceof Error
          ? error.message
          : "Unknown writer error",
      ],

      metadata: {
        latencyMs:
          Date.now() -
          startedAt,

        model:
          "qwen2.5-coder:7b",

        provider:
          "ollama",
      },
    };
  }
}
