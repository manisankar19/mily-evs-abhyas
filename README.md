# EVS Practice — Class 4 (मिली की EVS अभ्यास)

A single-file, fully static website that gives a Class 4 child chapter-wise practice
papers for **The World Around Us (EVS)** — NCERT *Our Wondrous World*, Chapters 1–5
(Half-Yearly portion) — plus one Half-Yearly mock paper, all in the exact pattern of the
school's own worksheets (Atomic Energy Education Society, 2025-26).

The child writes answers **on paper**. A parent then unlocks **checking mode** with a
secret code, sees the model answer for each question with its mark split, and enters marks
one question at a time. A result screen shows section-wise totals, percentage and grade.

**Who uses it:** Mily (student) and whoever checks her work (parent).

---

## Papers

| Paper | Title | Items | Marks |
|---|---|---|---|
| Chapter 1 | Living Together | 60 | 100 |
| Chapter 2 | Exploring Our Neighbourhood | 60 | 100 |
| Chapter 3 | Nature Trail | 60 | 100 |
| Chapter 4 | Growing up with Nature | 60 | 100 |
| Chapter 5 | Food for Health | 60 | 100 |
| Half-Yearly | Mock paper, Chapters 1–5 | 60 | 100 |

Every paper follows the same six-section blueprint (see `PROJECT-CARD.yml`), derived from
the school's September 2025 Half-Yearly worksheet: **Observation and Reporting** (A 20 +
B 10), **Identification and Classification** (C 20 + D 20), **Discovery of Facts**
(E 14 + F 16).

---

## Secrets

| Name | Where the value lives | What it controls |
|---|---|---|
| `GANESH_EVS` (environment variable) | `.env.local` for local builds (git-ignored); Vercel → Project → Settings → Environment Variables for hosted builds | The **checking-mode code**. Only its SHA-256 hash is built into the page. |
| Student login `Mily` / `2026` | `PROJECT-CARD.yml` (committed, shown in the browser) | Nothing. See below. |

The value of `GANESH_EVS` is deliberately **not** written in this README. Writing it
here would undo the hashing.

### The student login is not a security control

`Mily` / `2026` is checked in the browser and is visible in the page source. It keeps the
page tidy and gives the child a sense of occasion. It protects nothing.

### Checking mode is a deterrent, not a security boundary

The model answers are embedded in the page. Anyone who opens the browser's developer
tools can read them without the code. **It stops a nine-year-old. It is not a security
boundary.** Making it airtight would mean serving answers from a server API — a
deliberate future decision, not something this site does.

Checking mode lives in memory only. It resets on reload, when you go back to the chapter
list, when you open another chapter, and on sign-out. Marks, on the other hand, are saved
in the browser's `localStorage` per paper and survive all of those.

---

## The two modes

| | Practice (default) | Checking |
|---|---|---|
| Questions, mark values | ✓ | ✓ |
| Show answer / Show all answers | — (not in the page at all) | ✓ |
| Marks buttons, Clear, Score bar, See result | — | ✓ |
| Practice banner | ✓ | — |
| Back, Print | ✓ | ✓ |

**To unlock:** open a paper → *Checking mode* → type the code → *Unlock*. A wrong code
shows an error and unlocks nothing. *Exit checking mode* goes back to practice without
asking again.

---

## Local build and run

```bash
# 1. put the code in .env.local (git-ignored)
echo 'GANESH_EVS=your-code-here' > .env.local

# 2. validate the papers, build one self-contained dist/index.html, serve it
npm run validate
npm run build
npm run dev          # → http://localhost:4173
```

Open **http://localhost:4173**, not the file directly. Checking the code uses
`crypto.subtle`, which browsers only enable on `https://` and `http://localhost`; from a
`file://` URL the page shows *"Open this page over https…"* instead of unlocking.

`node build.js` refuses to run (non-zero exit, nothing written) if the secret is unset or
empty, if the `__SECRET_HASH__` placeholder is missing from `app/index.html`, if any paper
fails validation, if any referenced asset is missing, or if a UI string used in the code
is missing from `app/ui/en.json`.

### Acceptance click-through

```bash
npm run dev &         # server on :4173
node tests/e2e.js     # needs Playwright + Chromium; runs BLUEPRINT §13 items 7–19, 23–25
```

---

## Editing a question

Papers live in `app/data/evs-ch{N}.json` (and `evs-hy.json` for the mock). Each scorable
question is an **item** with `id`, `type`, `q`, `marks`, `answer`, and for anything above
1 mark `answerPoints` (the mark split) or `markingGuide`.

Rules the validator enforces (`npm run validate`):

- every section's `marks` equals the sum of its items; the paper totals exactly 100;
- `mcq` answers must be one of the 3–4 `options`; `match` has one pair per mark;
- items above 1 mark carry `answerPoints` summing to `marks`, or a `markingGuide`;
- 45–60 items per paper; no `TODO`/`TBD` placeholders;
- **never change an `id`** — saved marks are keyed by it. Retire an id; do not reuse it.

## Adding a chapter

1. Copy `app/data/evs-ch5.json` to `app/data/evs-ch6.json`.
2. Set `chapter`, `title`, `subtitle`, `sourceRef`; rewrite every item, keeping the
   section blueprint and the id pattern `evs-c6-s{section}-b{block}-i{item}`.
3. `npm run validate` → `npm run build`. The chapter list is generated from the data.

---

## Deploy, redeploy, rollback

**Live site:** https://mily-evs-abhyas.vercel.app (Vercel team `mani125slm`).

### How it is deployed today (v1)

The build agent could not run the Vercel CLI or set environment variables, and the MCP
upload path could not carry the whole 170 KB single-file page in one piece. So v1 is
deployed as a **split build** (`node build.js --minify --split`):

| Vercel project | Serves |
|---|---|
| `mily-evs-abhyas` | `index.html` (shell: CSS + JS + UI strings) and `vercel.json` with rewrites `/data/*.json` → the data projects below |
| `mily-evs-data-a` … `-f` | one paper JSON each (ch1, ch2, ch3, ch4, ch5, half-yearly) with CORS headers |

From the browser it is one origin: the page fetches `data/evs-ch3.json` and Vercel
proxies it. The main project's build command is `node deploy/check.js`, which **refuses to
go live** unless `index.html` and every remote paper match the SHA-256 hashes in
`deploy/expected.json` (the hashes of the locally built and tested files). That gate is
what makes the re-typed upload trustworthy.

Only the production aliases (`*.vercel.app` without the team suffix) are public; the
team-suffixed preview URLs are behind Vercel Authentication.

### Redeploy after editing a paper

1. Edit `app/data/evs-chN.json`, then `npm run validate`.
2. `node build.js --minify --split` → `dist/index.html` + `dist/data/*.json`.
3. Upload the changed paper to its data project (same file name), and if `index.html`
   changed, regenerate `deploy/expected.json` (hashes of `dist/index.html` and of the
   paper files as uploaded) and redeploy `mily-evs-abhyas` with `index.html`,
   `vercel.json`, `check.js`, `expected.json`.

### The simpler way, once you have the Vercel CLI

`vercel.json` at the repo root already carries `buildCommand: node build.js` and
`outputDirectory: dist`. Set `GANESH_EVS` in the project's environment variables, then:

```bash
npx vercel link --yes --project mily-evs-abhyas
npx vercel deploy --prod --yes
```

That produces the single self-contained file the blueprint prefers; the six data projects
can then be deleted.

- **Change the code:** change `GANESH_EVS` (in `.env.local` or Vercel env), rebuild,
  redeploy. Never edit the source for this.
- **Rollback:** Vercel → Deployments → pick the previous deployment → *Promote to
  Production*.
- Never deploy by browser drag-and-drop (the original Hindi build lost files that way).

## Repo layout

```
PROJECT-CARD.yml     subject card: chapters, marks, login, secret var name, section blueprint
BLUEPRINT.md         the generalised specification this site follows
build.js             validate → hash secret → inline CSS/JS/data/assets → dist/index.html
validate.js          zero-dependency paper validator (npm run validate)
dev-server.js        serves dist/ on localhost:4173
vercel.json          buildCommand / outputDirectory for a source deployment
app/index.html       page shell (keeps the __SECRET_HASH__ placeholder)
app/styles.css       light + dark themes, print styles, ≤390 px layout
app/app.js           login → chapters → paper → result; modes; marking; result
app/ui/en.json       every user-visible string
app/data/*.json      one paper per file
app/assets/          SVG assets (none needed for these papers)
source/              notes on the textbook chapters and sample papers used
sprints/v1/          TASKS.md and WALKTHROUGH.md for this build
tests/e2e.js         Playwright acceptance click-through
deploy/              check.js (build-time hash gate), expected.json, vercel.json used by the live deployment
```
