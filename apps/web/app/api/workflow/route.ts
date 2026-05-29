import { NextResponse }
from "next/server";

import {
  createMasterState,
} from "@repo/memory";

import {
  Manager,
} from "@repo/orchestrator";

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    const manager =
      new Manager();

    const state =
      createMasterState(
        crypto.randomUUID(),
        body.prompt
      );

    const result =
      await manager.run(state);

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },

      {
        status: 500,
      }
    );
  }
}