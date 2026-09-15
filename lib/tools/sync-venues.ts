import { getVenueGroup } from "@/lib/data/integrations";
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
  const venueGroup = args.venueGroup?.trim();
  if (!venueGroup) {
    throw new Error("venueGroup is required");
  }

  const group = getVenueGroup(venueGroup);
  if (!group) {
    throw new Error(
      `Unknown venue group "${venueGroup}". Valid groups: coastal-resorts, metro-nightlife, premium-casinos, festival-grounds`,
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
