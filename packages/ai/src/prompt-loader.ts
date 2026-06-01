import fs from "fs";
import path from "path";

function promptCandidates(promptName: string) {
  const fileName = `${promptName}.txt`;

  return [
    path.resolve(process.cwd(), "packages", "ai", "prompts", fileName),
    path.resolve(process.cwd(), "..", "..", "packages", "ai", "prompts", fileName),
    path.resolve(process.cwd(), "prompts", fileName),
    path.resolve(process.cwd(), "..", "prompts", fileName),
  ];
}

export function loadPrompt(promptName: string) {
  const promptPath = promptCandidates(promptName).find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!promptPath) {
    throw new Error(`Prompt file not found: ${promptName}`);
  }

  return fs.readFileSync(promptPath, "utf-8").trim();
}
