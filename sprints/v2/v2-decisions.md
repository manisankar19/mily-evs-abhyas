# EVS v2 Sprint — Decisions & Context (2026-10-02)

**All decisions locked. 7 EVS papers (2.1.3 Maths excluded). Ready for `/prd`.**

---

## Papers (7 EVS — exclude 1 Maths)

7 of 8 PDFs in `source/samples/` are EVS. `2.1.3` is Maths and excluded. Texts are readable; images/diagrams will be viewed as page images and redrawn as SVGs.

| sp# | Filename | Type | Readable | Include |
|---|---|---|---|---|
| sp01 | `2.1.1 class 4_twau_ch-3_ws.pdf` | Worksheet (Ch-3) | ✓ | Yes |
| sp02 | `2.1.2 EVS L5.pdf` | Lesson 5 | ✓ | Yes |
| — | `2.1.3 EVS L1 to 7.pdf` | **MATHS** | ✓ | **No** |
| sp03 | `2.1.4 Worksheet_Class-4_TWAU_...` | Worksheet | ✓ | Yes |
| sp04 | `2.1.5 L5 EVS.pdf` | Lesson 5 | ✓ | Yes |
| sp05 | `2.1.6 Worksheet_Class-4_TWAU_...` | Worksheet | ✓ | Yes |
| sp06 | `2.1.7 IV TWAU HY Practice Paper...` | Half-Yearly Practice | ✓ | Yes |
| sp07 | `2.1.8 IV TWAU Revision WS Chap...` | Revision Worksheet | ✓ | Yes |

---

## Paper Order & Titles

- **Order:** Filename order (sp01–sp07, excluding 2.1.3 Maths). No reordering needed.
- **Card titles on site:** Short labels (examples):
  - "Worksheet: Chapter 3"
  - "EVS Lesson 5"
  - "Worksheet: The World Around Us"
  - "Half-Yearly Practice"
  - "Revision Worksheet"

---

## Deployment

- **Current setup:** 7 Vercel projects (1 main + 6 data) with SHA-256 hash gate (`deploy/check.js`).
- **Refactor to:** Single-file CLI deploy (`npm run build` + `npx vercel deploy --prod`).
- **Action:** After v2 is live and verified, delete the 6 old data projects (`mily-evs-data-a` through `-f`).
- **Why:** Simpler, aligns with English site, easier to maintain.

---

## GitHub

- **Commit source PDFs public:** Yes, approved.
- **Action:** Include `source/` and `sprints/v2/` in commits to public repo.

---

## Hard-coded values that will break v2 (must fix in /dev)

1. `validate.js` limits papers to 45–60 items and expects chapter IDs.
   - **Fix:** Allow `kind: "school"` papers with 30–80 items and flexible IDs (evs-spNN-sX-...).
   
2. `validate.js` assumes marks total 100.
   - **Fix:** For `kind: "school"`, accept any total (read from paper JSON).
   
3. `build.js` reads total marks from `PROJECT-CARD.yml` (hardcoded 100).
   - **Fix:** Read from paper JSON per paper.
   
4. `tests/e2e.js` expects 6 papers, 60 items each; Playwright not installed.
   - **Fix:** Update to handle 6 + N school papers; skip Playwright tests or install.

---

## Next Steps

1. Create `source/school-papers/` and move or symlink the 7 EVS PDFs from `source/samples/` (exclude 2.1.3 Maths).
2. Commit `sprints/v2/instruction.md` and `sprints/v2/PRD.md` (already in place).
3. Open a **new Claude Code session** and run `/prd`.
   - The `/prd` skill reads `instruction.md` and `PRD.md` and writes `TASKS.md`.
   - It will ask clarifying questions (you have all answers above).
4. After `/prd` writes `TASKS.md`, run `/dev` to start the work.

---

## Context for /prd session

The PRD has been reviewed and revised. Key changes from the initial draft:
- Deploy refactored from split projects to single-file CLI
- Hard-coded validators identified and flagged for fixing in /dev
- 7 papers are EVS (2.1.3 Maths excluded)
- Deployment refactoring approved; old Vercel projects to be deleted after live test
- GitHub public commit approved

No further PRD revisions needed. Ready to write TASKS.md.

---

## Gate 0b — after intake (2026-10-02, owner)

1. **sp02 (`2.1.2 EVS L5.pdf`) dropped.** At first the owner chose to keep it. The coordinator then showed that it is identical to sp05 (`2.1.6`), checked by text and by viewing page 3 of both, and the owner chose to drop it. The sp numbers are unchanged (sp02 is a gap), so the site shows **6 school papers**: sp01, sp03, sp04, sp05, sp06, sp07.
2. **Drawing, map and annotation items are paper-based.** The child marks them on a printout, and the parent marks them with the rubric in checking mode. There is no tap-to-locate UI this sprint.
3. **sp07 Q. 6 (pictures 4–5):** accept place or activity names, with `answerConfidence: "check"` (⚑) and a `teacherNote`.
4. **Batches:** 1 = sp05, sp07, sp01 · 2 = sp04, sp03, sp06. **Live-check paper: sp05.**

Intake facts (see `source/SCHOOL-PAPERS-INTAKE.md`): the text layers of 2.1.2 and 2.1.5 are garbled (the earlier "readable" note above applies to the page images only); 2.1.5 covers **Chapter 4**, not 5; 2.1.7 is complete (8 of 8 pages, and the header "09" is a miscount); no paper goes beyond Chapter 5.
