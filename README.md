# Tathagat — the Himalayan Observatory

A personal portfolio built as an explorable illustrated place: blue hour outside a stone-and-timber observatory, then a warm study under the dome. Objects in the study open the real content: the workstation (case studies), notebook (field journal), telescope (learning map), bookshelf (about), tactics board and controller (the personal corner: football, gaming, fantasy), the window (a moment of calm) and the letter (contact). Everything is also reachable from the persistent menu and from direct URLs.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Production build: `npm run build && npm start`. Copy `.env.example` to `.env.local` for optional integrations.

## Where things live

- `src/content/site.ts` — all personal content (profile, case studies, journal, learning map, experience, beyond, links, credits). Items marked `TODO` or `unverified` are placeholders; see `docs/NEEDED.md`.
- `src/components/room/` — the scene: `Exterior.tsx` (opening frame), `Interior.tsx` (the study with hotspots), `Room.tsx` (orchestration, parallax, focus handling), `Panel.tsx`, `RoomMenu.tsx`, `Ambience.tsx` (optional synthesised wind), `route.ts` (hash routing).
- `src/components/panels/` — the content views, plain semantic HTML.
- `src/components/GearboxLab.tsx` — the interactive gearbox fault demo (Field Journal → Experiments).
- `public/beyond/` — drop your photographs here; they appear behind the window ("A moment of calm").
- `content/essays/` — essays as MDX; `/essays/<slug>` pages and `/feed.xml`.
- `src/app/api/` — `radar` (Reading Radar feeds) and `milan` (fixtures); caches in `.cache/`.
- `docs/CREDITS.md` — asset provenance. `docs/NEEDED.md` — what is still missing. `docs/INTEGRATIONS.md` — what works locally, what was tested live, what needs credentials.

## URLs

`/#work`, `/#work/<slug>`, `/#signal`, `/#signal/linkedin`, `/#signal/radar`, `/#bench/batching`, `/#bench/gearbox`, `/#exploring/<topic>`, `/#about`, `/#about/now`, `/#offclock`, `/#offclock/milan`, `/#beyond`, `/#contact`, plus `/essays/<slug>` and `/feed.xml`. Opening one of these lands straight inside with the panel open; browser back/forward close and reopen panels.

## Design notes

- 2.5D layered SVG, not WebGL: paints on the first frame, no model assets, works everywhere, and the whole scene is keyboard-reachable because hotspots are real focusable elements.
- Parallax is gentle, only on fine pointers, and disabled under `prefers-reduced-motion`. No autoplay audio.
- On phones the study is cropped to the desk and every destination is offered as a large button row, so nothing depends on precision taps.
- Without JavaScript the page shows a plain-text version of the content.
