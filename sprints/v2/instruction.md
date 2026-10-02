# Instruction — School Papers sprint (`mily-evs-abhyas` v2)

**Your first job:** read this file, `CLAUDE.md`, `PROJECT-CARD.yml`, `SCHEMA.md`, `validate.js` and the latest sprint walkthrough (v1). Run §9, write `sprints/v2/prd.md`, then **stop**.

## 1. Goal
The teacher has given worksheets / practice papers with **no answer keys**. Put each one on the site **exactly as printed**, with authored answers, in a **"School Papers"** group after the chapter papers and mock. Practice mode, checking mode and the result page work as for chapter papers.

## 2. Source
`source/school-papers/` holds the teacher's PDFs (owner places them; never move, rename or edit).
Map them to sp01…spNN by filename order. `source/samples/` is left exactly as it is.

Intake → `source/SCHOOL-PAPERS-INTAKE.md` (+ `intake.json`):
- `pdftotext` every file; **view every page as an image** (`pdftoppm -r 100 -png`) — all of them.
- Per paper: printed title/header, total marks, every section heading and block pattern quoted exactly, chapter(s) covered, every picture/diagram and what the question needs from it, PDF hash.
- Duplicates by extracted text, not bytes.
- Estimated ⚑ count per paper.

## 3. What differs from chapter papers — implement as `"kind": "school"`, not by loosening checks
| Chapter papers | School papers |
|---|---|
| Total 100 | Total = **printed** total |
| Derived section blueprint | Paper's own sections/order/titles, verbatim |
| Original passages; source-window and similarity checks | Copied exactly; those checks skipped |
| Item-count / difficulty-mix targets | None; tag `difficulty` honestly |
| Readability gate | Report only |

Everything else still applies: `acceptable` on fill-blank/one-word/transformation items, band rubric on every judgement item, answerPoints sum to marks, blanks, curly quotes, asset checks, and the caption/alt-text-gives-away-the-answer check.

New fields: `kind`, `sourceFile`, `label` (printed Q1/(a)/(i)), `heading`, `topics`, `pictureDescription`, underline spans, `answerSource: "authored"`, `answerConfidence`, `teacherNote`.

Fractional marks allowed. **Existing papers and fixtures must stay byte-identical and pass unchanged.** The copied-passage check must ignore `source/school-papers/` for chapter papers.

## 4. Replication
- One JSON per paper: `app/data/evs-spNN.json`. Wording, spelling, punctuation and marks copied exactly. Never correct the teacher; never drop a question — use the nearest item type and say so in the block instruction.
- Broken question (typo, duplicate option, bad numbering): keep as printed, add `teacherNote`, accept every defensible reading.
- **Pictures:** original SVGs in `app/assets/`, viewed at 2×. A picture the question asks the child to label, describe or answer from MUST be drawn; text description only for decorative/unrelated pictures. Confirm each picture-dependent question is answerable from your drawing alone.

For EVS diagrams (especially environmental concepts, life cycles, cycles, hierarchies): drawn with numbered blanks for labelling questions, not with all labels shown.

## 5. Fidelity check — `scripts/fidelity.*`, hard fail
Every section title, instruction, passage, question and choice must match the paper's text cache (normalising whitespace, quotes, hyphenation, footers). Total, section count and section marks must match the intake. A `fallbackText` list (read from page images) covers drawn-line blanks and mangled text; every use is reported. Prove it with a one-altered-word fixture.

## 6. Answers
- Textual / Definition: from the chapter PDF in `source/textbook/` (NCERT *Our Wondrous World* Chapters 1–5); record chapter + line in the marking guide.
- Passage: the passage sentence. 
- Diagram/Picture: what your drawing shows.
- Observation / Field work items: based on Class 4 EVS content standards; band rubric scaled to printed marks + short model answer.
- Personal-fill items ("I observe…", "In my area…"): judgement items; any sensible answer that shows understanding.
- `acceptable` lists every answer a Class 4 child could reasonably give for full marks — wide, not narrow. **EVS especially:** common names and synonyms, local/Hindi-English variants a child uses, regional differences in flora/fauna (e.g. different names for animals/plants by region).
- `answerConfidence: "check"` (⚑) whenever the answer rests on judgement. Flag any answer where a child could reasonably use a different word or concept.
- MCQ with two defensible options: accept both, `teacherNote`.
- No defensible answer at all → list it and ask (hard stop). Uncertain → ⚑, not a stop.
- Review sheet per paper `sprints/v2/answer-review/spNN.md`, ⚑ items first, generated from the JSON and checked against it by the validator.

## 7. App
- "School Papers" group, in owner-confirmed order, printed title and total shown.
- Paper page renders labels, headings, topics, pictureDescription, pictures, underlines, half marks.
- Checking mode (school papers): answer, acceptable, rubric, model answer, ⚑, teacherNote, and the line *"Answers written for practice, not by the teacher — ⚑ marks ones worth a second look."*
- Result uses the printed total. Choice items match on chosen text, not position.
- Existing login (user: `Mily`, password: `2026`) + checking secret gate it; no new passcode. `build.js` has no hard-coded counts.

## 8. Tasks (for /prd)
1. Intake (all pages viewed, hashes, duplicates, ⚑ estimates)
2. Schema + `validate.js` school kind, bad fixtures; existing fixtures unchanged
3. Fidelity check + review-sheet generator, with fixtures
4. Shared pictures/icons, if several papers use them
5. Papers in batches of 3 — one sub-agent per paper, writing only its own JSON + assets; validate + fidelity + sheet; one commit per paper. No-picture papers first, long picture-heavy papers last. **Stop at every batch gate** for the parent to read the sheets.
6. Coordinator re-check after EACH batch (not only at the end): re-derive every ⚑ answer, sweep every non-⚑ objective item for missed ⚑ or narrow `acceptable`; tighten the sub-agent brief if it under-flags. Not delegated.
7. App changes; build
8. e2e (existing suite + one school-paper spec), CLI deploy after owner approval, live check
9. Walkthrough: ⚑ count per paper, every teacherNote, adapted layouts, pictures, fallback count, PDF hashes re-checked; states that the parent reads every review sheet before the child uses it.

## 9. Preflight
- Tools present; `source/school-papers/` count; `git status` clean; `npm run validate` passes
- Vercel token → HTTP 200 only; live URL loads
- Never print a secret
- Verify GANESH_EVS env var is set (hashed in index.html, not plaintext)
- Check that existing chapter papers (ch1–ch5 + half-yearly) still work in both practice and checking modes

## 10. Hard stops
- Unreadable file
- A picture-dependent question that can't be drawn well enough to answer
- A question with no defensible answer
- School papers would weaken a check on existing papers
- A secret would be printed or committed
- An existing paper fails `npm run validate`

---

## Setup

```bash
cd /home/ec2-user/research/projects/home-application/mily/mily-evs-abhyas
mkdir -p source/school-papers sprints/v2/answer-review
# Place teacher PDFs in source/school-papers/
git status  # Verify no uncommitted changes
```
