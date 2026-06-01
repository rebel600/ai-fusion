import { createMasterState } from "@repo/memory";
import { workflowManager } from "@repo/orchestrator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "A non-empty prompt is required.",
        },
        {
          status: 400,
        },
      );
    }

    const state = createMasterState(crypto.randomUUID(), prompt);
    const result = await workflowManager.run(state);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("WORKFLOW API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Workflow execution failed",
      },
      {
        status: 500,
      },
    );
  }
}
