export type SyncVenuesArgs = {
  venueGroup: string;
  dryRun?: boolean;
};

export type DeliverWebhookArgs = {
  syncId: string;
  target: string;
};

export type SyncResult = {
  syncId: string;
  venueGroup: string;
  syncedCount: number;
  dryRun: boolean;
  finishedAt: string;
};

export type WebhookResult = {
  deliveryId: string;
  syncId: string;
  target: string;
  statusCode: 200 | 202 | 500;
  deliveredAt: string;
};

export type ToolStep =
  | { id: string; name: "syncVenues"; args: SyncVenuesArgs; state: "pending" }
  | {
      id: string;
      name: "syncVenues";
      args: SyncVenuesArgs;
      state: "done";
      result: SyncResult;
    }
  | {
      id: string;
      name: "syncVenues";
      args: SyncVenuesArgs;
      state: "error";
      error: string;
    }
  | { id: string; name: "deliverWebhook"; args: DeliverWebhookArgs; state: "pending" }
  | {
      id: string;
      name: "deliverWebhook";
      args: DeliverWebhookArgs;
      state: "done";
      result: WebhookResult;
    }
  | {
      id: string;
      name: "deliverWebhook";
      args: DeliverWebhookArgs;
      state: "error";
      error: string;
    };

export type BoardRow =
  | { id: string; kind: "sync"; label: string; state: "pending" }
  | { id: string; kind: "sync"; label: string; state: "done"; detail: SyncResult }
  | { id: string; kind: "sync"; label: string; state: "error"; error: string }
  | { id: string; kind: "webhook"; label: string; state: "pending" }
  | {
      id: string;
      kind: "webhook";
      label: string;
      state: "done";
      detail: WebhookResult;
    }
  | { id: string; kind: "webhook"; label: string; state: "error"; error: string };

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type PostChatBody = { messages: ChatMessage[] };
