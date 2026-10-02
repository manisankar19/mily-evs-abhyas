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

### How it is deployed (v2: one file, Vercel CLI)

The site is a single self-contained `dist/index.html`, built and tested on this machine and
uploaded **prebuilt**. Vercel never builds this project: the root `vercel.json` disables Git
deployments and makes any source build fail with a message. That is deliberate, because the
`GANESH_EVS` secret lives only in `.env.local`, and only its SHA-256 hash goes into the page.

```bash
npm run test:e2e              # build + both browser suites
scripts/deploy.sh --dry-run   # validate, rebuild, stage dist/ (index.html + deploy/vercel.json); sends nothing
scripts/deploy.sh --preview   # upload as a preview (behind Vercel Authentication)
scripts/deploy.sh --prod      # upload to production, then verify the live bytes
```

`deploy.sh` always validates, checks that the 6 v1 papers are unchanged, rebuilds from scratch
and refuses to upload anything except `index.html` and the static `vercel.json` (no-cache and
`nosniff` headers). After `--prod` it runs `scripts/verify-live.js`, which fetches the live
page and fails unless its SHA-256 equals the tested local file. This replaces v1's
`deploy/check.js` hash gate. For a preview, run
`node scripts/verify-live.js <preview-url> dist/index.html --vercel-curl`.

The CLI uses its own login (`npx vercel whoami`); no token is stored in this repo.

### Redeploy after editing a paper

1. Edit `app/data/evs-*.json`; for a school paper also run `node scripts/review-sheet.js spNN`.
2. `npm run validate && npm run fidelity && npm run test:e2e`
3. `scripts/deploy.sh --prod`

- **Change the code:** change `GANESH_EVS` in `.env.local`, then redeploy. Never edit the source for this.
- **Rollback:** Vercel → Deployments → pick the previous deployment → *Promote to Production*.
- Never deploy by browser drag-and-drop.

### v1 history

v1 was deployed as a split build across 7 Vercel projects (`mily-evs-abhyas` plus the data
projects `mily-evs-data-a` … `-f`), gated by `deploy/check.js`. v2 retires that setup. The
data projects can be deleted once the owner has checked the v2 site (sprint v2, Task 36).

## Repo layout

```
PROJECT-CARD.yml     subject card: chapters, marks, login, secret var name, section blueprint
BLUEPRINT.md         the generalised specification this site follows
build.js             validate → hash secret → inline CSS/JS/data/assets → dist/index.html
validate.js          zero-dependency paper validator (npm run validate)
dev-server.js        serves dist/ on localhost:4173
vercel.json          disables Git deployments and source builds (deploy the prebuilt dist/)
app/index.html       page shell (keeps the __SECRET_HASH__ placeholder)
app/styles.css       light + dark themes, print styles, ≤390 px layout
app/app.js           login → chapters → paper → result; modes; marking; result
app/ui/en.json       every user-visible string
app/data/*.json      one paper per file
app/assets/          SVG assets (none needed for these papers)
source/              notes on the textbook chapters and sample papers used
sprints/v1/          TASKS.md and WALKTHROUGH.md for this build
tests/e2e.js         Playwright acceptance click-through
deploy/vercel.json   static headers for the prebuilt dist/ (copied in by scripts/deploy.sh)
scripts/             deploy.sh, verify-live.js, fidelity.js, review-sheet.js, map tools
tests/run-e2e.js     npm run test:e2e: build, serve, run e2e.js + e2e-school.js
```
