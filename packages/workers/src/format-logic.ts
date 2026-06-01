export async function formatLogicWorker(
  writerOutput: any,
) {

  return {
    success: true,

    output: {
      formattedOutput: {
        title:
          "AI Orchestration Response",

        body:
          writerOutput?.draft ||
          "No content generated.",
      },

      metadata: {
        format:
          "article",

        version: 1,
      },
    },
  };
}

