import { z } from "zod";

import { loadPrompt } from "./prompt-loader";

import { generateText } from "./llm-gateway";

type GenerateObjectParams<
  T extends z.ZodTypeAny,
> = {
  promptName: string;

  userInput: string;

  schema: T;
};

function extractJson(
  text: string,
) {
  try {
    return JSON.parse(text);
  } catch {}

  const match =
    text.match(
      /\{[\s\S]*\}/,
    );

  if (!match) {
    throw new Error(
      "No valid JSON found in model response",
    );
  }

  return JSON.parse(
    match[0],
  );
}

export async function generateObject<
  T extends z.ZodTypeAny,
>(
  params: GenerateObjectParams<T>,
): Promise<z.infer<T>> {

  const systemPrompt =
    loadPrompt(
      params.promptName,
    );

  const response =
    await generateText({
      systemPrompt,

      userPrompt:
        params.userInput,
    });

  try {

    const parsed =
      extractJson(
        response,
      );

    return params.schema.parse(
      parsed,
    );

  } catch (error) {

    console.error(
      "MODEL RESPONSE:",
      response,
    );

    throw error;
  }
}
