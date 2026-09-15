import type { UIMessage } from "ai";
import type {
  BoardRow,
  ChatMessage,
  DeliverWebhookArgs,
  SyncResult,
  SyncVenuesArgs,
  ToolStep,
  WebhookResult,
} from "@/lib/chat/types";
import { getVenueGroup, getWebhookTarget } from "@/lib/data/integrations";

function isToolPart(part: UIMessage["parts"][number]) {
  return part.type === "tool-syncVenues" || part.type === "tool-deliverWebhook";
}

function toolNameFromPart(type: string): "syncVenues" | "deliverWebhook" {
  return type === "tool-syncVenues" ? "syncVenues" : "deliverWebhook";
}

function isSyncResult(value: unknown): value is SyncResult {
  if (typeof value !== "object" || value == null) return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.syncId === "string" &&
    typeof result.venueGroup === "string" &&
    typeof result.syncedCount === "number" &&
    typeof result.dryRun === "boolean" &&
    typeof result.finishedAt === "string"
  );
}

function isWebhookResult(value: unknown): value is WebhookResult {
  if (typeof value !== "object" || value == null) return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.deliveryId === "string" &&
    typeof result.syncId === "string" &&
    typeof result.target === "string" &&
    (result.statusCode === 200 || result.statusCode === 202 || result.statusCode === 500) &&
    typeof result.deliveredAt === "string"
  );
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeSyncVenuesArgs(input: unknown): SyncVenuesArgs {
  const raw =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  return {
    venueGroup: stringField(raw.venueGroup),
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : undefined,
  };
}

function normalizeDeliverWebhookArgs(input: unknown): DeliverWebhookArgs {
  const raw =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  return {
    syncId: stringField(raw.syncId),
    target: stringField(raw.target),
  };
}

export function chatMessagesToModelMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function partsToToolSteps(parts: UIMessage["parts"] | undefined): ToolStep[] {
  return (parts ?? []).filter(isToolPart).map((part, index) => {
    const name = toolNameFromPart(part.type);
    const toolCallId =
      "toolCallId" in part && part.toolCallId ? String(part.toolCallId) : `${name}-${index}`;
    const state = "state" in part ? part.state : "input-streaming";
    const input = "input" in part ? part.input : undefined;
    const output = "output" in part ? part.output : undefined;
    const errorText = "errorText" in part ? part.errorText : undefined;

    if (name === "syncVenues") {
      const args = normalizeSyncVenuesArgs(input);
      if (state === "output-available" && isSyncResult(output)) {
        return {
          id: toolCallId,
          name,
          args,
          state: "done" as const,
          result: output,
        };
      }
      if (state === "output-error") {
        return {
          id: toolCallId,
          name,
          args,
          state: "error" as const,
          error: errorText ?? "Tool failed",
        };
      }
      return { id: toolCallId, name, args, state: "pending" as const };
    }

    const args = normalizeDeliverWebhookArgs(input);
    if (state === "output-available" && isWebhookResult(output)) {
      return {
        id: toolCallId,
        name,
        args,
        state: "done" as const,
        result: output,
      };
    }
    if (state === "output-error") {
      return {
        id: toolCallId,
        name,
        args,
        state: "error" as const,
        error: errorText ?? "Tool failed",
      };
    }
    return { id: toolCallId, name, args, state: "pending" as const };
  });
}

export function toolStepsToBoardRows(steps: ToolStep[]): BoardRow[] {
  return steps.map((step) => {
    if (step.name === "syncVenues") {
      const group = getVenueGroup(step.args.venueGroup);
      const label = group
        ? `Sync · ${group.label}`
        : `Sync · ${step.args.venueGroup || "…"}`;

      if (step.state === "pending") {
        return { id: step.id, kind: "sync", label, state: "pending" };
      }
      if (step.state === "done") {
        return { id: step.id, kind: "sync", label, state: "done", detail: step.result };
      }
      return { id: step.id, kind: "sync", label, state: "error", error: step.error };
    }

    const target = getWebhookTarget(step.args.target);
    const label = target
      ? `Webhook · ${target.label}`
      : `Webhook · ${step.args.target || "…"}`;

    if (step.state === "pending") {
      return { id: step.id, kind: "webhook", label, state: "pending" };
    }
    if (step.state === "done") {
      return { id: step.id, kind: "webhook", label, state: "done", detail: step.result };
    }
    return { id: step.id, kind: "webhook", label, state: "error", error: step.error };
  });
}

export function extractAnswerText(parts: UIMessage["parts"] | undefined): string {
  return (parts ?? [])
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

export function uiMessagesToChatMessages(messages: UIMessage[]): ChatMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join(""),
    }))
    .filter((message) => message.content.length > 0);
}
