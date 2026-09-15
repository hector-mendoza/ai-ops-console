import {
  getWebhookTarget,
  listWebhookTargetIds,
  resolveWebhookTargetId,
} from "@/lib/data/integrations";
import type { DeliverWebhookArgs, WebhookResult } from "@/lib/chat/types";
import type { SyncStore } from "@/lib/tools/sync-venues";

function makeDeliveryId(target: string): string {
  const stamp = Date.now().toString(36);
  return `wh_${target}_${stamp}`;
}

function statusForTarget(target: string): 200 | 202 | 500 {
  if (target === "analytics-pipeline") {
    return 202;
  }
  if (target === "crm-sync-endpoint") {
    return 500;
  }
  return 200;
}

export function deliverWebhook(
  args: DeliverWebhookArgs,
  store: SyncStore,
): WebhookResult {
  const syncId = args.syncId?.trim();
  const rawTarget = args.target?.trim();

  if (!syncId) {
    throw new Error("syncId is required");
  }
  if (!rawTarget) {
    throw new Error("target is required");
  }

  const priorSync = store.get(syncId);
  if (!priorSync) {
    throw new Error(
      `Unknown syncId "${syncId}". Run syncVenues first and use the returned syncId.`,
    );
  }

  const target = resolveWebhookTargetId(rawTarget) ?? rawTarget;
  const webhook = getWebhookTarget(target);
  if (!webhook) {
    throw new Error(
      `Unknown webhook target "${rawTarget}". Valid targets: ${listWebhookTargetIds().join(", ")}`,
    );
  }

  return {
    deliveryId: makeDeliveryId(target),
    syncId: priorSync.syncId,
    target,
    statusCode: statusForTarget(target),
    deliveredAt: new Date().toISOString(),
  };
}
