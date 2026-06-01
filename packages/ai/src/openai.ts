import OpenAI from "openai";

type GenerateParams = {
  systemPrompt: string;

  userPrompt: string;
};

function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI provider not configured");
  }

  return new OpenAI({
    apiKey,
  });
}

export async function generateOpenAIText(
  params: GenerateParams,
): Promise<string | null> {
  const response = await createClient().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",

    temperature: 0.2,

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",

        content: params.systemPrompt,
      },

      {
        role: "user",

        content: params.userPrompt,
      },
    ],
  });

  return response.choices[0].message.content;
}
