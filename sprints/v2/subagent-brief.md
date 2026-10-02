# Sub-agent brief: author ONE school paper (sprint v2, Tasks 19–25)

You are authoring **one** teacher's paper, spNN, as `app/data/evs-spNN.json` for the Class 4 EVS practice site at
`/home/ec2-user/research/projects/home-application/mily/mily-evs-abhyas`. The coordinator gives you the sp number
and any notes specific to your paper. This brief is binding. Where it is silent, `SCHEMA.md` is binding.

## 0. Scope: what you may touch
- **Write only your own files:** `app/data/evs-spNN.json`, new pictures `app/assets/spNN-*.svg`, answer-key maps made by
  `scripts/map-key.js` (`app/assets/spNN-map-key.svg`), and the generated sheet `sprints/v2/answer-review/spNN.md`
  (always produced by `scripts/review-sheet.js`, never written by hand). Work with only your own files.
- Never modify: other papers, `app/assets/shared-*.svg`, scripts, tests, `validate.js`, `SCHEMA.md`, `source/**`, `sprints/**` (except your own sheet).
- **Do not commit.** The coordinator re-checks your paper and commits it.
- Never print or read `.env.local`.

## 1. Read first
1. `SCHEMA.md`: every field, the school rules, and the Decisions section.
2. Your intake: `source/intake/spNN.json` and `source/intake/spNN.md` (verbatim headings, marks, pictures, issues, ⚑ estimate).
   For a garbled paper, also `source/intake/spNN-transcript.txt`.
3. Your text cache: `source/text-cache/spNN.txt`. **Look at every page image** `source/page-images/spNN-hi-P.png` with the Read tool, before you write anything and again when you check. The page image is the authority.
4. Owner decisions: `sprints/v2/v2-decisions.md`, section "Gate 0b". Drawing, map and "encircle" items are **paper-based**: the child does them on the printout, and the parent marks them with your rubric.
5. Shared pictures: `app/assets/shared-manifest.json`. Reuse these rather than redrawing them.
6. Textbook text with page and line numbers: `source/textbook-text/ch1.txt` … `ch5.txt` (NCERT *Our Wondrous World*, Class 4).
   Cite it as `sourceRef: "Ch 5 (deev105), p.3 l.14"` (p = PDF page, l = line within that page, as numbered in the file).

## 2. The rules from the brief (instruction §4 and §6, verbatim)

## 4. Replication
- One JSON per paper: `app/data/evs-spNN.json`. Wording, spelling, punctuation and marks copied exactly. Never correct the teacher; never drop a question — use the nearest item type and say so in the block instruction.
- Broken question (typo, duplicate option, bad numbering): keep as printed, add `teacherNote`, accept every defensible reading.
- **Pictures:** original SVGs in `app/assets/`, viewed at 2×. A picture the question asks the child to label, describe or answer from MUST be drawn; text description only for decorative/unrelated pictures. Confirm each picture-dependent question is answerable from your drawing alone.

For EVS diagrams (especially environmental concepts, life cycles, cycles, hierarchies): drawn with numbered blanks for labelling questions, not with all labels shown.

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

## 3. Copying exactly (this is what `scripts/fidelity.js` checks)
- `title`: the printed title line(s). `header`: each printed header line, Hindi included, verbatim. `subtitle`: a short English line such as "Worksheet — Class IV — Chapter 5".
  `shortLabel`: as in the intake. `sp`, `sourceFile` and `chapters` come from the intake.
- `sections`: exactly the intake's sections, in order, with the same count and marks. Each `title` (and `heading`) is the printed heading, verbatim, e.g. "Section – A : OBSERVATION AND REPORTING ( 15 marks )".
  For a paper without section headings, follow the intake's codes ("1", "2", …) and use the printed question heading.
- One **block** per printed question number. `num` is the printed number exactly ("Q1", "1.", "Q. 6", "1V."). `instruction` is the printed instruction verbatim, **including** its printed marks, e.g. "( 6 x 1 = 6 )".
- One **item** per printed part. `label` is the printed part label ("a.", "(i)", "2."). `q` is the printed question text **without** the label, verbatim: spelling, capitals, punctuation and typos included. Write blanks as "______".
  Bracketed choices printed after a blank, such as "( Kerala / Karnataka )", belong in `options`, not in `q`.
- Never correct the teacher. A typo, odd numbering, a missing space ("10.Circle") or wrong marks stay exactly as printed, and the item gets a `teacherNote` saying what is odd and how it is marked.
- Fidelity normalises case, quotes, dashes, whitespace and blanks, and drops Devanagari. Every other word must appear in the text cache in the same order.
  Where the text cache lacks the text (drawn-line blanks, text inside pictures, mangled characters, or the **whole paper when the text layer is garbled**), add a `fallbackText` entry
  `{ where, field, text, reason }` whose `text` equals the JSON string exactly, read from the page image (or from the transcript, checked against the image). Keep entries to what is needed: every use is reported.
- Marks: copy the printed marks. ½ marks are fine (0.5 steps), and the validator compares them in half-units. If the per-part marks are not printed, split the printed block total evenly and say so in `teacherNote`.

## 4. Item types: the nearest type, and when to say so
| Printed pattern | `type` | Notes |
|---|---|---|
| Fill in the blank with printed choices "( A / B )" | `mcq` | `options` = the printed choices in order; `answer` = the right one |
| Fill in the blank, no choices | `fill-blank` | `acceptable` required |
| True / False | `true-false` | `answer` "True" or "False", plus "— corrected: …" if the paper asks for a correction |
| Odd one out / encircle the odd one | `mcq` | options = the printed words; if two are defensible, `answer` is an array plus a `teacherNote` |
| Match the columns | `match` | `pairs` in printed left order; ½ per pair if printed so |
| Name the following / one word / Who am I? | `one-word` | `acceptable` required |
| Give two examples / name any two | `one-word` | `answer`: "Any two of: …"; `acceptable`: every valid example; `markingGuide`: "½/1 per correct example" |
| Short / long answer, give reasons, differences | `short` / `long` | `answerPoints` summing to the marks, **and** a `rubric` (full / partial / none) |
| Table to complete | one item per row or cell group | follow the printed marks |
| Draw / draw and name | `draw` | **paper-based**: `markingGuide`, `rubric`, `modelAnswer` |
| Locate / mark on the map | `diagram-label` | **paper-based**: stimulus = the shared map; `answerAsset` = your key from `map-key.js`; `markingGuide` describes where each state is |
| Encircle on a picture, word search | `activity` or `diagram-label` | **paper-based**: rubric + markingGuide |
| Unscramble a word | `one-word` | `acceptable` includes the defensible readings of a misprinted jumble |

Whenever you adapt (nearest type, paper-based task, a table split into items), set the block's `adaptation` to one plain sentence for the child and parent,
e.g. "Do this on the printed sheet; your parent marks it." or "Each row of the table is asked separately here." The printed `instruction` stays verbatim.

## 5. Answers
- **Sources:** textbook facts come from `source/textbook-text/` (one file per chapter) with a `sourceRef`. Picture answers are what **your drawing** shows. For anything beyond the textbook (some papers ask about an electrician, a dragonfly, a termite, the national emblem), use Class 4 EVS content standards, and set ⚑ with `sourceRef: "Class 4 EVS content standard (not in textbook)"`.
- **acceptable: wide, not narrow.** Include singular and plural forms, spelling variants a child writes ("idly"/"idli", "Bihu"/"Bhogali Bihu"), common names and synonyms ("gaur"/"Indian bison"), Hindi-English and local names ("haldi"/"turmeric", "chawal"/"rice", "bajra"/"pearl millet"), and regional differences in names of plants, animals and foods.
  Think about what a nine-year-old in a different Indian state would write.
- **⚑ `answerConfidence: "check"`** whenever the answer rests on judgement, a child could reasonably use a different word or concept, the printed question is ambiguous, two options are defensible, the answer is not in the textbook, or the item is paper-based. Otherwise use `"sure"`.
  **Under-flagging is the failure mode the coordinator looks for. When in doubt, flag it.**
- `answerSource: "authored"` on every item. `difficulty` is easy / medium / hard, judged honestly for a Class 4 child.
  `topics`: 1–3 short tags (e.g. "food", "tastes", "Ugadi").
- **Judgement items** (short, long, draw, activity, or ⚑ items over 1 mark) need a `rubric` with exactly one `full` band equal to the marks, plus partial/none bands with clear descriptors, and a short `modelAnswer`.
- Every item over 1 mark needs `answerPoints` (or `markingGuide`) summing to the marks.
- **No defensible answer at all → hard stop:** keep the item exactly as printed (never drop a question), give your best answer with ⚑, finish everything else, and list it under "HARD STOP" in your final report so the owner can decide. Uncertain answers are ⚑, not a stop.

## 6. Pictures
- A picture the question needs (to answer from, label, describe or encircle) **must be drawn**. Use `pictureDescription` only for decorative pictures (the logo, a border).
- **Shared first:** if `app/assets/shared-manifest.json` lists a picture for your question, use `"stimulus": { "asset": "assets/shared-….svg", "caption": "…", "alt": "…" }`.
- **Several pictures in one question** (one per part): draw **one** SVG `app/assets/spNN-qN.svg` with **numbered panels** (1, 2, 3 … in printed order, with the number in a circle in each panel's corner).
  Label the items "(1)", "(2)" … to match, or use the printed labels if the paper prints them. Labelling diagrams use numbered blanks, never the labels themselves.
- **Maps:** stimulus `assets/shared-india-states.svg`. Make the key with `node scripts/map-key.js app/assets/spNN-map-key.svg IN-AP IN-KA …` (state codes are in the map's ids) and set it as the item's `answerAsset`.
- Your own SVGs are original, hand-authored (never traced from the page image): flat, clean outlines, a viewBox around 400×300 per panel, no text that gives the answer, a neutral `<title>`, no scripts and no external references, under 60 KB.
  Captions and alt text must not contain the answer or any `acceptable` string (`validate.js` checks this).
- **Look at every picture you draw at 2×** and confirm the question can be answered from the drawing alone. Render it into your scratch directory and Read the PNG:
  `node -e "const{chromium}=require('playwright'),fs=require('fs');(async()=>{const b=await chromium.launch(),p=await b.newPage({deviceScaleFactor:2});await p.setContent('<img style=width:560px src=data:image/svg+xml;base64,'+fs.readFileSync(process.argv[1]).toString('base64')+'>');await p.screenshot({path:process.argv[2]});await b.close()})()" app/assets/spNN-qN.svg /path/to/scratch/spNN-qN-2x.png`

## 7. Loop until green (run them in this order)
1. `node scripts/review-sheet.js spNN` (regenerate after **every** JSON edit; `validate.js` fails on a stale sheet)
2. `node validate.js app/data/evs-spNN.json`
3. `node scripts/fidelity.js spNN` (fix wording until every string matches or is a justified `fallbackText`)
4. `node scripts/hash-existing.js --check` (the 6 existing papers must stay byte-identical)
5. Re-read your sheet `sprints/v2/answer-review/spNN.md` as the parent would: is every ⚑ there, and is every `acceptable` list wide enough?

## 8. Final report (≤ 25 lines)
- Items, total, sections; ⚑ count (actual vs the intake estimate)
- Every `teacherNote` (one line each) and every block `adaptation`
- Pictures: shared ones used, new SVGs drawn (file + what), and confirmation that each was viewed at 2×
- Fidelity line (`X/Y matched, F fallback`) and why each fallback was needed
- Any HARD STOP items, with the question and why no answer is defensible
- Anything the coordinator should re-derive

## 9. Lessons from batch 1 (coordinator, after re-check)
- `scripts/fidelity.js` now matches printed marks with or without spaces ("(6x1=6 )" = "( 6 x 1 = 6 )") and number-only options ("6"). Do not add fallbackText for these. After fidelity passes, run `node scripts/prune-fallback.js spNN` to drop any entries that are no longer needed, then regenerate the sheet.
- The paper `title` and `header` are not fidelity-checked: never add a fallbackText entry for them (validate rejects `where: "title"`).
- **Picture-naming items:** if you accept a general name for one picture ("bird"), accept the matching general name for every picture in that block ("insect", "animal"), and mark those items ⚑.
- **Every drawn object must show its defining features** so that it cannot be mistaken for something else: a webbed foot needs separate toes with the web between them; a cooking method needs its vessel and heat source. Look at it at 2× and ask: "would a nine-year-old name this correctly?"
- Panel numerals: circle radius at least 27 and font size 28 (in a ~400-wide panel), so they read at phone width.
- Printed signboards in a scene (e.g. "SCHOOL") may be kept when the printed picture has them.
- Over-flagging is fine; consistency matters more. If two similar items differ in ⚑, say why in the teacherNote.
- **Match items:** pair texts keep their printed labels ("a) Tumri", "1. Walk and relax"), and `printedRight` lists the printed right column in printed order. Pair texts are fidelity-checked (a fallbackText `field` of `"pair"` is allowed).
