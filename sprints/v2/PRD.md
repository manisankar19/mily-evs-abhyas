# Sprint v2 — PRD: School Papers (`mily-evs-abhyas`)

**Brief:** `sprints/v2/instruction.md` (wins over this PRD on any conflict).
**Decisions:** `sprints/v2/v2-decisions.md` (locked 2026-10-02; conflicts with the brief are resolved below in "Decision reconciliation").
**Owner:** Manisankar · **Reviewer:** Parent (reads every answer review sheet at each batch gate)

## Overview
The teacher's worksheets and practice papers (no answer keys) go onto the live EVS site as a
**"School Papers"** group after the chapter papers and the mock. Each paper is reproduced exactly
as printed, with authored answers, ⚑ flags on judgement-based answers, and a review sheet the parent reads before
the child uses the paper. Practice mode, checking mode and the result page work as they do for chapter papers.
The sprint also replaces v1's 7-project split deploy with a single-file CLI deploy.

## Goals
- The 6 EVS school papers (sp01, sp03–sp07; sp02 dropped as a duplicate of sp05 at Gate 0b) are on the site in filename order, with short card labels and each paper's printed total.
- Every school paper passes `validate.js` (`kind: "school"`) and `scripts/fidelity.js`, and every `fallbackText` use is counted and reported.
- The 6 existing paper JSONs are **byte-identical** to their preflight SHA-256 hashes and pass `npm run validate` unchanged.
- Every picture-dependent question is drawn as an original SVG and can be answered from the drawing alone.
- The site is deployed as one file by CLI after owner approval, and checked in a real browser (one chapter paper and one school paper, both modes, phone and desktop).

## User Stories
- As **Mily (Class 4)**, I want to practise the exact worksheets my teacher gave, so practice matches what I see at school.
- As the **parent**, I want authored answers with wide `acceptable` lists, rubrics and ⚑ flags in checking mode, so I can mark fairly and know which answers to double-check.
- As the **parent**, I want a review sheet per paper with ⚑ items first, so I can vet the answers before the child uses the paper.
- As the **owner**, I want school papers on their own validation rules (`kind: "school"`), so existing chapter-paper checks are never weakened.
- As the **owner**, I want one CLI deploy of one file, so I can stop maintaining the 6 data projects.

## Papers (from `v2-decisions.md`, checked against the PDFs on 2026-10-02)

| sp | Source file (`source/school-papers/`, copied from `source/samples/`) | Pages | Text layer |
|---|---|---|---|
| sp01 | `2.1.1 class 4_twau_ch-3_ws.pdf` | 4 | usable (bilingual header) |
| sp02 | `2.1.2 EVS L5.pdf` | 4 | garbled. **Dropped at Gate 0b: duplicate of sp05.** |
| sp03 | `2.1.4 Worksheet_Class-4_TWAU_Sept'25 HYE.pdf` | 8 | usable |
| sp04 | `2.1.5 L5 EVS.pdf` | 4 | **garbled → 100% fallbackText**; covers Ch 4 |
| sp05 | `2.1.6  Worksheet_Class-4_TWAU_August'25 L-5.pdf` | 4 | usable |
| sp06 | `2.1.7 IV TWAU HY Practice Paper-2.pdf` | 8 | usable. Header says 09 pages; the footers show 8 of 8, so nothing is missing. |
| sp07 | `2.1.8 IV TWAU Revision WS Chapters 1 & 2.pdf` | 4 | usable |
| — | `2.1.3 EVS L1 to 7.pdf` | 12 | Maths. **Excluded.** |

`sp02` and `sp04` are both "L5", and `sp05` covers L-5. Intake compares these three page image by page image to find duplicates. If two are duplicates, keep one and renumber the rest. The owner confirms any renumbering at Gate 0b.

## Decision reconciliation (brief wins)
| `v2-decisions.md` says | Brief / evidence says | We do |
|---|---|---|
| "move or symlink" PDFs into `school-papers/` | `source/samples/` is left exactly as it is | **Copy** the 7 PDFs, keeping their names; `samples/` stays untouched |
| school papers allow "30–80 items" | §3: no item-count targets | **No item-count limits** for `kind: "school"` |
| 2.1.2 / 2.1.5 "readable" | `pdftotext` output is garbled | Page images are readable; the text comes from `fallbackText` |
| e2e: "skip Playwright or install" | §8: the existing suite plus a school spec | **Install** Playwright locally; repoint the require path |

## Technical Architecture
- **Stack (unchanged):** zero-dependency Node scripts + vanilla JS single-page app; `build.js` inlines everything into `dist/index.html`.
- **New:** `scripts/fidelity.js`, `scripts/review-sheet.js`, `scripts/hash-existing.js`, `tests/fixtures/`, `SCHEMA.md`, `source/intake.json`.

```
source/school-papers/*.pdf ──pdftotext──► text cache ─┐
        │                                            ├─► scripts/fidelity.js ──(hard fail)
        └─pdftoppm -r 100──► page images ─► intake.json (totals, sections, hashes)
                                   │
              sub-agent per paper  ▼
        app/data/evs-spNN.json + app/assets/*.svg
                │
                ├─► validate.js (kind:"chapter" rules unchanged | kind:"school" rules)
                ├─► scripts/review-sheet.js ─► sprints/v2/answer-review/spNN.md
                │        (validator re-checks the sheet against the JSON)
                ▼
            build.js (per-paper totals, no hard-coded counts, GANESH_EVS → SHA-256)
                ▼
          dist/index.html ──vercel CLI──► mily-evs-abhyas.vercel.app
```

**Data flow (app):** login (Mily/2026) → paper list (chapter papers, mock, then **School Papers**) → paper
(labels, headings, topics, pictures, underlines, ½ marks) → checking mode (GANESH_EVS) shows the answer,
`acceptable`, rubric, model answer, ⚑, `teacherNote` and the disclaimer line → result out of the printed total.

**Schema additions (school only):** `kind`, `sourceFile`, `label`, `heading`, `topics`,
`pictureDescription`, `underline` spans, `answerSource: "authored"`, `answerConfidence` (`"sure"|"check"`),
`teacherNote`, `fallbackText`. Id pattern `evs-spNN-sX-bY-iZ`. Marks are compared in half-mark units (integers), not floats.

**Rules for `kind: "school"`:** total = the intake's printed total; the paper's own sections, verbatim; no item-count or difficulty-mix targets;
copied-passage, similarity and source-window checks skipped (and the copied-passage check ignores `source/school-papers/`
for chapter papers); readability is reported, not gated. MCQ option and match-pair rules are relaxed only as far as the
printed paper needs. **All papers:** `acceptable` on fill-blank, one-word and transformation items; a band rubric on judgement items; answerPoints sum to
marks; blanks; curly quotes; assets; the caption/alt-text-gives-away-the-answer check.

## Out of Scope
- Changing, regenerating or reformatting the 6 existing papers
- Maths (`2.1.3`) and any English or Maths site work
- Automated scoring (the parent marks everything)
- A new passcode or server-side auth
- Correcting the teacher's wording (we add a `teacherNote` instead)
- Deleting the 6 old Vercel data projects **before** the owner has checked the live site

## Dependencies
- v1 shipped (6 papers, validator, app, build, live at https://mily-evs-abhyas.vercel.app)
- `pdftotext`, `pdftoppm`, `node`, `python3` (present); Playwright (to install)
- `.env.local` holding `GANESH_EVS` and a Vercel token (never printed)
- NCERT *Our Wondrous World* Ch 1–5 in `source/textbook/`. If intake finds chapters beyond 5, the owner supplies them or those answers get ⚑ with no line reference.

## Gates
| Gate | Waits for |
|---|---|
| G0b (after intake) | Owner: duplicate and renumbering result, the sp06 page-count check, chapters beyond 5, the live-check paper (default: the first paper in batch 1) |
| Batch 1 / 2 / 3 | Parent reads the review sheets, and the coordinator re-check is done |
| Deploy | Owner approves the CLI deploy |
| Cleanup | Owner has checked the live site; then the 6 data projects are deleted |

## Hard stops (brief §10)
Unreadable file · a picture question that cannot be drawn well enough to answer · a question with no defensible answer · a school-paper rule
that would weaken a check on existing papers · a secret would be printed or committed · an existing paper fails `npm run validate`.
