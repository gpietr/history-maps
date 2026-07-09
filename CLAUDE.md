# ChronoMap

A map storytelling platform — events placed in time and space. Use cases: historical campaigns, biographies, climate data.

## Stack

| Layer | Tech |
|---|---|
| Frontend | SvelteKit 5 + TypeScript, Tailwind CSS v4 |
| Map | MapLibre GL JS |
| Backend | Elysia + Bun |
| Data | Hardcoded in `backend/src/data/stories.ts` — no DB yet |

Bun is at `~/.bun/bin/bun` (not on PATH by default in this environment).

## Monorepo layout

```
packages/types/     # Shared Story + StoryEvent interfaces — import as @chronomap/types
frontend/           # SvelteKit app — port 5173
backend/            # Elysia API — port 3000
```

## Running

```bash
# Backend
cd backend && ~/.bun/bin/bun run src/index.ts

# Frontend
cd frontend && ~/.bun/bin/bun run dev
```

Install from root: `~/.bun/bin/bun install`

## Key architecture decisions

- **No DB yet** — stories live in `backend/src/data/stories.ts` as typed TS arrays. Adding SQLite later via `bun:sqlite`.
- **Map styles** — all use free Esri raster tiles (no API key). Default is World Physical Map (no city names, timeless). Style switcher: Physical / Atlas (NatGeo) / Satellite / Modern. Stadia Maps terrain available if `VITE_STADIA_API_KEY` is set in `frontend/.env.local`.
- **Marker hover bug** — MapLibre owns the outer marker element's `transform` for positioning. Scale effects must go on an inner child element, not the wrapper. See `Map.svelte: makeMarkerEl`.
- **Style switching** — uses `{#key activeStyle}` to remount `<Map>` on style change rather than `map.setStyle()`, because `setStyle` destroys all markers.
- **Svelte 5** — uses `$props()`, `$state()`, `$derived()`, `$effect()`, `{@render children()}`. No Options API or `<slot>`.

## Data model

```ts
Story { id, title, description, map: { center, zoom, styleUrl? }, timeRange, events[] }
StoryEvent { id, title, description?, timestamp, location?, category?, value? }
```

Location types: `point | area | route`. Only `point` is rendered currently.

## Frontend env vars

See `frontend/.env.example`. Copy to `frontend/.env.local` for local overrides.
