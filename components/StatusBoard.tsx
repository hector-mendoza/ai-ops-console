import type { BoardRow } from "@/lib/chat/types";

type StatusBoardProps = {
  rows: BoardRow[];
};

function rowBadge(row: BoardRow): string {
  if (row.state === "pending") return "Pending";
  if (row.state === "done") return "Complete";
  return "Failed";
}

function rowBadgeClass(row: BoardRow): string {
  if (row.state === "pending") return "text-amber-300";
  if (row.state === "done") return "text-emerald-300";
  return "text-red-300";
}

export function StatusBoard({ rows }: StatusBoardProps) {
  return (
    <section className="flex h-full min-h-[320px] flex-col rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">Status board</h2>
        <p className="text-xs text-zinc-500">Live integration run state</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-600">Board rows appear when a run starts.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-600">{row.kind}</p>
                  <p className="mt-1 text-sm text-zinc-100">{row.label}</p>
                  {row.state === "done" && row.kind === "sync" && row.detail && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.detail.syncedCount ?? 0} venues ·{" "}
                      {row.detail.dryRun ? "dry run" : "live"}
                    </p>
                  )}
                  {row.state === "done" && row.kind === "webhook" && row.detail && (
                    <p className="mt-1 text-xs text-zinc-500">HTTP {row.detail.statusCode ?? "—"}</p>
                  )}
                  {row.state === "error" && (
                    <p className="mt-1 text-xs text-red-300">{row.error}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold ${rowBadgeClass(row)}`}>
                  {rowBadge(row)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
