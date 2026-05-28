import fs from "fs";

import path from "path";

export function loadPrompt(
  fileName: string
) {
  const filePath = path.join(
    process.cwd(),
    "packages",
    "ai",
    "prompts",
    fileName
  );

  return fs.readFileSync(
    filePath,
    "utf-8"
  );
}