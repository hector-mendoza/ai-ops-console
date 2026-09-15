"use client";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function Composer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Sync coastal resorts and notify the partner events hub…",
}: ComposerProps) {
  return (
    <form
      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Ops ask
      </label>
      <div className="mt-2 flex gap-3">
        <input
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-emerald-500/40 placeholder:text-zinc-600 focus:ring-2"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <button
          className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || value.trim().length === 0}
          type="submit"
        >
          Run
        </button>
      </div>
    </form>
  );
}
