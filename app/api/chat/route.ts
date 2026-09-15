import {
  convertToModelMessages,
  stepCountIs as isStepCount,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/model";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import type { PostChatBody } from "@/lib/chat/types";
import { chatMessagesToModelMessages } from "@/lib/chat/ui";
import { deliverWebhook } from "@/lib/tools/deliver-webhook";
import { syncVenues, type SyncStore } from "@/lib/tools/sync-venues";

function isPostChatBody(body: unknown): body is PostChatBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "messages" in body &&
    Array.isArray((body as PostChatBody).messages)
  );
}

function isUIMessageArray(messages: unknown): messages is UIMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        "role" in message &&
        "parts" in message,
    )
  );
}

function buildTools(store: SyncStore) {
  return {
    syncVenues: tool({
      description: "Sync venue inventory for a venue group into the integration layer.",
      inputSchema: z.object({
        venueGroup: z
          .string()
          .min(1)
          .describe("Seed venue group id, e.g. downtown-venues or coastal-resorts"),
        dryRun: z
          .boolean()
          .optional()
          .describe("When true, validate without writing venues"),
      }),
      execute: async (args) => syncVenues(args, store),
    }),
    deliverWebhook: tool({
      description:
        "Deliver a webhook notification for a completed venue sync. syncId must come from syncVenues.",
      inputSchema: z.object({
        syncId: z.string().min(1).describe("syncId returned by syncVenues"),
        target: z
          .string()
          .min(1)
          .describe("Seed webhook target id, e.g. ops-status-board or partner-events-hub"),
      }),
      execute: async (args) => deliverWebhook(args, store),
    }),
  };
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!isPostChatBody(body)) {
    return Response.json({ error: "Expected { messages: ChatMessage[] }" }, { status: 400 });
  }

  const store: SyncStore = new Map();
  const tools = buildTools(store);

  const modelMessages = isUIMessageArray(body.messages)
    ? await convertToModelMessages(body.messages)
    : chatMessagesToModelMessages(body.messages);

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: isStepCount(6),
  });

  return result.toUIMessageStreamResponse();
}
