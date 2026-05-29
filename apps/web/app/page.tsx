"use client";

import { useState } from "react";

import { useWorkflowStore } from "@/store/workflow-store";

import {
  useWorkflowStream,
} from "@/hooks/use-workflow-stream";

const stages = [
  "PROCESSING",
  "WRITING",
  "QA",
  "FINALIZING",
  "COMPLETED",
];

function MetricCard({

  label,
  value,

}: {

  label: string;

  value: string | number;

}) {

  return (

    <div
      className="
        border
        border-zinc-800
        rounded-2xl
        p-5
        bg-zinc-950
      "
    >
      <p
        className="
          text-zinc-500
          text-sm
          mb-2
        "
      >
        {label}
      </p>

      <h2
        className="
          text-3xl
          font-bold
          text-white
        "
      >
        {value}
      </h2>
    </div>
  );
}

export default function Home() {

  useWorkflowStream();

  const [prompt, setPrompt] =
    useState(
      "Explain AI orchestration systems"
    );

  const [loading, setLoading] =
    useState(false);

  const {
    events,
    clear,
    currentStage,
    metrics,
  } = useWorkflowStore();

  const startWorkflow =
    async () => {

      try {

        setLoading(true);

        clear();

        const response =
          await fetch(
            "/api/workflow",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                prompt,
              }),
            }
          );

        await response.json();

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  const getEventColor =
    (event: string) => {

      if (
        event.includes("failed")
      ) {
        return "text-red-400";
      }

      if (
        event.includes("retry")
      ) {
        return "text-yellow-400";
      }

      if (
        event.includes("complete")
      ) {
        return "text-green-400";
      }

      if (
        event.includes("start")
      ) {
        return "text-blue-400";
      }

      return "text-purple-400";
    };

  return (

    <main
      className="
        min-h-screen
        bg-black
        text-white
        p-8
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
        "
      >
        <h1
          className="
            text-6xl
            font-bold
            mb-4
          "
        >
          AI Fusion
        </h1>

        <p
          className="
            text-zinc-400
            text-xl
            mb-12
          "
        >
          Real-time multi-agent orchestration system
        </p>

        <div
          className="
            border
            border-zinc-800
            rounded-3xl
            p-6
            mb-8
            bg-zinc-950
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              flex-wrap
            "
          >
            {stages.map(
              (stage, index) => {

                const isActive =
                  currentStage === stage;

                const isCompleted =
                  stages.indexOf(
                    currentStage
                  ) > index;

                return (

                  <div
                    key={stage}
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <div
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        font-semibold
                        transition-all
                        ${
                          isActive
                            ? `
                              border-green-500
                              bg-green-500/10
                              text-green-400
                            `
                            : isCompleted
                            ? `
                              border-blue-500
                              bg-blue-500/10
                              text-blue-400
                            `
                            : `
                              border-zinc-800
                              bg-zinc-900
                              text-zinc-500
                            `
                        }
                      `}
                    >
                      {stage}
                    </div>

                    {index <
                      stages.length - 1 && (
                      <div
                        className="
                          w-8
                          h-[2px]
                          bg-zinc-700
                        "
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-4
            mb-8
          "
        >
          <MetricCard
            label="Workflows"
            value={
              metrics.totalWorkflows
            }
          />

          <MetricCard
            label="Retries"
            value={
              metrics.retries
            }
          />

          <MetricCard
            label="Failures"
            value={
              metrics.failures
            }
          />

          <MetricCard
            label="Completed"
            value={
              metrics.completed
            }
          />
        </div>

        <div
          className="
            border
            border-zinc-800
            rounded-3xl
            p-6
            mb-8
            bg-zinc-950
          "
        >
          <div
            className="
              flex
              gap-4
            "
          >
            <input
              value={prompt}

              onChange={(e) =>
                setPrompt(
                  e.target.value
                )
              }

              className="
                flex-1
                bg-zinc-900
                border
                border-zinc-700
                rounded-xl
                px-6
                py-4
                text-lg
                outline-none
              "
            />

            <button
              onClick={
                startWorkflow
              }

              disabled={loading}

              className="
                bg-white
                text-black
                px-8
                rounded-xl
                font-bold
                hover:bg-zinc-200
                transition-colors
                disabled:opacity-50
              "
            >
              {loading
                ? "Running..."
                : "Start"}
            </button>
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-8
          "
        >
          <div
            className="
              border
              border-zinc-800
              rounded-3xl
              p-8
              bg-zinc-950
              h-[700px]
              overflow-y-auto
            "
          >
            <h2
              className="
                text-4xl
                font-bold
                mb-8
              "
            >
              Live Event Stream
            </h2>

            <div
              className="
                space-y-6
              "
            >
              {events.map(
                (
                  event,
                  index
                ) => (

                  <div
                    key={index}

                    className="
                      bg-zinc-900
                      border
                      border-zinc-800
                      rounded-2xl
                      p-6
                    "
                  >
                    <h3
                      className={`
                        font-bold
                        text-2xl
                        mb-2
                        ${getEventColor(
                          event.event
                        )}
                      `}
                    >
                      {event.event}
                    </h3>

                    <p
                      className="
                        text-xs
                        text-zinc-500
                        mb-4
                      "
                    >
                      {
                        event.timestamp
                      }
                    </p>

                    <pre
                      className="
                        text-sm
                        text-zinc-300
                        overflow-x-auto
                        whitespace-pre-wrap
                      "
                    >
                      {JSON.stringify(
                        event.payload,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )
              )}
            </div>
          </div>

          <div
            className="
              border
              border-zinc-800
              rounded-3xl
              p-8
              bg-zinc-950
            "
          >
            <h2
              className="
                text-4xl
                font-bold
                mb-8
              "
            >
              System Architecture
            </h2>

            <div
              className="
                space-y-4
              "
            >
              {[
                "Workflow Engine",
                "State Machine",
                "Worker Registry",
                "Retry Engine",
                "Circuit Breaker",
                "AI Gateway",
                "SSE Stream",
              ].map((item) => (

                <div
                  key={item}

                  className="
                    border
                    border-zinc-800
                    rounded-2xl
                    p-5
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-2xl
                    "
                  >
                    {item}
                  </span>

                  <span
                    className="
                      text-green-400
                      font-bold
                      text-xl
                    "
                  >
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}