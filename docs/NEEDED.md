# Details still needed from Tathagat

Everything below is either missing or marked as a draft in `src/content/site.ts`. Search the file for `TODO` and `unverified`.

1. **Resume PDF**: `public/Tathagat-CV.pdf` is generated from `docs/cv/Tathagat_CV_web.docx` (no phone number). Re-export when you update the CV; the full copy is `docs/cv/Tathagat_CV_2026-10.docx`.
2. **Personal corner** (`personal` in `site.ts`): favourite club, player and the position you play (`football`), platform (`gaming`), favourite books or authors (`fantasy`). Each field is shown only when filled; nothing is invented meanwhile.
3. **Football tactics board**: change `personal.football.defaultFormation` if 4-3-3 isn't your default.
4. **Essays**: the two files in `content/essays/` marked `sample: true` are layout placeholders. Replace them with your own writing or delete them. Set `status: published` when ready.
4a. **LinkedIn shares**: add posts and links to `shares` in `site.ts` (URL, title, date, kind, description, optional commentary and embed URL).
4b. **Now**: update `now` in `site.ts` with your own words and bump `updated` when you do.
4c. **AC Milan**: a football-data.org key in `FOOTBALL_DATA_TOKEN` turns on the matchday card (see docs/INTEGRATIONS.md).
5. **Learning notes**: `exploring[].notes` are empty. Add short notes per topic as you study.
6a. **A portrait**: drop one image into `public/me/` (JPG/PNG/WebP, about 4:5). It appears in About.
6. **Photographs for "A moment of calm"** (the window): drop JPG/PNG/WebP files into `public/beyond/` and add honest captions in `beyond.captions` keyed by filename.
7. **Confirm wording** of the bio and the statement in `profile` so it sounds like you.
8. **Open Graph image**: `src/app/opengraph-image.jpg` is your snow-peak photo; swap it any time.

Nothing on the site names the clinical product (NDA). Your phone number and exact address are deliberately not published.
