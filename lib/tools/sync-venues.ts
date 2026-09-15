import { getVenueGroup, listVenueGroupIds, resolveVenueGroupId } from "@/lib/data/integrations";
import type { SyncResult, SyncVenuesArgs } from "@/lib/chat/types";

export type SyncStore = Map<string, SyncResult>;

function makeSyncId(venueGroup: string): string {
  const stamp = Date.now().toString(36);
  return `sync_${venueGroup}_${stamp}`;
}

export function syncVenues(
  args: SyncVenuesArgs,
  store: SyncStore,
): SyncResult {
  const rawGroup = args.venueGroup?.trim();
  if (!rawGroup) {
    throw new Error("venueGroup is required");
  }

  const venueGroup = resolveVenueGroupId(rawGroup) ?? rawGroup;
  const group = getVenueGroup(venueGroup);
  if (!group) {
    throw new Error(
      `Unknown venue group "${rawGroup}". Valid groups: ${listVenueGroupIds().join(", ")}`,
    );
  }

  const dryRun = args.dryRun ?? false;
  const result: SyncResult = {
    syncId: makeSyncId(venueGroup),
    venueGroup,
    syncedCount: dryRun ? 0 : group.venues.length,
    dryRun,
    finishedAt: new Date().toISOString(),
  };

  store.set(result.syncId, result);
  return result;
}
