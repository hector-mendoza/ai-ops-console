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

export function chatMessagesToModelMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function partsToToolSteps(parts: UIMessage["parts"]): ToolStep[] {
  return parts.filter(isToolPart).map((part, index) => {
    const name = toolNameFromPart(part.type);
    const toolCallId =
      "toolCallId" in part && part.toolCallId ? String(part.toolCallId) : `${name}-${index}`;
    const state = "state" in part ? part.state : "input-streaming";
    const input = "input" in part ? part.input : undefined;
    const output = "output" in part ? part.output : undefined;
    const errorText = "errorText" in part ? part.errorText : undefined;

    if (name === "syncVenues") {
      const args = (input ?? { venueGroup: "" }) as SyncVenuesArgs;
      if (state === "output-available" && output != null) {
        return {
          id: toolCallId,
          name,
          args,
          state: "done" as const,
          result: output as SyncResult,
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

    const args = (input ?? { syncId: "", target: "" }) as DeliverWebhookArgs;
    if (state === "output-available" && output != null) {
      return {
        id: toolCallId,
        name,
        args,
        state: "done" as const,
        result: output as WebhookResult,
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

export function extractAnswerText(parts: UIMessage["parts"]): string {
  return parts
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
