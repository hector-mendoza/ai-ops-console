import type { ToolStep } from "@/lib/chat/types";
import { ToolStepCard } from "@/components/ToolStepCard";

type ToolTrailProps = {
  steps: ToolStep[];
};

export function ToolTrail({ steps }: ToolTrailProps) {
  return (
    <section className="flex h-full min-h-[320px] flex-col rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">Tool trail</h2>
        <p className="text-xs text-zinc-500">Chained sync → webhook execution</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {steps.length === 0 ? (
          <p className="text-sm text-zinc-600">Tool calls appear here as the run executes.</p>
        ) : (
          steps.map((step) => <ToolStepCard key={step.id} step={step} />)
        )}
      </div>
    </section>
  );
}
