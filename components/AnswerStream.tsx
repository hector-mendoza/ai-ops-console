type AnswerStreamProps = {
  text: string;
  isStreaming: boolean;
};

export function AnswerStream({ text, isStreaming }: AnswerStreamProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Ops wrap-up</h2>
          <p className="text-xs text-zinc-500">Streamed run summary — not chat bubbles</p>
        </div>
        {isStreaming && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            Streaming
          </span>
        )}
      </div>
      <div className="mt-4 min-h-[4rem] rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3">
        {text ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{text}</p>
        ) : (
          <p className="text-sm text-zinc-600">
            The wrap-up streams here after sync and webhook complete.
          </p>
        )}
      </div>
    </section>
  );
}
