# Sprint v1 — Walkthrough

## Summary
Built and deployed the Class 4 EVS practice site: five chapter papers (NCERT *Our
Wondrous World* Ch 1–5) plus a Half-Yearly mock, each 60 items / 100 marks in the school's
own three-competency pattern; a single-page app with practice and checking modes, marking,
results and print; a validator and build step; a Playwright acceptance run; and a Vercel
deployment at **https://mily-evs-abhyas.vercel.app**.

## Architecture
`app/` is the editable source (HTML shell, CSS, JS, UI strings, one JSON per paper).
`build.js` validates, hashes the marking secret, and inlines everything into
`dist/index.html`. `--split` instead writes the papers to `dist/data/*.json` and makes the
page fetch them; `--minify` runs terser/clean-css when installed. `pack.js` (gzip loader)
also exists but was not used for the final deployment.

## Data flow
Login (browser-side, cosmetic) → chapter list (from paper data) → paper (rendered from
JSON; checking UI only exists in the DOM while unlocked) → result (computed from marks in
`localStorage`, keyed `evs.marks.<paper>` → item id → mark).

## Verification
- `npm run validate`: 6 papers, 360 items, every section and paper total correct.
- Playwright click-through over `http://localhost:4173`, 33/33 checks, run three times:
  against the single-file build, the gzip-packed build and the split build actually
  deployed. Covers BLUEPRINT §13 items 7–19, 23 (print CSS), 24 (390 px), 25 (console).
- Screenshots in `tests/*.png` reviewed by eye (light, dark, phone, desktop).
- Deployment integrity: `deploy/check.js` runs as the Vercel build and fails unless
  `index.html` and all six remote paper files match local SHA-256 hashes. The site went
  live, so every deployed byte equals the locally tested files. `/data/evs-ch3.json`
  confirmed reachable through the rewrite from the public URL.

## What was NOT verified
- **No live-browser click-through of the deployed URL.** The build container cannot
  reach `*.vercel.app` (egress policy) and the linked computer went offline before the
  main project was deployed. The deployed bytes are hash-identical to what Playwright
  tested locally, but items 7–19 were not re-run against the production URL. Please open
  the URL once on a phone and once on a laptop and run through the checklist in the
  README.
- Print output was checked via print-media CSS emulation, not an actual PDF.
- Three of the five sample worksheets were unreadable (see `source/README.md`).

## Known limitations
- The v1 deployment is split across seven Vercel projects (main + 6 data) because of the
  upload path; offline use after first load is therefore not guaranteed. A CLI deploy of
  the single-file build (README) removes this.
- No picture-based questions; the school's picture items were rewritten as situation
  questions or draw-and-label tasks.
- The Vercel MCP token could not read project settings, so deployment protection
  settings were not inspected; the public production aliases were confirmed to serve
  without login.

## What's next
- v2: CLI deploy of the single-file build with `GANESH_EVS` in Vercel env; delete the
  data projects.
- Add SVG assets for a few observation questions (currency note, beak types, compass).
- Maths and English sites from the same blueprint.
