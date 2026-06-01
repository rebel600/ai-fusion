import ollama from "ollama";

type GenerateTextParams = {
  systemPrompt: string;

  userPrompt: string;
};

export async function generateOllamaText(
  params: GenerateTextParams,
) {

  const response =
    await ollama.chat({
      model:
        "qwen2.5-coder:7b",

      messages: [
        {
          role: "system",

          content:
            params.systemPrompt,
        },

        {
          role: "user",

          content:
            params.userPrompt,
        },
      ],
    });

  return (
    response.message.content || ""
  );
}
