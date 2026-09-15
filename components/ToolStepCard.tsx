import type { ToolStep } from "@/lib/chat/types";

type ToolStepCardProps = {
  step: ToolStep;
};

function statusLabel(step: ToolStep): string {
  if (step.state === "pending") return "Running";
  if (step.state === "done") return "Done";
  return "Error";
}

function statusClass(step: ToolStep): string {
  if (step.state === "pending") return "bg-amber-500/15 text-amber-300";
  if (step.state === "done") return "bg-emerald-500/15 text-emerald-300";
  return "bg-red-500/15 text-red-300";
}

export function ToolStepCard({ step }: ToolStepCardProps) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{step.name}</p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {step.name === "syncVenues"
              ? `venueGroup: ${step.args.venueGroup || "…"}`
              : `target: ${step.args.target || "…"}`}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(step)}`}>
          {statusLabel(step)}
        </span>
      </div>

      {step.state === "done" && step.name === "syncVenues" && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div>
            <dt className="text-zinc-600">syncId</dt>
            <dd className="font-mono text-zinc-300">{step.result.syncId}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">synced</dt>
            <dd>{step.result.syncedCount} venues</dd>
          </div>
        </dl>
      )}

      {step.state === "done" && step.name === "deliverWebhook" && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div>
            <dt className="text-zinc-600">deliveryId</dt>
            <dd className="font-mono text-zinc-300">{step.result.deliveryId}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">status</dt>
            <dd>{step.result.statusCode}</dd>
          </div>
        </dl>
      )}

      {step.state === "error" && (
        <p className="mt-3 text-xs text-red-300">{step.error}</p>
      )}
    </article>
  );
}
