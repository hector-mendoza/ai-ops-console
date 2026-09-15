"use client";

import { Component, type ReactNode } from "react";

type RunOutputErrorBoundaryProps = {
  children: ReactNode;
};

type RunOutputErrorBoundaryState = {
  error: Error | null;
};

export class RunOutputErrorBoundary extends Component<
  RunOutputErrorBoundaryProps,
  RunOutputErrorBoundaryState
> {
  state: RunOutputErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RunOutputErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <h2 className="text-sm font-semibold text-red-200">Run display error</h2>
          <p className="mt-2 text-sm text-red-100/90">
            The integration run completed, but the trail or status board could not render. Refresh
            and try again.
          </p>
          <p className="mt-2 font-mono text-xs text-red-200/70">{this.state.error.message}</p>
        </section>
      );
    }

    return this.props.children;
  }
}
