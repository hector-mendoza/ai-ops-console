export type VenueRecord = {
  id: string;
  name: string;
  city: string;
  capacity: number;
};

export type VenueGroup = {
  id: string;
  label: string;
  venues: VenueRecord[];
};

export type WebhookTarget = {
  id: string;
  label: string;
  endpoint: string;
  description: string;
};

export const VENUE_GROUPS: VenueGroup[] = [
  {
    id: "coastal-resorts",
    label: "Coastal Resorts",
    venues: [
      { id: "cr-001", name: "Azure Pier Pavilion", city: "Miami", capacity: 4200 },
      { id: "cr-002", name: "Sunset Cove Arena", city: "San Diego", capacity: 6800 },
      { id: "cr-003", name: "Harbor Lights Ballroom", city: "Charleston", capacity: 2100 },
    ],
  },
  {
    id: "downtown-venues",
    label: "Downtown Venues",
    venues: [
      { id: "dv-001", name: "Civic Center Hall", city: "New York", capacity: 2800 },
      { id: "dv-002", name: "Union Square Theater", city: "San Francisco", capacity: 1900 },
      { id: "dv-003", name: "Main Street Arena", city: "Seattle", capacity: 4200 },
      { id: "dv-004", name: "Market District Ballroom", city: "Portland", capacity: 1600 },
    ],
  },
  {
    id: "metro-nightlife",
    label: "Metro Nightlife",
    venues: [
      { id: "mn-001", name: "Neon District Hall", city: "New York", capacity: 3500 },
      { id: "mn-002", name: "Midnight Loft", city: "Chicago", capacity: 1800 },
      { id: "mn-003", name: "Pulse Underground", city: "Los Angeles", capacity: 2400 },
      { id: "mn-004", name: "Velvet Room", city: "Atlanta", capacity: 1200 },
    ],
  },
  {
    id: "premium-casinos",
    label: "Premium Casinos",
    venues: [
      { id: "pc-001", name: "Grand Sapphire Theater", city: "Las Vegas", capacity: 5200 },
      { id: "pc-002", name: "Royal Flush Arena", city: "Atlantic City", capacity: 3900 },
    ],
  },
  {
    id: "festival-grounds",
    label: "Festival Grounds",
    venues: [
      { id: "fg-001", name: "Riverbend Amphitheater", city: "Austin", capacity: 12000 },
      { id: "fg-002", name: "Summit Fields", city: "Denver", capacity: 8500 },
      { id: "fg-003", name: "Lakefront Stage", city: "Chicago", capacity: 15000 },
    ],
  },
];

export const WEBHOOK_TARGETS: WebhookTarget[] = [
  {
    id: "partner-events-hub",
    label: "Partner Events Hub",
    endpoint: "https://hooks.demo/partner-events",
    description: "Primary partner event distribution channel",
  },
  {
    id: "crm-sync-endpoint",
    label: "CRM Sync Endpoint",
    endpoint: "https://hooks.demo/crm-sync",
    description: "Salesforce-compatible venue inventory sync",
  },
  {
    id: "analytics-pipeline",
    label: "Analytics Pipeline",
    endpoint: "https://hooks.demo/analytics",
    description: "Downstream BI and occupancy analytics feed",
  },
  {
    id: "ops-status-board",
    label: "Ops Status Board",
    endpoint: "https://hooks.demo/status-board",
    description: "Live operations dashboard webhook receiver",
  },
];

const VENUE_GROUP_ALIASES: Record<string, string> = {
  downtown: "downtown-venues",
  "downtown venues": "downtown-venues",
  "downtown group": "downtown-venues",
  "coastal resorts": "coastal-resorts",
  "metro nightlife": "metro-nightlife",
  "premium casinos": "premium-casinos",
  "festival grounds": "festival-grounds",
};

const WEBHOOK_TARGET_ALIASES: Record<string, string> = {
  "ops status board": "ops-status-board",
  "status board": "ops-status-board",
  "partner events hub": "partner-events-hub",
  "crm sync endpoint": "crm-sync-endpoint",
  "crm sync": "crm-sync-endpoint",
  "analytics pipeline": "analytics-pipeline",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveVenueGroupId(input: string): string | undefined {
  const trimmed = input.trim();
  const normalized = normalizeKey(trimmed);

  const byId = VENUE_GROUPS.find((group) => group.id === trimmed || group.id === normalized);
  if (byId) return byId.id;

  const byLabel = VENUE_GROUPS.find((group) => normalizeKey(group.label) === normalized);
  if (byLabel) return byLabel.id;

  const alias = VENUE_GROUP_ALIASES[normalized];
  if (alias) return alias;

  return undefined;
}

export function resolveWebhookTargetId(input: string): string | undefined {
  const trimmed = input.trim();
  const normalized = normalizeKey(trimmed);

  const byId = WEBHOOK_TARGETS.find(
    (target) => target.id === trimmed || target.id === normalized,
  );
  if (byId) return byId.id;

  const byLabel = WEBHOOK_TARGETS.find((target) => normalizeKey(target.label) === normalized);
  if (byLabel) return byLabel.id;

  const alias = WEBHOOK_TARGET_ALIASES[normalized];
  if (alias) return alias;

  return undefined;
}

export function getVenueGroup(id: string): VenueGroup | undefined {
  const resolved = resolveVenueGroupId(id) ?? id;
  return VENUE_GROUPS.find((group) => group.id === resolved);
}

export function getWebhookTarget(id: string): WebhookTarget | undefined {
  const resolved = resolveWebhookTargetId(id) ?? id;
  return WEBHOOK_TARGETS.find((target) => target.id === resolved);
}

export function listVenueGroupIds(): string[] {
  return VENUE_GROUPS.map((group) => group.id);
}

export function listWebhookTargetIds(): string[] {
  return WEBHOOK_TARGETS.map((target) => target.id);
}
