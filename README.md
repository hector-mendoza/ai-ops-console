# ai-ops-console

**Product claim:** A natural-language ops ask becomes a visible venue integration run — sync → webhook → live status board updates → streamed wrap-up. This is an integration console demo, not a chat toy. All venue and webhook data is deterministic mock data; there are no real URVenue APIs, webhooks, auth, DB, or RAG.

## Stack

- Next.js App Router
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`)
- Anthropic only — default model `claude-haiku-4-5` (override with `ANTHROPIC_MODEL`)

## Local run

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try an ops ask such as:

> Sync coastal resorts and notify the partner events hub.

The console chains `syncVenues` → `deliverWebhook`, updates the tool trail and status board live, then streams an ops wrap-up.

## Modules

| Path | Role |
|------|------|
| `app/page.tsx` | Console shell (claim, ask, trail, board, answer) |
| `app/api/chat/route.ts` | POST handler — `streamText` + `stopWhen: isStepCount(6)` |
| `lib/ai/model.ts` | Anthropic provider, default `claude-haiku-4-5` |
| `lib/data/integrations.ts` | Deterministic venue groups + webhook targets |
| `lib/tools/sync-venues.ts` | `syncVenues` tool implementation |
| `lib/tools/deliver-webhook.ts` | `deliverWebhook` tool implementation |
| `lib/chat/types.ts` | Message, tool step, and board row contracts |
| `components/*` | ClaimBanner, Composer, ToolTrail, ToolStepCard, StatusBoard, AnswerStream |

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | — |
| `ANTHROPIC_MODEL` | No | `claude-haiku-4-5` |

## Build

```bash
npm run build
```
