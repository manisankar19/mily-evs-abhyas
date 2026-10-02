# Sprint v2 — Tasks: School Papers

## Status: In progress (Phase 0–3)

Order follows brief §8. **STOP** marks a gate: report and wait for the owner or parent before continuing.
Never print a secret. Never modify `source/samples/` or the 6 existing `app/data/evs-*.json`.

### Phase 0 — Setup & preflight
- [x] Task 1: Project setup: copy the 7 EVS PDFs (all except `2.1.3`) from `source/samples/` into `source/school-papers/` with the same filenames; create `sprints/v2/answer-review/`; commit `source/` and `sprints/v2/` (P0)
  - Acceptance: 7 files in `school-papers/`, with SHA-256 equal to their `samples/` originals; `source/samples/` unchanged; `git status` clean
  - Files: source/school-papers/*, sprints/v2/*
  - Completed: 2026-10-02 — 7 PDFs copied, SHA-256 identical to samples; committed 1240038
- [x] Task 2: Tool and validation preflight: check that pdftotext, pdftoppm, node and python3 are present; run `npm run validate`; write `scripts/hash-existing.js`, which records or checks SHA-256 of the 6 existing paper JSONs (P0)
  - Acceptance: validate passes; `sprints/v2/preflight-hashes.json` written; `node scripts/hash-existing.js --check` exits 0
  - Files: scripts/hash-existing.js, sprints/v2/preflight-hashes.json
  - Completed: 2026-10-02 — tools present; validate OK (6 papers, 360 items); scripts/hash-existing.js records/checks 6 hashes
- [x] Task 3: Secret and live preflight: confirm `GANESH_EVS` is set in `.env.local` (report set/unset only); confirm the built `index.html` contains its hash but not the plaintext; the Vercel token returns HTTP 200 (status code only); the live URL loads (P0)
  - Acceptance: four pass lines in the session log; no secret value printed
  - Files: none
  - Completed: 2026-10-02 — GANESH_EVS set; build hash present, plaintext absent; vercel CLI whoami OK (raw /v2/user API → 403, CLI auth used instead); live URL 200
- [x] Task 4: Install Playwright on this host; repoint the require path in `tests/e2e.js`; run the existing suite against the local build (ch1–5 and hy, practice and checking modes) (P0)
  - Acceptance: existing suite passes (33/33) with no change to its assertions except the require path
  - Files: tests/e2e.js, package.json (devDependency)
  - Completed: 2026-10-02 — playwright ^1.63.0 devDependency + chromium; require line repointed; existing suite 33/33; npm audit 0 vulns

### Phase 1 — Intake (brief §2)
- [x] Task 5: Text cache and page images for all 7 PDFs (`pdftotext -layout`, `pdftoppm -r 100 -png` into scratch/cache); record PDF hashes and a usable or garbled flag per file (P0)
  - Acceptance: one text file and N page PNGs per PDF; sp02 and sp04 flagged garbled
  - Files: source/intake.json (skeleton)
  - Completed: 2026-10-02 — text cache in source/text-cache/ (committed), page images 100+200 dpi in source/page-images/ (gitignored); sp02, sp04 garbled (0 English words)
- [x] Task 6: Intake sp01, sp02, sp03: **view every page image**; record the printed title and header, total marks, every section heading and block pattern quoted exactly, chapters covered, and every picture with what the question needs from it; estimate the ⚑ count (P0)
  - Acceptance: intake.json and SCHOOL-PAPERS-INTAKE.md entries complete for the 3 papers; page count viewed = PDF page count
  - Files: source/intake.json, source/SCHOOL-PAPERS-INTAKE.md
  - Completed: 2026-10-02 — sp01–sp03 intake by per-paper agents; every page viewed (pagesViewed recorded); transcripts for garbled sp02
- [x] Task 7: Intake sp04, sp05, sp06, sp07 (same fields). For sp06, settle "printed pages: 09" against the 8 PDF pages (P0)
  - Acceptance: all 7 papers complete; sp06 page discrepancy explained or raised
  - Files: source/intake.json, source/SCHOOL-PAPERS-INTAKE.md
  - Completed: 2026-10-02 — sp04–sp07; sp06 complete (footers Page 1–8 of 8; header '09' is a miscount); sp04 is Ch 4 not Ch 5
- [x] Task 8: Duplicate check (by text for usable layers, page image by page image for sp02, sp04 and sp05); flag chapters beyond 5; propose batch order (no pictures first, picture-heavy last, garbled papers last in their group) (P0)
  - Acceptance: duplicate verdicts, chapters beyond 5 and proposed batches written in the intake. **STOP — Gate 0b:** owner confirms renumbering, sp06, chapters beyond 5, and the live-check paper
  - Files: source/SCHOOL-PAPERS-INTAKE.md
  - Completed: 2026-10-02 — sp02 ≡ sp05 (text diff, only annotations differ) → propose drop; sp03~sp06 0.73, kept; no chapters >5; batches proposed. Gate 0b questions open

### Phase 2 — Schema & validator (brief §3)
- [x] Task 9: Write `SCHEMA.md` documenting chapter papers (current behaviour) and `kind: "school"` (new fields, id pattern `evs-spNN-sX-bY-iZ`, ½ marks, `fallbackText`) (P0)
  - Acceptance: every field in brief §3 documented with its type and when it is required
  - Files: SCHEMA.md
  - Completed: 2026-10-02 — SCHEMA.md documents chapter + school kinds, Decisions section
- [x] Task 10: `validate.js`: branch on `kind`. School papers: total from intake.json, no item-count limits, school id regex, MCQ and match rules relaxed only for flagged printed exceptions; the chapter branch stays unchanged (P0)
  - Acceptance: the 6 existing papers produce the same validator output as preflight; hash check passes
  - Files: validate.js
  - Completed: 2026-10-02 — validate.js branches on kind; chapter rules unchanged (evs-hy kind 'half-yearly' keeps chapter rules); intake-matched totals/sections/sourceFile
- [x] Task 11: `validate.js`: half-mark arithmetic (integer half-units) for school papers; new all-paper checks on top of v1 (`acceptable` on fill-blank, one-word and transformation items; band rubric on judgement items; caption/alt-text-gives-away-the-answer). Each check is added only if all 6 existing papers already pass it, otherwise it is gated to `kind: "school"` and the case is reported (P0)
  - Acceptance: the existing papers still pass; a decision note per check is recorded in SCHEMA.md
  - Files: validate.js, SCHEMA.md
  - Completed: 2026-10-02 — half-unit arithmetic; acceptable + band-rubric gated to school (existing papers fail: 114 one-word / 120 judgement items), caption-gives-away + asset-path applied to all; review-sheet freshness check
- [x] Task 12: Bad fixtures in `tests/fixtures/school/`, one per new rule, plus `npm run test:fixtures`, which asserts each fixture fails with the expected message (P0)
  - Acceptance: every fixture fails for the stated reason; the 6 existing papers are hash-identical
  - Files: tests/fixtures/school/*, tests/fixtures.js, package.json
  - Completed: 2026-10-02 — tests/fixtures.js 32/32 (27 school bad, 2 chapter bad, good, CLI, real data)

### Phase 3 — Fidelity & review sheets (brief §5–6)
- [x] Task 13: `scripts/fidelity.js`: normalise whitespace, quotes, hyphenation, footers and Devanagari header lines; match every section title, instruction, passage, question and choice against the text cache; hard-fail if total, section count or section marks differ from the intake; report every `fallbackText` use (one line "spNN: 100% fallback" for garbled papers) (P0)
  - Acceptance: runs over all school JSONs present; exit code non-zero on any mismatch
  - Files: scripts/fidelity.js, package.json (`fidelity` script)
  - Completed: 2026-10-02 — scripts/fidelity.js: token-run matching, NFKC, Devanagari/footers dropped, layout+raw caches, intake totals; reports fallback share
- [x] Task 14: Fidelity fixtures: one altered word fails; one wrong section mark fails; a whitespace or quote variant passes (P0)
  - Acceptance: all three behave as stated under `npm run test:fixtures`
  - Files: tests/fixtures/fidelity/*
  - Completed: 2026-10-02 — tests/fidelity-fixtures.js 18/18 incl. one-altered-word, wrong section mark, whitespace/quote variant, fallback, 100% fallback, real sp01/sp03 lines
- [x] Task 15: `scripts/review-sheet.js` generates `sprints/v2/answer-review/spNN.md` (⚑ items first, then in section order: label, question, answer, acceptable, rubric, source, teacherNote); `validate.js` fails if a sheet is missing or out of date (P0)
  - Acceptance: regenerating is idempotent; hand-editing a sheet makes validate fail
  - Files: scripts/review-sheet.js, validate.js
  - Completed: 2026-10-02 — scripts/review-sheet.js renderSheet + --all/--check; validate fails on missing/stale sheet (fixture)
- [x] Task 16: Commit the tooling: schema and validator in one commit, fidelity and review tooling in another (P0)
  - Acceptance: two commits; `npm run validate` and the fixture tests pass; existing paper hashes unchanged
  - Files: —
  - Completed: 2026-10-02 — two commits; semgrep: path-join warnings only, reviewed (inputs regex-checked); npm audit 0

### Phase 4 — Shared pictures (brief §4)
- [x] Task 17: From the intake picture list, draw shared SVGs used by 2 or more papers (labelling diagrams with numbered blanks, no labels shown); view each at 2×; check that alt text does not give the answer away and that no picture shows unsafe behaviour (P1)
  - Acceptance: each shared SVG is listed with the papers and questions that use it; skip with a note if none are shared
  - Files: app/assets/shared-*.svg
  - Completed: 2026-10-02 — 11 shared SVGs: India state map (Natural Earth public domain, India POV boundary; scripts/build-india-map.sh, map-key.js for checking-mode keys), 6 cooking methods + solar cooker, ₹100 front / ₹500 front+back banknotes (SPECIMEN, simplified; scripts/gen-notes.js). tests/assets.js 78/78, each viewed at 2×. Indic scripts need device fonts (Windows/Android/iOS ship them; build host shows tofu)

### Phase 5 — Papers, batch 1 (sp05, sp07, sp01; Gate 0b 2026-10-02)
- [x] Task 18: Write the sub-agent brief (exact copying rules, item-type mapping, wide `acceptable` with Hindi-English, local and regional names, ⚑ rules, teacherNote, picture rules, writes only its own JSON and assets) (P0)
  - Acceptance: brief saved at `sprints/v2/subagent-brief.md`, quoting brief §4 and §6
  - Files: sprints/v2/subagent-brief.md
  - Completed: 2026-10-02 — sprints/v2/subagent-brief.md quotes instruction §4/§6 verbatim (tests/brief.js 50/50 checks quotes, required rules, paths). Added for the brief: source/textbook-text/ch1–5.txt (page+line numbered for sourceRef); item answerAsset (checking-mode key, e.g. map-key.js) and block adaptation (keeps printed instruction verbatim) in SCHEMA/validator/review sheet with fixtures (35/35)
- [x] Task 19: Batch 1 paper A = **sp05**: sub-agent writes JSON and assets → validate + fidelity + sheet → one commit (P0)
  - Files: app/data/evs-spNN.json, app/assets/spNN-*.svg, sprints/v2/answer-review/spNN.md
  - Completed: 2026-10-02 — sp05: 41 items, 25 ⚑, fidelity 87/87 (fallback 12→0 after fidelity.js fix); commit bca8d6b
- [x] Task 20: Batch 1 paper B = **sp07** (same as Task 19; Q. 6 pictures 4–5 accept place/activity names, ⚑ + teacherNote) (P0)
  - Completed: 2026-10-02 — sp07: 37 items, 15 ⚑, fidelity 75/75, 2 new SVGs + map key; commit b2b5e98
- [x] Task 21: Batch 1 paper C = **sp01** (same as Task 19) (P0)
  - Completed: 2026-10-02 — sp01: 37 items, 22 ⚑, fidelity 89/89, 2 new SVGs (Q4 foot redrawn at re-check); commit 4dfe105
- [x] Task 22: Coordinator re-check of batch 1 (not delegated): re-derive every ⚑ answer from the textbook PDFs; sweep every non-⚑ objective item for a missed ⚑ or a narrow `acceptable`; check pictures are drawn, not described; check fallback text against the page images; tighten the sub-agent brief if it under-flagged (P0)
  - Acceptance: corrections committed; re-check notes in `sprints/v2/recheck-batch1.md`. **STOP — batch gate:** parent reads the sheets
  - Files: sprints/v2/recheck-batch1.md, sprints/v2/subagent-brief.md
  - Completed: 2026-10-02 — sprints/v2/recheck-batch1.md; corrections in sp05 Q8e, sp01 Q4/Q8; brief §9 added. Batch gate: owner asked to run on to Task 32; parent reads the sheets before deploy (Task 34 gate)

### Phase 6 — Papers, batch 2
- [ ] Task 23: Batch 2 paper D = **sp04** (as Task 19; 100% fallbackText from the transcript) (P0)
- [ ] Task 24: Batch 2 paper E = **sp03** (as Task 19) (P0)
- [ ] Task 25: Batch 2 paper F = **sp06** (as Task 19) (P0)
- [ ] Task 26: Coordinator re-check of batch 2 (as Task 22). **STOP — batch gate** (P0)
  - Files: sprints/v2/recheck-batch2.md

### Phase 7 — Papers, batch 3
- [x] Task 27: ~~Batch 3 paper G~~ — not needed: sp02 dropped at Gate 0b (duplicate of sp05), so 6 papers fit in 2 batches
- [ ] Task 28: Final cross-paper sweep (after batch 2) across all papers for consistent `acceptable` and ⚑ (as Task 22). **STOP — batch gate** (P0)
  - Files: sprints/v2/recheck-batch3.md

### Phase 8 — App (brief §7)
- [x] Task 29: `build.js`: no hard-coded counts; per-paper totals instead of `config.totalMarks`; unique split filenames (`evs-spNN.json`); a "School Papers" group with short labels (from intake) in confirmed order (P0)
  - Acceptance: build succeeds; the built list shows 6 + 7 papers; the existing paper hashes are unchanged
  - Files: build.js, app/ui/en.json
  - Completed: 2026-10-02 — build.js: per-paper totals, unique split names, sp order, answerAsset inlining, --data-dir/--intake/--review-dir/--out-dir flags; reads only evs-*.json
- [x] Task 30: `app.js` and `styles.css` render labels, headings, topic tags, pictureDescription, SVG pictures, underline spans and ½ marks ("2½") (P0)
  - Acceptance: a school paper renders at 390 px and on desktop, in light, dark and print
  - Files: app/app.js, app/styles.css
  - Completed: 2026-10-02 — School Papers group (shortLabel + printed total), header/title/sections verbatim, adaptation, labels, underline (DOM nodes), pictureDescription, pictures, topics, ½ marks; 390px/dark/print
- [x] Task 31: Checking mode for school papers (answer, acceptable, rubric, model answer, ⚑, teacherNote, the disclaimer line); choice items match on the chosen text, not position; the result uses the printed total; the checking UI is absent from the DOM in practice mode (P0)
  - Acceptance: manual check on one school paper; chapter papers render as before
  - Files: app/app.js, app/ui/en.json
  - Completed: 2026-10-02 — checking mode: answer, acceptable, rubric, model answer, guide, ⚑, teacherNote, answerAsset, disclaimer; absent in practice mode; ½-step marking; text-matched choices; printed total in result. tests/e2e-school.js 56/56; existing e2e 33/33
- [x] Task 32: Commit the app and build changes (P0)
  - Completed: 2026-10-02 — worktree commit a06dc4b cherry-picked as ebcd436; verified on a build of the committed data (9 papers, 475 items, 1157 KB, hash present/plaintext absent); real sp05 practice + checking (map key) checked in browser

### Phase 9 — Test & deploy (brief §8)
- [ ] Task 33: e2e: counts come from the data, not hard-coded; new school-paper spec (practice, checking, marking ½ marks, result shows the printed total, no answers in the DOM in practice mode) (P0)
  - Acceptance: full suite green; screenshots at 390 px, dark and print reviewed
  - Files: tests/e2e.js, tests/e2e-school.js
- [ ] Task 34: Deploy config: retire `deploy/check.js` and `deploy/expected.json`; root `vercel.json` stops rebuilding on Vercel without the secret; single-file `npm run build` + CLI deploy documented in the README (P0)
  - Acceptance: a dry run (`vercel build` or a preview deploy) serves `index.html` only. **STOP — owner approves the production deploy**
  - Files: vercel.json, deploy/*, README.md
- [ ] Task 35: Production CLI deploy (token from `.env.local`, never echoed); live check in a real browser: one chapter paper and the agreed school paper, both modes, phone and desktop (P0)
  - Acceptance: live checks pass; the live `index.html` SHA-256 equals the local `dist/index.html`
  - Files: —
- [ ] Task 36: After the owner has checked the site: delete the 6 `mily-evs-data-*` Vercel projects (P1)
  - Acceptance: owner confirms in chat before the deletion; the site still loads afterwards

### Phase 10 — Walkthrough (brief §8.9)
- [ ] Task 37: `sprints/v2/WALKTHROUGH.md`: per-paper table (sp, source, total, sections, items, ⚑ actual vs estimate, fallback share); every teacherNote; adapted layouts; pictures; PDF hashes re-checked against the intake; existing JSON hashes re-checked against preflight; the line *"Parent reads every answer review sheet (`sprints/v2/answer-review/spNN.md`) before the child uses each paper."* (P0)
  - Files: sprints/v2/WALKTHROUGH.md
