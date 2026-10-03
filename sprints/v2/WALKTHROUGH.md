# Sprint v2: Walkthrough (School Papers)

**Parent reads every answer review sheet (`sprints/v2/answer-review/spNN.md`) before the child uses each paper.**

## Summary
The teacher's worksheets and practice papers are on the live site as a **School Papers** group,
below the six chapter-wise papers, which are all kept. Each school paper is copied exactly as
printed: wording, typos, numbering and marks. Every answer was authored and marked ⚑ where it
rests on judgement. Every picture a question needs was drawn as an original SVG. The site is now
one self-contained file, deployed by the Vercel CLI and verified byte-for-byte.

- **Live:** https://mily-evs-abhyas.vercel.app (production deployment `mily-evs-abhyas-6du8yxz73`, `index.html` sha256 `856d8f9cf51df160…`)
- **On the site:** 12 papers. That is 6 chapter-wise (ch1–ch5 + Half-Yearly mock, unchanged from v1) and 6 school papers (sp01, sp03, sp04, sp05, sp06, sp07).
- **School papers:** 320 marks and 253 items, of which 171 are ⚑. There are 114 teacherNotes and 37 adapted layouts.
- **Owner sign-off (2026-10-02):** "answers are correct" and "the website is working satisfactorily".

## Decisions taken during the sprint
| When | Decision |
|---|---|
| Gate 0 | 7 of the 8 PDFs in `source/samples/` are EVS, and `2.1.3` (Maths) is excluded. The PDFs were copied, not moved, to `source/school-papers/`. |
| Gate 0b | **sp02 (`2.1.2 EVS L5.pdf`) dropped**: it is identical to sp05 (text diff, and page 3 compared by eye). The sp numbers are unchanged, so sp02 is a gap. Map, drawing and "encircle" questions are **paper-based** and the parent marks them with a rubric. sp07 Q. 6 pictures 4–5 accept place names (⚑). Live-check paper: sp05. |
| Batch gates | The owner asked to run Tasks 19–32 straight through. The coordinator re-check still ran after each batch (`recheck-batch1.md`, `recheck-batch2.md`). The owner then reviewed and confirmed the answers. |
| ₹500 language count | Settled as authored: 2 / 15 / 17 are all accepted, with ⚑. |
| Task 36 | After the owner's live check, the unused v1 hosting projects `mily-evs-data-a…f` were deleted. **All 12 papers stay on the site** (owner instruction). |

## Architecture
```
source/school-papers/*.pdf ─pdftotext─► source/text-cache/ ─┐
          └─pdftoppm─► page images (gitignored) ─► source/intake.json ─┤
                                                                       ▼
  sub-agent per paper (sprints/v2/subagent-brief.md) ─► app/data/evs-spNN.json + app/assets/spNN-*.svg
                                                                       │
     validate.js (kind:"school" rules; chapter rules unchanged) ◄──────┤
     scripts/fidelity.js (every printed string vs the text cache) ◄────┤
     scripts/review-sheet.js ─► sprints/v2/answer-review/spNN.md ◄─────┘ (validate fails if stale)
                                                                       ▼
     build.js ─► dist/index.html (one file: 12 papers, pictures stored once, code as SHA-256 only)
                                                                       ▼
     scripts/deploy.sh --prod ─► Vercel (prebuilt upload) ─► scripts/verify-live.js (live bytes = tested bytes)
```
- **Schema:** `SCHEMA.md` covers both kinds. School-only fields: `kind`, `sp`, `sourceFile`, `shortLabel`, `header`, `label`, `heading`, `topics`, `pictureDescription`, `underline`, `answerSource`, `answerConfidence`, `teacherNote`, `fallbackText`, `answerAsset`, `adaptation`, `printedRight`. Marks are compared in half-units.
- **App:** a School Papers group with the printed totals. Checking mode shows the answer, also-accept list, rubric, model answer, marking guide, ⚑, teacherNote, the answer map and the disclaimer line. All of these are absent from the page in practice mode. Topic tags are never shown in either mode (**Superseded in v3**: v2 showed them in checking mode; see `sprints/v3/`). Marking is in ½ steps, choice items match on the chosen text, match tables appear exactly as printed, and the result uses the printed total.
- **Deploy:** `vercel.json` disables Git deployments and source builds. `scripts/deploy.sh --dry-run|--preview|--prod` stages exactly `index.html` plus a static `vercel.json`. The v1 split deploy and its hash gate are retired.

## Verification
| Check | Result |
|---|---|
| `npm run validate` | 12 papers, 613 items |
| `npm run fidelity` | 6 school papers; every printed string matches the PDF text or a reported fallback |
| `npm run test:fixtures` | validator 36/36, fidelity 22/22 (incl. one altered word, a wrong section mark, "6x1"/"5M" spacing, number-only options, match pairs) |
| `npm run test:assets` / `test:brief` / `test:build` / `test:deploy` | 78/78 · 51/51 · 24/24 · 10/10 |
| `npm run test:e2e` | e2e 46/46 (counts from the data; every school paper in both modes; every picture loads), e2e-school 58/58 |
| `npm run test:live` on production | **16/16**: ch3 and sp05, practice and checking mode, phone 390 px and desktop 1280 px, answer maps load, no console errors, no plaintext code |
| `node scripts/verify-live.js` | production serves the tested `index.html` byte-for-byte |
| `node tests/walkthrough.js` | this document agrees with the data, hashes and pictures |
| `npm audit` | 0 vulnerabilities. semgrep findings are path-join warnings on regex-checked or constant paths and a localhost test server; all reviewed. |

**Coordinator re-checks** (not delegated): every ⚑ answer was re-derived against `source/textbook-text/`, and every non-⚑ objective item was swept. Every picture was viewed at 2×. All 54 sp04 strings, typed from the page images because its text layer is garbled, were compared against the 4 page images. The sp03 word search was re-searched independently. Every map key was checked against the printed state list. Questions repeated across papers were made consistent.

### Found and fixed during the sprint
- **Answer leak:** topic tags such as "community" (sp07 Q1) showed in practice mode. v2 hid them in practice mode only. **Superseded in v3**: the tags also hinted the answer in checking mode before "Show answer", so they are no longer shown at all (`sprints/v3/`).
- **Match questions** did not appear as printed: the app added labels and its own order, and the shuffle returned the answer order for 7 pairs. Fixed with `printedRight`, and pair texts are now fidelity-checked.
- **Fidelity false alarms:** number-only options, "6x1", and "5M" caused 15 unneeded fallback entries (12 in sp05, 3 in sp06), which have been removed.
- **Pictures:** sp01's webbed foot was redrawn (it read as a leaf) and the sp06 hornbill was fixed.
- **Answers:** sp06 Q6b no longer accepts ragi. sp01 Q8 accepts general class names consistently.
- **Consistency merge:** an early merge wrongly joined "value of the note" (₹100 vs ₹500). `validate.js` caught it, and it was reverted and redone with an answer-equality rule.
- **Page size:** each picture was inlined once per item, making a 3.1 MB page. It is now stored once: 1.18 MB.

## What was NOT verified by the build agent
- **Hindi text and the ⚑ symbol on a real phone.** The build host has no Devanagari font, so its screenshots show empty boxes. The owner's own screenshot shows the Hindi rendering correctly on their device.
- **Printing to paper** was checked with print-media emulation only, not on a printer. Paper-based items (maps, drawings, encircling, the word search) rely on the printout.
- The parent's per-paper sheet review is a human step and cannot be automated (see the rule at the top).

## Known limitations
- Map, encircle, drawing and word-search items are done on paper. The parent marks them with the rubric and the answer-key map (Gate 0b).
- sp03 Q10's printed underline falls on words in a block *instruction*. The schema supports underline only on item `q`, so this is recorded in a teacherNote.
- The six v1 chapter papers keep their v1 rules. The new `acceptable` and band-rubric checks apply only to school papers, because all six existing papers would fail them (see `SCHEMA.md` → Decisions).
- Pictures with Indian scripts (the banknotes) depend on device fonts.
- Vercel preview deployments append a feedback-toolbar script. `verify-live.js --vercel-curl` strips exactly that tag. Production is compared strictly.

## What's next
- If the teacher sends new worksheets: drop the PDF into `source/school-papers/`, run intake, and follow `sprints/v2/subagent-brief.md`. Then run `npm run test:e2e` and `scripts/deploy.sh --prod`.
- An optional on-screen map/encircle mode, so those items can be answered on the device.
- Underline support in block instructions (sp03 Q10).

## Data (generated, do not edit by hand)
<!-- generated:start (node scripts/walkthrough-tables.js) -->

### Papers

| sp | Source file | Total | Sections | Items | ⚑ actual / intake estimate | Fallback strings |
|---|---|---|---|---|---|---|
| sp01 | `2.1.1 class 4_twau_ch-3_ws.pdf` | 40 | 3 | 37 | 22 / 18 | 0 of 95 (0%) |
| sp03 | `2.1.4 Worksheet_Class-4_TWAU_Sept'25 HYE.pdf` | 80 | 3 | 53 | 40 / 16 | 0 of 95 (0%) |
| sp04 | `2.1.5 L5 EVS.pdf` | 40 | 10 | 34 | 30 / 15 | 64 of 64 (100%) |
| sp05 | `2.1.6  Worksheet_Class-4_TWAU_August'25 L-5.pdf` | 40 | 3 | 41 | 25 / 11 | 0 of 99 (0%) |
| sp06 | `2.1.7 IV TWAU HY Practice Paper-2.pdf` | 80 | 3 | 51 | 39 / 12 | 6 of 105 (6%) |
| sp07 | `2.1.8 IV TWAU Revision WS Chapters 1 & 2.pdf` | 40 | 9 | 37 | 15 / 11 | 0 of 85 (0%) |
| **Total** | 6 papers | 320 | | 253 | 171 | 70 of 543 |

### Source PDFs: SHA-256 re-checked against the intake

| sp | File | SHA-256 now | Matches intake | Status |
|---|---|---|---|---|
| sp01 | `2.1.1 class 4_twau_ch-3_ws.pdf` | `2dfa74c2057bddab85f79c4fcf704063cd508bb70f3b7a5fa55c71e4bf43c55b` | yes | include |
| sp02 | `2.1.2 EVS L5.pdf` | `4fd92bb601d2df28badcf196220fc3b09e2421dbee5fce322d93eec47d9883cf` | yes | excluded-duplicate-of-sp05 |
| sp03 | `2.1.4 Worksheet_Class-4_TWAU_Sept'25 HYE.pdf` | `81906ffa9c9eff201db36bda855671991d885ebd73d185a538281a4dcee0d57b` | yes | include |
| sp04 | `2.1.5 L5 EVS.pdf` | `6e86fa42c38d6a99cc47a3d5801bcba9ad754ccd8e2578429a59a544492b32c2` | yes | include |
| sp05 | `2.1.6  Worksheet_Class-4_TWAU_August'25 L-5.pdf` | `c7ddd4b606d2aacdac43aeedf3d5ca63c9fd0f56fc28ff495718084b631c066d` | yes | include |
| sp06 | `2.1.7 IV TWAU HY Practice Paper-2.pdf` | `ffda89d33ed6307a0a6851e2a3d65f195692f937471c09a12d44cca84213f5ae` | yes | include |
| sp07 | `2.1.8 IV TWAU Revision WS Chapters 1 & 2.pdf` | `881d24c0400c9064be686fe662131b9ec5163664ff09e93717e55a2ce77ecc86` | yes | include |

### Existing papers: byte-identical to preflight

| File | SHA-256 (preflight = now) | Identical |
|---|---|---|
| `app/data/evs-ch1.json` | `20dfafd12c7bd90da0e0c88b13dcfcb17a657ff76bcbfee96ee0f07bde1da686` | yes |
| `app/data/evs-ch2.json` | `121ac6c378877b2df834f053378855a1ccadc5fed548491fb0ef971e6da22452` | yes |
| `app/data/evs-ch3.json` | `06233f72b027a9c1b532fa13d435977055ae126e14fac0474f2f3fffa4ecc828` | yes |
| `app/data/evs-ch4.json` | `82aed6cc5a141b064d93e2d981a51115dd21d4b4fa7c1c7248b3a4ed34b557f7` | yes |
| `app/data/evs-ch5.json` | `0dd69476f1bce80b8858e5b70b34549ac1938ce1b375375b10b52a335194f62e` | yes |
| `app/data/evs-hy.json` | `5fbafc1d7e3b3968efce88573ad09b143b35ec347a32933b2ffbb84615f44ffd` | yes |

### Pictures

| File | What it shows | Used by |
|---|---|---|
| `shared-cook-baking.svg` | Oven with a tray of muffins, heat inside (baking) | embedded in composites (sp03 Q4, sp06 Q4) |
| `shared-cook-barbecue.svg` | Round charcoal barbecue on legs with food on the grate, glowing coals (grilling/roasting) | embedded in composites (sp06 Q4) |
| `shared-cook-boiling.svg` | Open pot of bubbling water with eggs/potatoes under the water on a stove (boiling) | embedded in composites (sp06 Q4) |
| `shared-cook-frying.svg` | Frying pan with oil and two cutlets on a gas stove (frying) | embedded in composites (sp03 Q4, sp06 Q4) |
| `shared-cook-oven-grill.svg` | Oven with food on a grill rack under a glowing top element (grilling/roasting) | embedded in composites (sp06 Q4) |
| `shared-cook-steaming.svg` | Covered pot with a perforated tray of idlis over boiling water, steam escaping (steaming) | embedded in composites (sp03 Q4, sp06 Q4) |
| `shared-india-states.svg` | Outline political map of India with state and UT boundaries, no names; Lakshadweep and Andaman & Nicobar included; official boundary of India (Natural Earth India point-of-view, public domain) | sp03 Q15 (picture); sp04 X. (picture); sp05 11. (picture); sp06 Q15 (picture); sp07 Q.10 (picture) |
| `shared-note-100-front.svg` | Simplified original drawing of a ₹100 note front: 'RESERVE BANK OF INDIA' in Hindi and English, ₹100, portrait oval, Ashoka Lion Capital emblem at the right; marked SPECIMEN | sp03 Q5 (picture) |
| `shared-note-500-back.svg` | ₹500 back: Red Fort outline, Swachh Bharat spectacles logo, language panel with the denomination written in 15 languages, SPECIMEN | embedded in composites (sp06 Q5) |
| `shared-note-500-front.svg` | Same template, ₹500 front, SPECIMEN | embedded in composites (sp06 Q5) |
| `shared-solar-cooker.svg` | Box-type solar cooker: black box, glass lid, mirror reflector propped open, two dark pots inside, sun with rays | embedded in composites (sp03 Q1, sp06 Q1) |
| `sp01-q4.svg` | Question 4: three numbered pictures | sp01 4. (picture) |
| `sp01-q8.svg` | Question 8: five numbered pictures | sp01 8. (picture) |
| `sp03-map-key.svg` | Answer key map: 5 states shaded | sp03 Q15 (answer key) |
| `sp03-q1.svg` | Question 1: five numbered pictures | sp03 Q1 (picture) |
| `sp03-q14.svg` | Question 14: letter grid | sp03 Q14 (picture) |
| `sp03-q4.svg` | Question 4: three numbered pictures | sp03 Q4 (picture) |
| `sp04-map-key.svg` | Answer key map: 3 states shaded | sp04 X. (answer key) |
| `sp04-q1.svg` | Four numbered scenes | sp04 1. (picture) |
| `sp05-map-key.svg` | Answer key map: 3 states shaded | sp05 11. (answer key) |
| `sp06-map-key.svg` | Answer key map: 5 states shaded | sp06 Q15 (answer key) |
| `sp06-q1.svg` | Question 1: five numbered pictures | sp06 Q1 (picture) |
| `sp06-q10.svg` | Question 10: five numbered pictures | sp06 Q10 (picture) |
| `sp06-q4.svg` | Question 4: six numbered cooking pictures | sp06 Q4 (picture) |
| `sp06-q5.svg` | Question 5: a banknote, front and back | sp06 Q5 (picture) |
| `sp07-map-key.svg` | Answer key map: 3 states shaded | sp07 Q.10 (answer key) |
| `sp07-q6.svg` | Five numbered pictures | sp07 Q. 6 (picture) |
| `sp07-q7.svg` | A neighbourhood scene with people at work | sp07 Q.7 (picture) |

### Adapted layouts (block `adaptation`, shown under the printed instruction)

**sp01**

- 1.: Choose the option that fills the blank.
- 3.: Choose the odd one here instead of circling it.
- 4.: The three printed pictures are drawn here as panels i, ii and iii; match each one to a, b or c.
- 7.: Write two names for each part; each correct name gets ½ mark.
- 8.: The five printed pictures are drawn here in one picture as panels 1 to 5; name each one.
- 9.: Do this on the printed sheet; your parent marks it.

**sp03**

- Q1: The five printed pictures are drawn here in one picture as panels 1 to 5; panel 1 goes with question 1), panel 2 with 2), and so on.
- Q3: Write two examples for each part; each correct example gets ½ mark.
- Q4: The three printed pictures are drawn here as panels 1 to 3; write the method of cooking for each panel.
- Q5: The printed note is drawn here as a simplified front of the note. Part e) is done on the printed sheet: circle the emblem on the note there; your parent marks it.
- Q8: Choose the odd one out here, or circle it on the printed sheet.
- Q10: Each row of the printed table is asked separately here; write one thing for earlier times and one for the present time (½ mark each).
- Q14: Do this on the printed sheet: circle the words in the grid there; your parent marks it (½ mark for each food word).
- Q15: Do this on the printed sheet: mark and name each state on the map; your parent marks it with the answer-key map.

**sp04**

- 1.: The four printed pictures are drawn as panels 1 to 4: panel 1 goes with a) At home, 2 with b) At school, 3 with c) In parks and 4 with d) In our locality. Write one or two ways for each place.
- 111.: Match each item on the left with the right meaning; the printed right-hand column is jumbled.
- V1.: Write two examples for each part; each example gets ½ mark.
- V111.: Part 2 is an unfinished sentence: finish it by writing what happens.
- 1X.: Each row of the printed table (Activities \| Collected from nature, four blank cells) is asked separately here: write up to four things from nature for each activity.
- X.: Do this on the printed sheet: mark and name each state on the map; your parent marks it with the answer map.

**sp05**

- 1.: Each gap has two printed choices; pick the right one.
- 5.: The printed table has one column for each food type; each column is asked separately here.
- 6.: Each taste in the printed table is asked separately here; write one food for each.
- 7.: Do this on the printed sheet (one junk food in each box, with its name on the line); your parent marks it.
- 10.: Choose the odd one out here, or circle it on the printed sheet.
- 11.: Do this on the printed sheet: mark and name each state on the map; your parent marks it with the answer map.

**sp06**

- Q1: The five printed pictures are drawn here in one picture as panels 1 to 5; each question has two parts, 1 mark each.
- Q3: Write two examples for each; each correct example gets ½ mark.
- Q4: The six printed pictures are drawn here as panels 1 to 6; match each picture to a name. Each correct pair gets ½ mark.
- Q5: Answer from the drawing of the note. For e), circle the emblem on the printed sheet; your parent marks it.
- Q8: Choose the odd one out here, or circle it on the printed sheet.
- Q10: The five printed pictures are drawn here in one picture as panels 1 to 5; write the name of each one.
- Q14: Do this on the printed sheet; your parent marks it.
- Q15: Do this on the printed sheet: mark and name each state on the map; your parent marks it with the answer map.

**sp07**

- Q3: Unscramble each jumbled word and type the correct word.
- Q. 6: The five pictures are numbered (1) to (5) here; write one answer for each picture. Pictures 4 and 5 show a place, not a worker, so name the place.
- Q.10: Do this on the printed sheet: mark and name each state on the map; your parent marks it with the answer-key map.

### Every teacherNote

**sp01** (20)

| Question | Note |
|---|---|
| 1. ii. | The paper prints "Panchmarhi"; the textbook spells it "Pachmarhi". Kept as printed; accept either spelling. The intended answer is c. |
| 1. v. | The paper prints "Panchmarhi"; the textbook spells it "Pachmarhi". Kept as printed; accept either spelling. The stem already names the "Squirrel", so the answer is given away; marked as printed. |
| 2. i. | The textbook calls Abha Didi "a nature scientist"; the paper says "natural scientist". The intended answer is True. If a child writes False because of the word "natural", talk it through; accept True. |
| 3. iii. | The rule behind the group is not stated; milk is the only food that does not come from plants and is not bird food. Accept milk. |
| 3. iv. | Two answers are defensible: tiger (not a water animal, intended) and fish (the only one that lives only in water). Both get full marks. |
| 4.  | On the printed sheet the numerals i, ii, iii sit beside the bottom of each picture, so it is unclear which picture each numeral belongs to ("ii" also has no full stop). Here the pictures are read top to bottom as i = paw prints, ii = webbed foot, iii = beak. If the child worked on the printout, mark by picture: paw prints - footprint, webbed foot - webbed feet, beak - beak of a bird. |
| 5. ii. | Printed "one antennae" is wrong: insects have one pair of antennae ("antennae" is already plural). Kept as printed; any insect named is accepted. |
| 5. iv. | The wording is loose; the intended answer is "web of life", but "interdependence" or "food chain/food web" also describe the connection and are accepted. |
| 6. i. | The question is oddly worded; the textbook line is "got ready for a nature trail at Pachmarhi". Accept Pachmarhi, Panchmarhi, or "a nature trail". |
| 6. iv. | Printed with a double space in "How do  leaves"; kept as printed. |
| 7. i. | No marks are printed per part: the block total (5) is split as 1 mark per part, ½ mark for each of the two names. Part (i) is personal: any two birds a child can see near home are correct. |
| 7. ii. | No marks are printed per part: the block total (5) is split as 1 mark per part, ½ mark for each of the two names. |
| 7. iii. | No marks are printed per part: the block total (5) is split as 1 mark per part, ½ mark for each of the two names. |
| 7. iv. | No marks are printed per part: the block total (5) is split as 1 mark per part, ½ mark for each of the two names. |
| 7. v. | No marks are printed per part: the block total (5) is split as 1 mark per part, ½ mark for each of the two names. |
| 8. (1) | The five pictures are not numbered on the paper and no marks are printed per picture: they are numbered (1) to (5) in reading order here, at 1 mark each (block total 5). Picture 1: claws, talons or "feet of a bird" are all defensible names. |
| 8. (2) | The five pictures are not numbered on the paper and no marks are printed per picture: they are numbered (1) to (5) in reading order here, at 1 mark each (block total 5). Picture 2: "parrot" is intended; "bird" is accepted. |
| 8. (3) | The five pictures are not numbered on the paper and no marks are printed per picture: they are numbered (1) to (5) in reading order here, at 1 mark each (block total 5). Picture 3: zoo is intended; zoological park, wildlife park or safari are accepted. |
| 8. (4) | The five pictures are not numbered on the paper and no marks are printed per picture: they are numbered (1) to (5) in reading order here, at 1 mark each (block total 5). Picture 4: butterfly is intended; "insect" names the picture correctly too (as "bird" is accepted for picture 2), so it is accepted. |
| 8. (5) | The five pictures are not numbered on the paper and no marks are printed per picture: they are numbered (1) to (5) in reading order here, at 1 mark each (block total 5). Picture 5: squirrel is intended; "rodent" or "animal" names the picture too (as "bird" is accepted for picture 2), so they are accepted; the parent may prefer the specific name. |

**sp03** (25)

| Question | Note |
|---|---|
| Q1 1) | Both answers are in the textbook. "Post office" for the first part is accepted (letters can be posted there), which is a judgement call, so this item is ⚑ like the other picture items in Q1. |
| Q1 2) | The textbook says an eagle has "a sharp, curved beak and sharp claws to catch its prey", so either feature (or both) earns the second mark. Hawk, kite and falcon look very like an eagle; the drawing (white head, hooked yellow beak, big talons) is an eagle, but give the mark for "bird of prey"/hawk/kite if the parent feels the child recognised the kind of bird. |
| Q1 3) | "Carbohydrates" is not a textbook word but means the same here; accept it. The two foods may be named from the picture or from memory. |
| Q1 4) | Printed as "Name the person who mends wall using bricks and cement called?" (two questions run together, and "wall" without "a"); kept as printed. The textbook example tool is the trowel, but any real wall-building tool gets the mark. |
| Q2 1. | The block heading is printed "Name the following ." with a space before the full stop, and this item says "specialist" (singular); both kept as printed. |
| Q2 4. | The textbook answer is the frog ("Frogs can live both on land and in water"). Turtles, crocodiles and other animals that move between land and water are also defensible for "can live on water as well as land", so they are accepted. |
| Q3 2. | Only Magh Bihu is named in the Chapter 1–5 text (and the Chapter 4 village "harvest festival"); other harvest festivals come from general knowledge, so accept any real harvest festival. Ugadi and Gudi Padwa are new-year festivals with harvest links; the parent decides. |
| Q3 3. | The textbook names the Jenu Kurubas (Karnataka) and Gond art; other tribes come from general knowledge, so accept any real Indian tribe. "Bishnoi" is a community rather than a tribe; the parent decides. |
| Q4 (1) | The printed answer lines are dotted lines under each picture, with no item labels; the panels are numbered (1) to (3) here in the printed order. "Oven" names the appliance, not the method; the parent may give the mark if the child clearly means baking. Because a general answer is accepted here, all three Q4 items are ⚑. |
| Q4 (3) | The pan has only a little oil, so "shallow frying" is the most exact answer; "frying" or "deep frying" also gets the mark. "Tadka" (tempering) is a different method; the parent decides. |
| Q5 b) | The question is ambiguous. The front of the note (the drawing here) shows two languages, Hindi and English, so 2 is the key. A real ₹100 note also has a language panel on the back with the value written in 15 languages, so 15 (the panel) or 17 (panel + Hindi and English) are also accepted. The printed paper showed both sides. |
| Q5 d) | Printed "famous Indian prominent leader’s" (two adjectives together); kept as printed. The portrait is not named in the drawing and the person on the note is not in the textbook, so this is ⚑ (general knowledge); a, c are read straight from the note. |
| Q6 (a) | The clue copies the textbook lines about the grasshopper, so grasshopper is the key. A praying mantis, katydid, cricket or locust is also a green insect that fits every clue, so they are accepted. Printed "also sometimes have two pairs of wings" (no subject); kept as printed. |
| Q6 (b) | The textbook says grandmother ate "jowar and bajra roti in winters"; bajra is the small round grey grain. "Millet" (the general name) is accepted too; jowar is a creamy-white grain, so it does not fit "grey". Because a general name is accepted, this item is ⚑. |
| Q8 1. | All four are insects, so the textbook gives no single answer. Butterfly is the expected answer: ants, wasps and termites live together in colonies and bite or sting, while a butterfly lives alone and does neither. Termite is also defensible (it eats wood and is not related to the other three, which belong to the ant-and-bee family). Accept Butterfly or Termite if the child can give the reason. |
| Q8 3. | Marigold is the expected answer: Tulsi, Amla and Ajwain are used as medicine or food, while marigold is a flower used for colour (natural dye). Amla is also defensible as the only fruit (Tulsi is a leaf, Ajwain a seed, Marigold a flower), so it is accepted too if the child gives that reason. |
| Q9 2. | Printed "Write about its role." ("its" for a person); kept as printed. The textbook only says a nature scientist "studies plants and animals" and shows Abha Didi guiding the trail and asking the students not to harm plants and animals; the role points are judged by the parent. |
| Q9 4. | The textbook gives one use ("take out money anytime we need it"); the second use comes from general knowledge, so any real ATM use counts. "Any Time Money" is a common wrong guess and gets no mark for the full form. |
| Q9 5. | The textbook describes Gond art in a "Do you know?" box and, on the same page, says grandmother’s paint "was made of natural extracts of flowers, leaves and with the powdered coloured stones"; it does not say these are the Gond paints in so many words, so the parent judges the paint point (natural dye made by boiling plant parts is also accepted). |
| Q10  | In print, "earlier times" and "present time" in the instruction are bold, italic and underlined; underlining can only be shown on an item’s question here, so it is not shown. Q10 is an open comparison table: any sensible entry in each cell gets ½ mark. |
| Q11 4. | Printed "with six different taste" (singular) with a full stop after the blank; kept as printed. The textbook says Ugadi Pachadi is from Andhra Pradesh, Karnataka and Telangana; "Bevu Bella" is the Karnataka name for the same mix. |
| Q12 1. | Printed "Answers the following questions." (block heading) and "any two super food" (singular); both kept as printed. The textbook does not define super food; it shows a "Super Food" stall of millets, which "are rich sources of nutrients". Other nutrient-rich foods (amla, moringa, nuts) are accepted. |
| Q12 2. | Marks are 2 for a list question, so ½ per correct item (four needed) is used. The textbook mentions medicines and mosquito repellent cream; the other items come from general knowledge. |
| Q14  | The answer key was found by searching the grid (the teacher’s key is not printed). Exactly ten straight-line words besides the example were found, so POTATO, the given example, is not counted among the ten. TOFU shares the T and O of POTATO, and OAT is part of GOAT; both are still food words. The grid also hides UPMA (down column 2) and NAAN (diagonal), which are accepted as substitutes. Letters are copied from the page image (the text layer misplaces the P in row 2). |
| Q15 1. | Printed "Locate the state" (singular) for five states; kept as printed. Map skills are not taught in Chapters 1–5; the states appear in the chapters (Pachmarhi in Madhya Pradesh, the Jenu Kurubas of Karnataka, the Tumri of Uttarakhand, Ugadi in Andhra Pradesh, Tripura’s state animal). |

**sp04** (16)

| Question | Note |
|---|---|
| 1. a) | The four printed prompts (At home, At school, In parks, In our locality) appear only as the captions of the four pictures; the captions are used as the questions here. Answers are personal, so mark with the rubric. |
| 11. 2. | The textbook answer is neem. Tulsi (holy basil) leaves are also commonly used to repel insects, so it is accepted; that is why this item is ⚑. |
| 11. 3. | The textbook does not name one material that "makes homes cool"; it lists clay, hay and cow dung. Any of them (or "natural materials") is accepted. |
| 11. 4. | The textbook name is "Hari Jiroti" (an unfamiliar word that children spell many ways). Close spellings are accepted, and so is Van Mahotsav, a well-known tree-planting festival. |
| 1V. c) | Printed "The Jenu tribes uses" (plural subject with "uses"; the textbook says "The Jenu Kurubas is a tribe"). Kept as printed; it does not change the answer. |
| 1V. d) | Printed with a stray comma ("family trip, to a forest near their village") and the places swapped compared with the textbook ("their village near a forest"). Kept as printed; both True and False get the mark. |
| V. 2. | Printed "first - aid" with spaces round the hyphen; kept as printed. The textbook names only medicines and mosquito repellent cream, so other common first-aid items are accepted. |
| V. 4. | Printed "oursurroundings" (missing space: "our surroundings"); kept as printed. Two ways for 1 mark, so ½ mark each. |
| V1. 2. | The textbook names hibiscus and marigold (and beetroot, which is not a flower). Other colourful flowers that give a dye, such as palash, rose or butterfly pea, are accepted. |
| V1. 3. | The textbook names earthen pots, bamboo baskets and the tumri. Other traditional stores a child knows from home (jute sacks, mud bins / kothi) are accepted. |
| V11. 1. | Printed "Flame of the forest"; the textbook says "flame of forest". Same meaning; the answer is Palash (also called Kesuda, Tesu or Dhak). |
| V11. 2. | The textbook answer is Gond art, but several Indian folk arts are painted on walls with natural colours (Warli, Madhubani, Mandana, Pithora), so these are accepted. |
| V11. 3. | No single answer: "your state animal" depends on where the child lives. Mark against the child's own state using the list in the marking guide. |
| V111. 2. | Printed as an incomplete sentence ending with a comma, under "Give reasons". The child completes it with the result; the textbook example is "our forests deplete". Accept any sensible completion. |
| 1X. Eating | The printed table has 4 blank cells per row for 1 mark per row (printed "(1x5=5)"). Each row is one item here: full mark for a mostly filled row, ½ for a partly filled row. |
| X. 3) | Printed "Maharashra" (missing "t"); kept as printed. The state is Maharashtra; do not mark the child down for either spelling. |

**sp05** (9)

| Question | Note |
|---|---|
| 4. a. | Printed as "use to eat to" (stray "to"; means "used to eat") and "Surabhi" (the textbook spells it "Surbhi"). Kept as printed. Answers that spell the name either way (Surabhi / Surbhi) are fully correct. |
| 5.  | Printed "( 2 x 1 = 2 )" for a two-column table with one empty row. Read as 1 mark per column (describe each food type). A child who writes the difference as a pair of contrasting sentences also gets full marks. |
| 5.  | Printed "( 2 x 1 = 2 )" for a two-column table with one empty row. Read as 1 mark per column (describe each food type). |
| 6.  | Astringent (kasaila) is the least familiar taste; foods are classed differently in different homes and regions, so accept any sensible example. |
| 7. Box 2 | The paper prints two boxes, each with a name line, for "( 2 x 1 = 2 )": 1 mark per box (½ drawing + ½ name). Grammar "two junk food" kept as printed. |
| 8. b. | Printed "Water – rich" with a spaced dash; kept. Cucumber (named in the textbook) is accepted although many children call it a vegetable. |
| 9.  | Popcorn and chicken can each be cooked by roasting or grilling, so Roasting – chicken with Grilling – popcorn is also accepted. The printed mark bracket "( 6 x ½ = 3)" has no space before ")"; kept. |
| 10. a. | Printed "10.Circle" with no space after the number, and Q10 is indented under Q9 on the sheet; kept as "10.". |
| 11. a. | Andhra Pradesh, Karnataka and Telangana are the states where Ugadi Pachadi is a traditional food (textbook spelling "Telengana"). The answer map shades all three. |

**sp06** (34)

| Question | Note |
|---|---|
| Q1 1) | The header prints "Total No. of printed pages: 09", but the paper has 8 pages ("Page 1 of 8" … "Page 8 of 8") and nothing is missing: Q1–Q15 run without a gap and the marks add up to 80. For part 2, both "ATM" and "bank" are defensible, so both get the mark. |
| Q1 2) | Ducks are not named in the Chapter 1–5 text; the textbook explains webbed feet for swimming with turtles (Ch 3). This is general knowledge, so the parent checks the wording. |
| Q1 3) | The textbook calls this group "body-building foods"; "protein" is the word on the printed picture (a shaker labelled PROTEIN, not redrawn here). Accept either name. |
| Q1 4) | Printed with a space before the full stop ("wires ."), kept. Electricians and their tools are not in the Chapter 1–5 text; this is general knowledge. |
| Q2 1. | Printed "specialist" (singular) kept. |
| Q2 3. | The textbook names Gond art; several other Indian folk wall-painting forms also use natural colours, so they are accepted. |
| Q2 4. | Printed "live on water" kept. Frog is the textbook answer; other land-and-water animals are accepted. |
| Q3 1. | Flagged for consistency: the same question is flagged in another school paper. |
| Q3 2. | The textbook names only one traditional food of Andhra Pradesh (Ugadi Pachadi), so the second example comes from general knowledge. Accept well-known Andhra foods such as pesarattu, gongura pachadi, pulihora, Andhra biryani or ariselu. |
| Q3 3. | The textbook names one tribe (the Jenu Kurubas); the second example comes from general knowledge, so any genuine Indian tribe is accepted. |
| Q4 Q4 | Printed marks are "3 x 1 = 3M", but there are six pictures and six names, so each pair is marked ½ (6 × ½ = 3). The printed instruction has a stray "and" ("cooking and with its name"), kept. Pictures 3 and 5 both show food cooked by direct dry heat on a rack/grate, so grilling and roasting are accepted for either. |
| Q5 b) | The answer depends on what the child counts: 17 on the whole note, 15 in the back panel alone, or 2 on the front alone. All three are accepted. |
| Q5 d) | Printed with both "famous" and "prominent", kept. The portrait is a simplified drawing (bald head, round glasses, moustache), so the parent confirms the child named the leader shown. |
| Q5 e) | The national emblem (Lion Capital of Ashoka) is not in the Chapter 1–5 text; this is general knowledge. Do this on the printed sheet. |
| Q6 a) | Printed with no space after "a)". The clues come from the textbook's grasshopper passage, but other green insects (praying mantis, locust) fit all the clues, so they are accepted. |
| Q6 b) | Printed with no space after "b)". |
| Q8 1. | Two answers are defensible: Butterfly (the only one that does not live in a colony) and Termite (the only wood-eater, and not in the textbook). Both are accepted. |
| Q8 3. | Two answers are defensible: Marigold (a flower used for dye; the others are medicinal plants) and Amla (a fruit, the protective food in Ch 5; tulsi and ajwain are the home-remedy plants in Ch 4). Both are accepted. |
| Q9 2. | Printed "its role" (for a person) kept. The textbook defines a nature scientist; the roles are drawn from what Abha Didi does in Ch 3, so the parent judges the wording. |
| Q9 4. | The textbook gives one use (taking out money any time); a second use comes from general knowledge, so any real ATM use is accepted. |
| Q9 5. | Printed "5.What" with no space, kept. |
| Q10 (1) | The five pictures are not numbered on the paper; they are numbered (1) to (5) in reading order here, at 1 mark each (printed 5 x 1). A general name ("bridge", "train", "bird", "insect") is accepted for every picture in this question. |
| Q10 (2) | A general name ("bridge", "train", "bird", "insect") is accepted for every picture in this question. |
| Q10 (3) | A general name ("bridge", "train", "bird", "insect") is accepted for every picture in this question. |
| Q10 (4) | A general name ("bridge", "train", "bird", "insect") is accepted for every picture in this question. |
| Q10 (5) | Dragonflies are not in the Chapter 1–5 text (general knowledge). A general name ("bridge", "train", "bird", "insect") is accepted for every picture in this question. |
| Q11 1. | Printed "1.State" (no space) and the colon in "Q11:" kept. |
| Q11 4. | Printed "six different taste" (singular) and the full stop after the blank kept. The textbook says Ugadi Pachadi is a traditional food of Andhra Pradesh, Karnataka and Telangana (spelt "Telengana"). |
| Q12 1. | Printed "Answers" in the instruction and "any two super food" (singular) kept. The textbook shows millets at "a stall of super food" but does not define the term, so the parent judges the meaning. |
| Q12 2. | The textbook names only medicines and mosquito repellent cream; the other items come from general knowledge, so the parent judges the list. |
| Q13 2. | Printed "2.We" (no space), kept. |
| Q13 3. | Printed "3.Drinking" (no space), kept. |
| Q14 Q14 | Printed with spaces before the commas and "--" after "colour it", kept. The paper leaves a blank space for the drawings. |
| Q15 1. | The printed marks are "1x 5" (reversed), kept. The map is on page 8, after the question on page 7. Mark on the printed map; the answer map shades all five states. |

**sp07** (10)

| Question | Note |
|---|---|
| Q.2 4. | Printed with no blank or question mark, and option (d) ends with a full stop ("pliers."). Electricians and their tools are not in the Chapter 1–2 text; this is general knowledge. Mark (d) pliers as correct. |
| Q.2 5. | Option (b) is printed "Bela Ghar"; the textbook spells it "Bhela Ghar" (the hay-and-bamboo hut of Magh Bihu, Assam). Kept as printed; it is a wrong option either way. Answer (a) Khetala. |
| Q3 3. | TTESREL also unscrambles to the real word "SETTLER". The chapter word is LETTERS (post office); accept SETTLER too, since it uses exactly the same letters. |
| Q3 4. | Misprint: ROYFLAEV has 8 letters, one more than FLYOVER (an extra A). Kept as printed; accept FLYOVER (also "fly over", "fly-over") and do not penalise the unused A. |
| Q. 6 (4) | Picture 4 is a playground (slide, swing, see-saw), a place, not an occupation, and has no answer line in print, yet it is counted in 1x5. Owner decision (Gate 0b): accept a place or activity name such as "playground", "park" or "play area" for 1 mark. |
| Q. 6 (5) | Picture 5 is a hay-and-bamboo hut, the Bhela Ghar of Magh Bihu (Assam); a place, not an occupation, with no answer line in print, yet counted in 1x5. Owner decision (Gate 0b): accept the name of the hut or the festival ("Bhela Ghar", "Meji", "hut", "Magh Bihu hut") for 1 mark. |
| Q.7 1. | The printed instruction is missing "and" ("Look at the picture answer the questions"). Kept as printed. |
| Q.8 2. | "Public" is printed with a capital P. Kept as printed. |
| Q.8 3. | A one-word answer (microphone) for 2 marks as printed. Full marks for "microphone" / "mic" / "mike"; a full sentence is not required. |
| Q.10 1) | Numbering jumps from Q.8 to Q.10 in print (there is no Q.9). Kept as "Q.10"; nothing is missing because the marks still add up to 40. |

<!-- generated:end -->
