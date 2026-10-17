# Integrations: what works where

Status as of 2026-10-17. Three honest buckets.

## Working locally, no configuration needed

| Feature | Where | Notes |
|---|---|---|
| Essays (MDX) | `content/essays/*.mdx` → `/essays/<slug>` | Frontmatter: `title, summary, date, updated?, tags, status: draft\|published, sample?`. Drafts have no URL and appear nowhere. Code highlighting (highlight.js), maths (KaTeX), GFM tables, images from `public/`. |
| RSS | `/feed.xml` | Published essays only. Set `SITE_URL` for absolute links. |
| Shared on LinkedIn | `shares` in `src/content/site.ts` | Hand-curated list. Optional `embed` (official LinkedIn embed URL) renders an iframe; otherwise a link card. Original links always kept. |
| Reading Radar | `/api/radar`, feeds allowlisted in `feeds` | Fetches only the listed RSS/Atom URLs, dedupes, caches to `.cache/radar.json` for `RADAR_TTL_HOURS` (24), keeps the last good data during outages, shows the refresh time. |
| Search | ⌘K / Ctrl+K or the Search button | Projects, essays, topics, experiments, contact. |
| Experiment Bench | `#bench` | Batching vs latency (discrete-event simulation, labelled simulated) and the Gearbox Lab (Web Audio). |
| Architecture X-Ray | Triton case study | High level ↔ engineering detail toggle. Only the Triton study has verified detail. |
| Now | `now` in `site.ts`, shown in About | Hand-edited; shows its own "last updated" date. |

## Tested with real sources

| Feature | Result |
|---|---|
| Reading Radar feeds | Fetched live in the dev environment during the build (see the panel's "refreshed" timestamp). Individual feeds can fail; failures are listed under the items and never block the others. |

## Awaiting credentials or deployment configuration

| Feature | What is needed |
|---|---|
| AC Milan fixtures (`/api/milan`) | A free key from football-data.org in `FOOTBALL_DATA_TOKEN` (server-side). Until then the panel shows an explicit "not configured" state. Cached 6 h in `.cache/milan.json`; last good data kept on failure; postponed matches flagged. |
| Scheduled Radar refresh | The route refreshes lazily when the cache is older than the TTL. For a true schedule, call `GET /api/radar?refresh=1` once a day with header `x-refresh-token: $RADAR_REFRESH_TOKEN` from the host's scheduler (Vercel Cron, GitHub Actions, cron). |
| Publishing updates | Essays are read from the filesystem at build/request time. On a static host, pushing a new MDX file triggers a rebuild through the host's Git integration. On a long-running server, restart or redeploy. No webhook is required for the file-based workflow. |
| LinkedIn API | Not implemented. The official API does not expose a member's posts for this use without a partner programme, so the supported routes are: official embeds for posts you choose, and hand-added links. Embeds show selected posts; they do not discover new ones. No scraping. |
| `SITE_URL` | Needed for absolute links in RSS and share metadata. |

## Rules baked in

- No live scores from unofficial pages; no fabricated results.
- Only allowlisted feed URLs are fetched server-side; imported text is stripped to plain text and truncated.
- Third-party articles show a short excerpt and link to the publisher; nothing is republished in full.
- AI-assisted summaries are not used anywhere. If added later they must be labelled and attributed.
- Dates come from frontmatter; nothing rotates to look fresh.
