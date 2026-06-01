"use client";

import {
  Activity,
  CheckCircle2,
  Clock3,
  Cpu,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Workflow,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const statusStyles: Record<string, string> = {
  SUCCESS:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

  RUNNING:
    "border-blue-500/30 bg-blue-500/10 text-blue-300",

  RETRYING:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",

  FAILED:
    "border-red-500/30 bg-red-500/10 text-red-300",

  CIRCUIT_BREAKER:
    "border-purple-500/30 bg-purple-500/10 text-purple-300",
};

export default function HomePage() {
  const [prompt, setPrompt] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [workflow, setWorkflow] =
    useState<any>(null);

  const [events, setEvents] =
    useState<any[]>([]);

  const [liveStatus, setLiveStatus] =
    useState("IDLE");

  const eventEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    const source =
      new EventSource(
        "/api/stream",
      );

    source.onmessage = (
      event,
    ) => {
      try {
        const parsed =
          JSON.parse(event.data);

        const timestamp =
          new Date().toLocaleTimeString();

        setEvents((prev) => [
          ...prev,

          {
            ...parsed,
            timestamp,
          },
        ]);

        if (
          parsed.event ===
          "workflow:stage"
        ) {
          setLiveStatus(
            parsed.payload
              ?.stage ||
              "RUNNING",
          );
        }

        if (
          parsed.event ===
          "workflow:revision"
        ) {
          setLiveStatus(
            "RETRYING",
          );
        }

        if (
          parsed.event ===
          "workflow:circuit-breaker"
        ) {
          setLiveStatus(
            "CIRCUIT_BREAKER",
          );
        }

        if (
          parsed.event ===
          "workflow:completed"
        ) {
          setLiveStatus(
            "SUCCESS",
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      source.close();
    };
  }, []);

  useEffect(() => {
    eventEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      },
    );
  }, [events]);

  const executionMetrics =
    workflow?.workerOutputs
      ?.SYSTEM;

  const routeHistory =
    workflow?.routeHistory || [];

  const uniqueStages =
    useMemo(() => {
      return routeHistory.map(
        (
          stage: string,
          index: number,
        ) => ({
          stage,
          index,
        }),
      );
    }, [routeHistory]);

  async function runWorkflow() {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);

    setWorkflow(null);

    setEvents([]);

    setLiveStatus("RUNNING");

    try {
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
          },
        );

      const data =
        await response.json();

      setWorkflow(
        data.result,
      );

      setLiveStatus(
        data.result?.status ||
          "SUCCESS",
      );
    } catch (error) {
      console.error(error);

      setLiveStatus(
        "FAILED",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
              <Workflow className="h-4 w-4" />
              AI Orchestration Control Plane
            </div>

            <h1 className="text-5xl font-black tracking-tight">
              Agentic AI Workflow
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-zinc-400">
              Real-time orchestration engine with autonomous retries,
              circuit breaker protection, workflow routing,
              and live event streaming.
            </p>
          </div>

          <div
            className={`rounded-2xl border px-5 py-4 ${statusStyles[liveStatus] || statusStyles.RUNNING}`}
          >
            <p className="text-sm uppercase tracking-widest">
              System Status
            </p>

            <div className="mt-2 flex items-center gap-3 text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : liveStatus ===
                "SUCCESS" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : liveStatus ===
                "FAILED" ? (
                <XCircle className="h-6 w-6" />
              ) : liveStatus ===
                "RETRYING" ? (
                <RefreshCcw className="h-6 w-6" />
              ) : liveStatus ===
                "CIRCUIT_BREAKER" ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <Activity className="h-6 w-6" />
              )}

              {liveStatus}
            </div>
          </div>
        </div>

        <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row">
            <textarea
              value={prompt}
              onChange={(e) =>
                setPrompt(
                  e.target.value,
                )
              }
              placeholder="Explain Agentic AI and orchestration systems..."
              className="min-h-[140px] flex-1 rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-100 outline-none transition focus:border-zinc-600"
            />

            <button
              onClick={runWorkflow}
              disabled={loading}
              className="flex h-[140px] w-full items-center justify-center gap-3 rounded-2xl bg-white px-8 text-lg font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:w-[220px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Execute Workflow
                </>
              )}
            </button>
          </div>
        </div>

        {workflow && (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Workflow Status"
                value={workflow.status}
                icon={<Activity className="h-5 w-5" />}
              />

              <MetricCard
                title="Execution Time"
                value={`${executionMetrics?.executionTimeSeconds || "0"}s`}
                icon={<Clock3 className="h-5 w-5" />}
              />

              <MetricCard
                title="Retry Count"
                value={workflow.revisionCount}
                icon={<RefreshCcw className="h-5 w-5" />}
              />

              <MetricCard
                title="Workers Executed"
                value={workflow.routeHistory?.length || 0}
                icon={<Cpu className="h-5 w-5" />}
              />
            </div>

            {workflow.status ===
              "CIRCUIT_BREAKER" && (
              <div className="mb-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">
                <div className="flex items-start gap-4">
                  <ShieldAlert className="mt-1 h-8 w-8 text-purple-300" />

                  <div>
                    <h2 className="text-2xl font-bold text-purple-200">
                      Circuit Breaker Activated
                    </h2>

                    <p className="mt-2 text-zinc-300">
                      Maximum retry threshold exceeded.
                      Workflow terminated safely to avoid infinite orchestration loop.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
              <h2 className="mb-6 text-2xl font-bold">
                Workflow Timeline
              </h2>

              <div className="flex flex-wrap items-center gap-4">
                {uniqueStages.map(
                  (
                    item: any,
                    index: number,
                  ) => (
                    <div
                      key={`${item.stage}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="rounded-2xl border border-zinc-800 bg-black px-5 py-3">
                        <div className="text-xs text-zinc-500">
                          STAGE
                        </div>

                        <div className="mt-1 font-bold">
                          {item.stage}
                        </div>
                      </div>

                      {index !==
                        uniqueStages.length -
                          1 && (
                        <div className="h-[2px] w-12 bg-zinc-700" />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mb-8 grid gap-6 xl:grid-cols-2">
              <WorkerCard
                title="DATA_PROCESSOR"
                data={
                  workflow
                    ?.workerOutputs
                    ?.DATA_PROCESSOR
                }
              />

              <WorkerCard
                title="WRITER"
                data={
                  workflow
                    ?.workerOutputs
                    ?.WRITER
                }
              />

              <WorkerCard
                title="FORMAT_LOGIC"
                data={
                  workflow
                    ?.workerOutputs
                    ?.FORMAT_LOGIC
                }
              />

              <WorkerCard
                title="QA"
                data={
                  workflow
                    ?.workerOutputs
                    ?.QA
                }
              />
            </div>

            <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
              <h2 className="mb-5 text-2xl font-bold">
                Final Output
              </h2>

              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <h3 className="text-3xl font-black">
                  {
                    workflow
                      ?.workerOutputs
                      ?.FINALIZER
                      ?.finalOutput
                      ?.title
                  }
                </h3>

                <p className="mt-6 whitespace-pre-wrap text-zinc-300">
                  {
                    workflow
                      ?.workerOutputs
                      ?.FINALIZER
                      ?.finalOutput
                      ?.content
                  }
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Live Event Stream
                </h2>

                <span className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">
                  {events.length} events
                </span>
              </div>

              <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
                {events.map(
                  (
                    event,
                    index,
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-4"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {event.event}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {JSON.stringify(
                            event.payload,
                          )}
                        </p>
                      </div>

                      <div className="text-xs text-zinc-500">
                        {event.timestamp}
                      </div>
                    </div>
                  ),
                )}

                <div ref={eventEndRef} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <h3 className="mt-3 text-4xl font-black">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black p-3 text-zinc-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkerCard({
  title,
  data,
}: any) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6">
      <h2 className="mb-5 text-xl font-bold">
        {title}
      </h2>

      <div className="overflow-auto rounded-2xl border border-zinc-800 bg-black p-4">
        <pre className="whitespace-pre-wrap text-sm text-zinc-300">
          {JSON.stringify(
            data,
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

