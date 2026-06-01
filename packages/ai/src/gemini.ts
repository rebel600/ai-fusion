import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateGeminiText(params: {
  systemPrompt: string;

  userPrompt: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini provider not configured");
  }

  const client = new GoogleGenerativeAI(apiKey);

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
SYSTEM:
${params.systemPrompt}

USER:
${params.userPrompt}
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}
