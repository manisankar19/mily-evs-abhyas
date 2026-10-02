# School Papers — Intake (sprint v2)

Generated 2026-10-02 from `source/intake/spNN.json` (one agent per paper, every page image viewed: see `pagesViewed`).
Machine-readable: `source/intake.json`. Text cache: `source/text-cache/`. Transcripts for garbled papers: `source/intake/sp02-transcript.txt`, `sp04-transcript.txt`.

## Summary
| sp | Source file | Short label | Total | Sections | Chapters | Text layer | Pictures | ⚑ est. | Status |
|---|---|---|---|---|---|---|---|---|---|
| sp01 | `2.1.1 class 4_twau_ch-3_ws.pdf` | Worksheet: Chapter 3 | 40 | 3 | 3 | usable | 8 | 18 | include |
| sp02 | `2.1.2 EVS L5.pdf` | Worksheet: Chapter 5 (August) | 40 | 3 | 5 | garbled | 2 | 9 | duplicate-of-sp05 |
| sp03 | `2.1.4 Worksheet_Class-4_TWAU_Sept'25 HYE.pdf` | Worksheet: September (Ch 1–5, Term 1) | 80 | 3 | 1, 2, 3, 4, 5 | usable | 11 | 16 | include |
| sp04 | `2.1.5 L5 EVS.pdf` | Worksheet: Lesson 4 | 40 | 10 | 4 | garbled | 5 | 15 | include |
| sp05 | `2.1.6  Worksheet_Class-4_TWAU_August'25 L-5.pdf` | Worksheet: Chapter 5 (August) | 40 | 3 | 5 | usable | 1 | 11 | include |
| sp06 | `2.1.7 IV TWAU HY Practice Paper-2.pdf` | Half-Yearly Practice Paper 2 | 80 | 3 | 1, 2, 3, 4, 5 | usable | 18 | 12 | include |
| sp07 | `2.1.8 IV TWAU Revision WS Chapters 1 & 2.pdf` | Revision Worksheet: Chapters 1 & 2 | 40 | 9 | 1, 2 | usable | 7 | 11 | include |

## Duplicates (Task 8)
Compared by text (normalised token sequences; transcripts used for garbled layers) across all 21 pairs:
- **sp02 ≡ sp05** (ratio 0.84; every non-matching run is a transcription annotation or `6 x 1`/`6x1` spacing). sp02 is a Letter-size Acrobat reprint (2026-09-12) of sp05's A4 Word original (2025-07-29), with the same typos ("use to eat to", "Surabhi", "10.Circle"). **Proposed: drop sp02, keep sp05.**
- sp03 ~ sp06 (0.73): both 80-mark Half-Yearly papers with the same three-competency layout, but different questions, pictures and banknote (₹100 vs ₹500). **Not duplicates; both kept.**
- No other pair is above 0.4.

## Page-count check
- sp06 prints "Total No. of printed pages: 09" but footers run "Page 1 of 8" … "Page 8 of 8", Q1–Q15 are continuous and nothing breaks off → **complete; header miscount.**
- All others: printed page count = PDF page count.

## Chapters beyond 5
None. Every paper covers Chapters 1–5 (sp04 = Ch 4 despite its "L5" filename). Some items go beyond the textbook text (electrician/pliers, dragonfly, termite, national emblem); these get authored answers with ⚑ and a Class 4 content-standard source.

## Proposed batches (if sp02 is dropped → 6 papers)
Rule: fewest pictures first, picture-heavy last, garbled last in its group.
| Batch | Papers | Why |
|---|---|---|
| 1 | sp05 (1 pic), sp07 (7), sp01 (8) | 40-mark worksheets, usable text |
| 2 | sp04 (5, garbled), sp03 (11), sp06 (18) | garbled paper, then the two 80-mark Half-Yearly papers with the most pictures |

## Cross-paper picture needs (input to Task 17)
- **India outline map with state boundaries** for locate/label tasks: sp03 Q15, sp04 Q "X." (Roman 10), sp05 Q11 (sp02 Q11), sp06 Q15, sp07 Q.10. The source maps are third-party (© mapsofworld.com), so we draw an **original** SVG once and share it.
- **Banknote with the national emblem** (sp03 ₹100, sp06 ₹500): an original simplified note; never reproduce currency faithfully.
- **Cooking methods** (sp03 Q4, sp06 Q4): candidates for a shared set.

## Open for owner (Gate 0b)
1. Drop sp02 as a duplicate of sp05, and renumber? (Options: renumber to sp01–sp06 in filename order, or keep sp02 as a gap.)
2. Map, "encircle on the note" and drawing items: on the app, these become a printed/oral task that the parent marks with a rubric (no tap-to-locate UI this sprint).
3. sp07 Q. 6 pictures 4–5 (playground, Bhela Ghar) are not occupations but count toward 1×5. Proposed: accept the place/activity name, ⚑ + teacherNote.
4. Live-check paper: default the first paper of batch 1.

---

# sp01 — 2.1.1 class 4_twau_ch-3_ws.pdf

- sha256: `2dfa74c2057bddab85f79c4fcf704063cd508bb70f3b7a5fa55c71e4bf43c55b`
- PDF pages: 4 · printed "Total No. of printed pages: 4" · text layer: usable (English clean; Hindi header lines are mangled in the text cache, e.g. "ऊर्ाा" for "ऊर्जा" — header transcribed from the page image)
- Title: **Atomic Energy Education Society / Worksheet (2025-26)** · short label: Worksheet: Chapter 3
- Header: Class: IV · Subject: TWAU · Month: JULY · Marks: 40 · Portion covered: Lesson-3, Nature Trail
- Printed total: **40** · duration: none printed
- Chapters: **3** (Nature Trail, deev103) · beyond Ch 5: no
- Pages viewed: 1, 2, 3, 4 (all at 200 dpi)

## Sections and blocks

| Sec | Heading (verbatim, 2 printed lines) | Block | Instruction (verbatim) | Pattern | Items × marks | Marks |
|---|---|---|---|---|---|---|
| A | SECTION A / OBSERVATION AND REPORTING | 1. | Fill in the blanks choosing the correct answer from the options given below (5) | mcq (fill-blank, 3 options) | 5 × 1 | 5 |
| | | 2. | State if the following sentences are True or False (5) | true-false | 5 × 1 | 5 |
| | | 3. | Circle the odd one in each group (5) | odd-one-out | 5 × 1 | 5 |
| B | SECTION B / IDENTIFYING GROUP AND CLASSIFICATION | 4. | Match the following (3) | match (pictures → words) | 3 × 1 | 3 |
| | | 5. | Name the following (5) | one-word | 5 × 1 | 5 |
| | | 6. | Answer the following (5) | short | 5 × 1 | 5 |
| C | SECTION C / DISCOVERY OF FACTS | 7. | Name two of the following (5) | short (two names) | 5 × 1 | 5 |
| | | 8. | Identify the following pictures and name them (5) | one-word (pictures) | 5 × 1 | 5 |
| | | 9. | Draw a picture denoting the diversity of animals in a forest. (2) | draw | 1 × 2 | 2 |

Mark arithmetic: A 15 + B 13 + C 12 = **40** = printed total. No section totals are printed.

## Pictures (8; all must be drawn)

| Q | Page | What is drawn | Need |
|---|---|---|---|
| 4 (i) | 2 | two black paw prints | answer-from |
| 4 (ii) | 2 | webbed foot of a duck | answer-from |
| 4 (iii) | 2 | hooked bird beak (outline) | answer-from |
| 8 | 4 | bird's foot with long curved claws/talons | answer-from |
| 8 | 4 | cartoon parrot-like bird | answer-from |
| 8 | 4 | zoo scene (enclosures, ostriches, giraffe, elephants) | answer-from |
| 8 | 4 | butterfly | answer-from |
| 8 | 4 | cartoon squirrel with acorn | answer-from |

The AEES logo on page 1 is decorative and is not counted.

## Issues (keep as printed and add a teacherNote)
- Q1 (ii) option and Q1 (v) stem print "Panchmarhi". The textbook spells it "Pachmarhi". The intended answer for (ii) is c.
- Q1 (v): the stem "Indian Giant Squirrel" gives away the answer "squirrel".
- Q2 (i): the paper says "natural scientist" but the textbook says "nature scientist". The intended answer is True.
- Q3 (iv): the intended odd one is tiger, but fish is also defensible.
- Q4: the numerals sit beside the bottom of each picture, so it is ambiguous which picture each belongs to. Read as i = paw prints, ii = webbed foot, iii = beak, giving the key i-c, ii-a, iii-b. The "ii" has no full stop.
- Q5 (ii) says "one antennae", which is wrong (insects have one pair of antennae). Accept any insect.
- Q5 (iv): the intended answer is "web of life".
- Q6 (iv) prints a double space in "How do  leaves". Q7 prints a double space in "Name  two".
- Q7/Q8: no marks are printed per sub-part. Assumed 1 mark per item (0.5 per name in Q7).
- Q8: the picture items are unnumbered, so labels must be authored.
- The section headings are two printed lines each. The owner needs to decide how they go into title/heading.
- The subject is printed as "TWAU", not "EVS".
- All pages are readable, so there is no hard stop.

## ⚑ estimate: 18
Q2 (i), Q3 (iii) and (iv), Q5 (ii) and (iv), Q6 (ii)–(v), Q7 (i)–(v), Q8 (claws, bird, zoo) and Q9.

---

# sp02 — 2.1.2 EVS L5.pdf

- **Title:** कार्यपत्रक / Worksheet (2025-26), Atomic Energy Education Society
- **Header:** Class: 4 · Subject: TWAU · Month: August · Marks: 40 · Portion covered: Chapter-5 Food for Health
- **Date:** Month August, session 2025-26 (no exact date printed; Date line is a blank for the student)
- **Lesson:** Chapter 5, *Food for Health* (NCERT *Our Wondrous World* Class 4, `source/textbook/deev105.pdf`)
- **sha256:** 4fd92bb601d2df28badcf196220fc3b09e2421dbee5fce322d93eec47d9883cf
- **Pages:** 4 PDF pages = 4 printed pages ("Total No. of printed pages: 4")
- **Text layer:** garbled (custom font encoding). Everything was read from the 200 dpi images `sp02-hi-1..4.png`; full transcript in `sp02-transcript.txt`. Every string will need `fallbackText`.
- **Pages viewed:** 1, 2, 3, 4

## Sections
| Sec | Printed heading | Marks |
|---|---|---|
| A | Section – A : OBSERVATION AND REPORTING  ( 15 marks ) | 15 |
| B | Section – B : IDENTIFICATION AND CLASSIFICATION  ( 12 marks ) | 12 |
| C | Section – C :  DISCOVERY OF FACTS ( 13 marks ) | 13 |

## Blocks
| Q | Instruction (verbatim) | Pattern | Items × marks |
|---|---|---|---|
| 1 | Fill in the gaps with the correct answer. ( 6 x 1 = 6  ) | fill-blank (2 choices given) | 6 × 1 |
| 2 | Write True or False. ( 5 x 1 = 5 ) | true-false | 5 × 1 |
| 3 | Write a short note on the following. ( 2 x 2 = 4  ) | short | 2 × 2 |
| 4 | Answer the following. ( 5 x 1 = 5  ) | short | 5 × 1 |
| 5 | Write the difference between. ( 2 x 1 = 2 ) | table (Protective vs Energy Giving Foods) | 2 × 1 |
| 6 | Give an example of the ingredients or food items that match each of the tastes listed below? ( 6 x ½ = 3 ) | table (6 tastes) | 6 × ½ |
| 7 | Draw any two junk food and also write the names. ( 2 x 1 = 2 ) | draw | 2 × 1 |
| 8 | Name any two. ( 5 x 1 = 5 ) | one-word (two blanks each) | 5 × 1 |
| 9 | Match the following. ( 6 x ½ = 3) | match (cooking methods → foods) | 6 × ½ |
| 10 | Circle the odd one out. ( 4 x ½ = 2 ) | odd-one-out (with italic clues) | 4 × ½ |
| 11 | Locate the following states in the given map. ( 3 x 1 = 3 ) | diagram-label (India map) | 3 × 1 |

**Arithmetic:** A 6+5+4=15, B 5+2+3+2=12, C 5+3+2+3=13; 15+12+13 = 40 = printed total. All correct.

## Pictures
- p.3, Q7: two empty drawing boxes with name lines (decorative; the child draws).
- p.4, Q11: blank outline political map of India with state boundaries, no names (**label**). This must be drawn as an SVG with selectable states (Andhra Pradesh, Karnataka, Telangana plus neighbouring distractors).

## Typos and oddities (keep as printed)
- Q4a: "What did Surabhi’s grandmother use to eat to during summers and winters?" has a stray "to", and the textbook spells the name "Surbhi". Answer (p.74): jowar and bajra roti in winters, jau roti in summers.
- Q6: an imperative sentence that ends with "?".
- Q7: "two junk food" (grammar).
- Q9: "( 6 x ½ = 3)" has no space before ")". Roasting/Grilling vs popcorn/chicken is ambiguous.
- Q10: printed as "10.Circle" with no space after the number.
- Q4 short answers sit under the heading "IDENTIFICATION AND CLASSIFICATION".
- Subject is printed "TWAU" (The World Around Us).

## ⚑ estimate: about 9
Q3a/b (short notes), Q5 (difference), Q7 (drawing), Q9d/e (roasting/grilling), Q11 ×3 (map), Q4a (textbook-specific), Q8d (super food stall = millet foods).

## Duplicate watch
This is the Chapter 5 *Food for Health* worksheet for August 2025-26. sp04 (2.1.5 L5 EVS) and sp05 (2.1.6, Lesson 5 worksheet) may duplicate it. The coordinator should compare them by text taken from the images, because the sp02 text layer is garbled.

---

# sp03: Worksheet, September 2025-26 (Ch 1–5, Term 1)

- **File:** `2.1.4 Worksheet_Class-4_TWAU_Sept'25 HYE.pdf`
- **SHA-256:** `81906ffa9c9eff201db36bda855671991d885ebd73d185a538281a4dcee0d57b`
- **Pages:** 8 in the PDF, 8 printed ("No. of printed pages - 08"; footer "Page N of 8")
- **Text layer:** usable. The Hindi in the header is mangled, so the header below comes from the page image. The Q14 grid is also mangled in the cache.
- **Pages viewed:** 1–8 (200 dpi for 1, 2, 3, 7, 8; 100 dpi for 4, 5, 6)

## Header (verbatim)
```
कुल मुद्रित पृष्ठों की संख्या / No. of printed pages - 08
परमाणु ऊर्जा शिक्षण संस्था
Atomic Energy Education Society
कार्यपत्रक / Worksheet (2025-26)
कक्षा/Class : IV अनुभाग / Sec : _________ अंक / Marks : 80
विषय / Subject : हमारे आस-पास की दुनिया / The World Around Us
माह / Month : सितम्बर / September
दिया गया पाठ्यक्रम / Portion covered – Chapter 1 to 5 ( Term 1)
विद्यार्थी का नाम / Name of the student : ____
अनुक्रमांक / Roll No:____
```
- **Total:** 80. **Duration:** not printed. **Chapters:** 1–5 (chaptersBeyond5: false).
- The paper has no section letters. It has three headed sections, coded 1, 2 and 3.

## Section 1: OBSERVATION AND REPORTING (25 MARKS)
| Q | Instruction (verbatim) | Pattern | Items × marks | Pictures |
|---|---|---|---|---|
| Q1 | Q1.Observe the picture and answer the questions. (5 x 2 =10) | short | 5 × 2 = 10 | 5: post office with letter box and postman, eagle, energy-giving foods, mason laying bricks, solar cooker (all answer-from) |
| Q2 | Q2. Name the following . (4x1=4) | one-word | 4 × 1 = 4 | none |
| Q3 | Q3. Give two examples of each- (3 x 1 = 3) | short (2 blanks each) | 3 × 1 = 3 | none |
| Q4 | Q4.Identify the method of cooking and write its name. (3 x 1 = 3) | one-word | 3 × 1 = 3 | 3: baking in an oven, steaming, frying in a pan (answer-from) |
| Q5 | Q5. Answer the questions based on the picture given. ( 1 X 5 = 5) | short | 5 × 1 = 5 | 1: ₹100 note, front and back (answer-from; e) asks the child to encircle the emblem on it) |

## Section 2: IDENTIFICATION AND CLASSIFICATION (30 MARKS)
| Q | Instruction (verbatim) | Pattern | Items × marks |
|---|---|---|---|
| Q6 | Q6.Who am I? (2 x 1 = 2) | one-word (riddles) | 2 × 1 = 2 |
| Q7 | Q7. Match the column. ( 4 x 1 = 4) | match | 4 × 1 = 4 |
| Q8 | Q8. Circle the one which does not belong to the group. ( 4 x 1 = 4) | odd-one-out | 4 × 1 = 4 |
| Q9 | Q9. Answer the following questions. (5×3=15) | long | 5 × 3 = 15 |
| Q10 | Q10. Compare between communication in ***earlier times*** and communication in ***present time*** on the following points. (1x5=5) | table (5 rows × 2 cells) | 5 × 1 = 5 |

## Section 3: DISCOVERY OF FACTS (25 MARKS)
| Q | Instruction (verbatim) | Pattern | Items × marks | Pictures |
|---|---|---|---|---|
| Q11 | Q11:Name the following. (5 x 1 = 5) | one-word | 5 × 1 = 5 | none |
| Q12 | Q12. Answers the following questions. ( 2 x 2 = 4) | short | 2 × 2 = 4 | none |
| Q13 | Q13. Give reason. (3x2=6) | short | 3 × 2 = 6 | none |
| Q14 | Q14. Circle ten words related to food in the grid below. / One example is given below. ( 10 x ½ = 5 ) | word search | 10 × ½ = 5 | 9×9 letter grid; POTATO is circled as the example (answer-from) |
| Q15 | Q15. Locate the state in the given map. (1x5=5) | diagram-label | 5 × 1 = 5 | outline map of India showing state borders (label) |

## Mark arithmetic
Section totals: 25 (10+4+3+3+5), 30 (2+4+4+15+5) and 25 (5+4+6+5+5). Together they make 80, which matches the printed total. Every block also matches its printed items × marks.

## Pictures: 11 that the questions depend on
There are 5 in Q1, 3 in Q4, 1 in Q5, the Q14 grid and the Q15 map. The AEES logo is decorative. Q5 e) and Q15 need interactive drawings: the child taps the emblem on the note, and taps states on the map.

## Typos and oddities (kept as printed)
- Q1.4: "Name the person who mends wall using bricks and cement called?"
- Q2: "Name the following ." and "specialist".
- Q5: "1 X 5" with a capital X, and "famous Indian prominent leader’s".
- Q9.2: "Write about its role." Q11.4: "six different taste". Q12: "Answers the following questions." and "two super food". Q15: "the state".
- Separators and spacing vary: "Q1." / "Q11:" / "Q4.Identify"; "×" in Q9 but "x" elsewhere.

## Expected ⚑ (about 16)
- Q5 b) asks how many languages are on the note. The answer could be 2, 15 or 17.
- Q5 e) needs the emblem drawn so it can be tapped.
- Q8.1 Ant/Wasp/Butterfly/Termite has no clear answer. Q8.3 Marigold is the most defensible answer.
- Q14: the answer set was found by searching the grid: HONEY, BAJRA, LEMON, BEANS, EGG, MANGO, OAT, CARROT, AMLA, TOFU. TOFU shares letters with POTATO. It is unclear whether POTATO counts among the ten.
- Q15: the map has 5 items.
- Judgement items: Q1.3, Q9 ×5, Q10 and Q13.
- Q3 is open-ended.

## Fallback text expected
- The Q14 grid. The cache displaces the "P" in row 2, column 8.
- The header Hindi. The cache mangles it.
- Q13 marks: the image shows "( 3 x 2 = 6 )" but the cache has "(3x2=6)". Use the cache string.
- The Q4 answer blanks are drawn dotted lines.

---

# sp04 — 2.1.5 L5 EVS.pdf

- **sha256:** `6e86fa42c38d6a99cc47a3d5801bcba9ad754ccd8e2578429a59a544492b32c2`
- **Pages:** 4 PDF pages; printed "Total No. of printed pages: 04" (matches). Footers "Page N of 4".
- **Text layer:** garbled (custom font encoding). All text read from `source/page-images/sp04-hi-1..4.png`; full transcript in `source/intake/sp04-transcript.txt`.
- **Pages viewed:** 1, 2, 3, 4 (200 dpi).

## Title, date, lesson
- **Printed title:** `Worksheet (2025-26)` — Atomic Energy Education Society, Class IV, Subject `TWAU`, `Marks: 40`.
- **Lesson:** header reads `Portion  covered:  : Lesson 4 - Growing up with nature`. **Despite the "L5" in the filename, this is Chapter 4** (deev104, "Growing up with Nature"): Reena and Amit, solar-powered village, Palash, Gond art, Tumri, Jenu Kurubas, sacred groves, Vat Purnima all come from deev104.
- **Date:** none printed (student Date field is blank). PDF created 2026-09-12.
- **Duplicates:** sp02 (2.1.2) and sp05 (2.1.6) are labelled Lesson 5. sp04 is a Lesson 4 paper in content, so it is not a duplicate of a Lesson 5 paper unless those are also Ch 4. Compare by content.
- **Duration:** not printed.

## Header (verbatim)
```
कुल मुद्रित पृष्ठों की  संख्या /Total No. of printed pages:   04
परमाणु ऊर्जा शिक्षण संस्था
Atomic Energy Education Society
Worksheet (2025-26)
कक्षा /Class:IV        विषय /Subject:  TWAU        अंक/Marks:  40
दिया गया पाठ्यक्रम/Portion  covered:  : Lesson 4 - Growing up with nature
विद्यार्थी का नाम/Name of the student: ______
अनुक्रमांक /Roll No.______कक्षा/अनुभाग Class /Sec.: ______ दिनांक /Date: ______
```

## Sections (no letters; printed numbers kept, incl. digit-for-Roman typos)
| code | printed heading + marks (verbatim) | pattern | items × marks | marks |
|---|---|---|---|---|
| 1 | `1. How can we protect the natural environment around us?     (4x1=4)` | short (picture-captioned a–d) | 4 × 1 | 4 |
| 2 | `11. Fill in the blanks.  (4x1=4)` | fill-blank | 4 × 1 | 4 |
| 3 | `111. Match the following.  (5x1=5)` | match | 5 × 1 | 5 |
| 4 | `1V. Write True or False.  (4x1=4)` | true-false | 4 × 1 | 4 |
| 5 | `V. Answer the following.  (5x1=5)` | short | 5 × 1 | 5 |
| 6 | `V1. Give two examples of each.  (3X1=3)` | short (2 blanks each) | 3 × 1 | 3 |
| 7 | `V11. Name the following.  (3x1=3)` | one-word | 3 × 1 | 3 |
| 8 | `V111. Give reasons for the following.  (2x2=4)` | short | 2 × 2 | 4 |
| 9 | `1X. What are the things that we use from nature in our daily life?  (1x5=5)` | table (5 rows × 4 blank cells) | 5 × 1 | 5 |
| 10 | `X. Locate the following states in the given map. (3x1= 3)` | diagram-label (map) | 3 × 1 | 3 |

(Whitespace between heading and marks varies on the page; the JSON keeps the printed spacing approximately. Use the transcript.)

**Mark arithmetic:** 4+4+5+4+5+3+3+4+5+3 = **40** = printed `Marks: 40`. Every (n×m) product is correct.

## Pictures
| page | what | need |
|---|---|---|
| 1 | AEES logo | decorative |
| 1 | House with garden, caption "At home" (Q1 a) | answer-from — the caption is the only prompt |
| 1 | School building, caption "At school" (Q1 b) | answer-from |
| 1 | Park with see-saw and trees, caption "In parks" (Q1 c) | answer-from |
| 1 | Houses and trees, caption "In our locality" (Q1 d) | answer-from |
| 4 | Table: Activities / Collected from nature (Eating, Clothing, Healthcare, Fuel, Shelter) | table structure, not a picture |
| 4 | Outline map of India with state boundaries (© 2019 mapsofworld.com) | label — locate Uttarakhand, Karnataka, Maharashtra. Needs an original SVG. |

## Typos / oddities (keep as printed, add teacherNote)
- Section numbers: `1.`, `11.`, `111.`, `1V.`, `V.`, `V1.`, `V11.`, `V111.`, `1X.`, `X.` (digit 1 used for Roman I).
- `(3X1=3)` capital X; `(1x5=5)` reversed order; `(3x1= 3)` extra space.
- `oursurroundings` (V.4); `Maharashra` (X); `The Jenu tribes uses` (IV c); `first - aid` (V.2); `Flame of the forest` (textbook: "flame of forest").
- IV d: `…family trip, to a forest near their village.` The textbook says the trip was to their village near a forest, so this could be True or False (⚑).
- VIII.2 `If we overuse wood from nature,` is an incomplete sentence; the child completes the consequence.
- Header `covered:  :` has a double colon.
- Filename says L5, but the content is Lesson 4.

## ⚑ estimate: ~15
Q1 a–d (4, open), IV d (1), V.4–5 (2), VII.3 state animal (1, depends on the child's state), VIII 1–2 (2), IX table rows (5, open; how many cells earn the mark?).

## Issues for owner
See `issues` in sp04.json: chapter mismatch (L5 filename vs Lesson 4 content), whole-paper fallbackText (text layer garbled), the map needs an original SVG and an answer mode, the table cell scoring, and the state-animal answer.

---

## sp05 — Worksheet (2025-26), Class 4 TWAU, August — Chapter-5 Food for Health

- **File:** `2.1.6  Worksheet_Class-4_TWAU_August'25 L-5.pdf` (two spaces after `2.1.6`)
- **sha256:** `c7ddd4b606d2aacdac43aeedf3d5ca63c9fd0f56fc28ff495718084b631c066d`
- **Pages:** PDF 4 / printed "Total No. of printed pages: 4" (match). Pages viewed: 1, 2, 3, 4 (200 dpi).
- **Title / date / lesson:** "कार्यपत्रक / Worksheet (2025-26)", Month: August, Portion covered: "Chapter-5   Food for Health" (filename L-5). Textbook deev105 = Chapter 5 "Food for Health" (Unit 3 Health and Well-being). **Duplicate check:** sp02 and sp04 are also Lesson 5 papers; compare extracted text (this one is the AEES August worksheet, 40 marks, 11 questions).
- **Total:** 40 (printed "अंक/Marks: 40"). Duration: none printed.
- **Text layer:** usable. The English text is complete in `source/text-cache/sp05.txt`. The Hindi header is mangled (ऊर्ाा, शिषय, शिया, शिद्यार्थी, शिनांक, सों ख्या), so the header in the JSON comes from the image. Missing from the cache: only the Q11 India map (image).

### Header (from image)
कुल मुद्रित पृष्ठों की संख्या /Total No. of printed pages: 4 · परमाणु ऊर्जा शिक्षण संस्था · Atomic Energy Education Society · कार्यपत्रक / Worksheet (2025-26) · कक्षा /Class: 4  विषय /Subject: TWAU  माह/Month : August  अंक/Marks: 40 · दिया गया पाठ्यक्रम/Portion covered: Chapter-5  Food for Health · Name / Roll No. / Class /Sec. / Date lines. AEES logo (decorative).

### Sections
| Sec | Heading (verbatim) | Marks |
|---|---|---|
| A | Section – A : OBSERVATION AND REPORTING ( 15 marks ) | 15 |
| B | Section – B : IDENTIFICATION AND CLASSIFICATION ( 12 marks ) | 12 |
| C | Section – C :  DISCOVERY OF FACTS ( 13 marks ) | 13 |

| Q | Instruction (verbatim) | Pattern | Items × marks | Notes |
|---|---|---|---|---|
| 1 | Fill in the gaps with the correct answer. ( 6 x 1 = 6 ) | fill-blank (2 choices printed) | 6 × 1 | choices in brackets, e.g. ( Kerala / Karnataka ) |
| 2 | Write True or False. ( 5 x 1 = 5 ) | true-false | 5 × 1 | |
| 3 | Write a short note on the following. ( 2 x 2 = 4 ) | short | 2 × 2 | water in diet; Balanced food. Rubric |
| 4 | Answer the following. ( 5 x 1 = 5 ) | short | 5 × 1 | (a) typo "use to eat to"; "Surabhi" (textbook "Surbhi") |
| 5 | Write the difference between. ( 2 x 1 = 2 ) | table | 2 × 1 | Protective Foods \| Energy Giving Foods; marking unclear |
| 6 | Give an example of the ingredients or food items that match each of the tastes listed below? ( 6 x ½ = 3 ) | table | 6 × ½ | Sweet/Sour/Salty/Pungent/Bitter/Astringent; "?" kept |
| 7 | Draw any two junk food and also write the names. ( 2 x 1 = 2 ) | draw | 2 × 1 | two boxes with name lines |
| 8 | Name any two. ( 5 x 1 = 5 ) | one-word (2 blanks each) | 5 × 1 | "Water – rich fruits" |
| 9 | Match the following. ( 6 x ½ = 3) | match | 6 × ½ | cooking methods ↔ cakes/rice/popcorn/idiyappam/puri/chicken |
| 10 | Circle the odd one out. ( 4 x ½ = 2 ) | odd-one-out | 4 × ½ | printed "10.Circle"; italic clues |
| 11 | Locate the following states in the given map. ( 3 x 1 = 3 ) | diagram-label | 3 × 1 | a. Andhra Pradesh , b. Karnataka , c. Telangana |

### Pictures
- p.4 Q11: an outline political map of India with state borders and no names. **need: label.** It must be drawn as an original SVG with marked or numbered regions, so the child can identify AP, Karnataka and Telangana from the drawing alone.
- p.1: AEES logo (decorative).
- Q5, Q6 and Q7 are only tables or boxes, not pictures.

### Mark arithmetic
A 6+5+4=15 ✓ · B 5+2+3+2=12 ✓ · C 5+3+2+3=13 ✓ · 15+12+13 = 40 = printed total ✓.

### ⚑ estimate: ~11
Q3a–b, Q4a (typo), Q4b–d (open-ended), Q5 ×2 (marking unclear), Q7 (drawing), Q11 (map).

### Issues for owner
1. Q11 needs an India map SVG. This is the heaviest asset.
2. Q4a typo and the spelling of Surabhi. Keep them as printed and add a teacherNote.
3. Q5: decide what "2 x 1" means.
4. Q7: the drawing part cannot be auto-marked.
5. Q10 and Q11 have odd numbering and indentation. Keep them as printed.
6. Check for duplicates against sp02 and sp04 (Lesson 5).

---

## sp06 — 2.1.7 IV TWAU HY Practice Paper-2.pdf

- sha256 `ffda89d33ed6307a0a6851e2a3d65f195692f937471c09a12d44cca84213f5ae`
- PDF pages 8; header prints "Total No. of printed pages: 09"; footers "Page 1 of 8" … "Page 8 of 8"
- Text layer: usable (Devanagari header lines garbled in cache; image used)
- Title: "अर्ध-वार्षिक अभ्यास प्रश्न-पत्र / Half-Yearly Practice Paper (2026-27)" · Set 1 · Atomic Energy Education Society
- Class IV · Subject TWAU · Month April-September · Portion covered: Lesson 1 to Lesson 5 · Duration: not printed
- Printed total **80** · Chapters 1–5 (none beyond 5)
- Pages viewed: 1, 2, 3, 4, 5, 6, 7, 8

**Page-missing verdict: complete — header miscount.** Footers 1–8 of 8 are continuous, Q1–Q15 are continuous, sections add up to the printed marks (25 + 30 + 25 = 80), and no question breaks off.

| Sec | Heading (verbatim) | Marks | Blocks |
|---|---|---|---|
| 1 | OBSERVATION AND REPORTING (25 MARKS) | 25 | Q1 picture short 5×2=10 · Q2 fill-blank 4×1 · Q3 two examples 3×1 · Q4 match pictures↔names (6 pairs, printed 3×1=3) · Q5 currency note 5×1 |
| 2 | IDENTIFICATION AND CLASSIFICATION (30MARKS) | 30 | Q6 who am I 2×1 · Q7 match 4×1 · Q8 odd-one-out 4×1 · Q9 long 5×3=15 · Q10 identify picture 5×1 |
| 3 | DISCOVERY OF FACTS (25 MARKS) | 25 | Q11 fill-blank 5×1 · Q12 short 2×2 · Q13 give reason 3×2 · Q14 draw 3+2=5 · Q15 map 5×1 |

Block instructions (verbatim, image wins): `Q1.Observe the picture and answer the questions. 5 x 2 =10M` · `Q2. Name the following . 4x1= 4M` · `Q3. Give two examples of each- 3 x 1 = 3M` · `Q4. Match the method of cooking and with its name. 3 x 1 = 3M` · `Q5. Answer the questions based on the picture given- 1 X 5 = 5M` · `Q6.Who am I? 2 x 1 = 2M` · `Q7. Match the column. 4 x 1 = 4M` · `Q8. Circle the one which does not belong to the group. 4 x 1 = 4M` · `Q9. Answer the following questions. 5×3=15M` · `Q10. Identify the picture and write its name- 5 x 1 = 5 M` · `Q11:Name the following. 5 x 1 = 5M` · `Q12. Answers the following questions. 2 x 2 = 4 M` · `Q13. Give reason. 3 x 2 = 6 M` · `Q14.  Draw 1 junk food , 1 healthy food , a bird and colour it-- 3+ 2 = 5M` · `Q15. Locate the state in the given map. 1x 5 = 5 M`

**Pictures (18 question pictures + 1 decorative AEES logo):** Q1: bank, duck, protein foods, electrician at panel, solar cooker (answer-from) · Q4: 6 cooking-method pictures (answer-from) · Q5: ₹500 specimen note front and back (answer-from; e) encircle emblem = label) · Q10: flyover, arched footbridge, electric train/metro, hornbill, dragonfly (answer-from) · Q15: blank India state map on p.8 (label).

**Mark arithmetic:** 10+4+3+3+5=25; 2+4+4+15+5=30; 5+4+6+5+5=25; total 80. All match. Q4 has 6 pairs against "3 x 1 = 3M" (taken as 6×0.5).

**⚑ estimate: 12.** Q4 (marks, grilling vs roasting), Q5b/Q5e (picture-dependent), Q8.1, Q8.3, Q3.2, Q14 draw, Q15 map, Q1.4/Q10 dragonfly (off-textbook), Q10 train/metro naming.

**Issues:**
- Header says 09 printed pages, but the PDF has 8 pages and is complete.
- Q4: 6 pairs printed as 3×1 marks. Owner to confirm 0.5 each.
- Pictures that must be drawn: the ₹500 note (with emblem and language panel) and an India map with numbered state regions.
- Ambiguous odd-one-outs: Q8.1 and Q8.3. Q3.2 needs a second Andhra Pradesh food that is not in the textbook.
- fallbackText for the Q5 instruction (marks printed beside the picture) and the Q10/Q12/Q13 marks spacing (cache differs from image).
- Typos kept as printed: "Name the following .", "cooking and with its name", "Answers the following", "its role", "six different taste", "any two super food", "(30MARKS)", "Q11:", "colour it--".

---

## sp07 — 2.1.8 IV TWAU Revision WS Chapters 1 & 2.pdf

- **sha256:** `881d24c0400c9064be686fe662131b9ec5163664ff09e93717e55a2ce77ecc86`
- **Pages:** 4 PDF pages / printed "Total No. of printed pages: – 04" (match). Footers "Page N of 4".
- **Text layer:** usable for English. The Devanagari in the header is mangled (e.g. "कायापत्रक", "ऊर्ाा", "द्रिया"). The images were used for the header.
- **Pages viewed:** 1, 2, 3, 4 (200 dpi images)
- **Header:** AEES logo · "परमाणु ऊर्जा शिक्षण संस्था" / "Atomic Energy Education Society" / "कार्यपत्रक/ Worksheet (2026-27)" / "कक्षा /Class: IV विषय /Subject: TWAU माह/ Month: April to June अंक/Marks: 40" / "दिया गया पाठ्यक्रम/Portion covered: Chapter 1&2 – Living Together and Exploring our Neighbourhood" / Name, Roll No., Class /Sec., Date lines.
- **Printed title:** "कार्यपत्रक/ Worksheet (2026-27)". **Short label:** Revision Worksheet: Chapters 1 & 2
- **Printed total:** 40. **Duration:** none printed. **Chapters:** 1, 2 (deev101, deev102). Q.2(4) electrician/pliers is not in the Ch 1–2 text.

### Sections (no section letters, so one section per question, codes "1"–"9" as in sp04; heading = the printed question line; code "9" = Q.10)
| Q | Instruction (verbatim) | Pattern | Items × marks | Marks | Pictures |
|---|---|---|---|---|---|
| Q.1 | `Q.1 Fill in the blanks. (1x5=5)` | fill-blank | 5 × 1 | 5 | – |
| Q.2 | `Q.2 Tick the correct answer- (1x5=5)` | mcq | 5 × 1 | 5 | – |
| Q3 | `Q3. Frame correct words. (1x5=5)` | one-word (unscramble) | 5 × 1 | 5 | – |
| Q.4 | `Q.4 Write True or False. ( ½ X5 = 2 ½)` | true-false | 5 × ½ | 2.5 | – |
| Q.5 | `Q.5 Match the following-( ½ X5 = 2 ½)` | match (Group A / Group B) | 5 × ½ | 2.5 | – |
| Q. 6 | `Q. 6 See the given picture and identify the occupation: (1x5=5)` | one-word | 5 × 1 | 5 | 5 (p.2) |
| Q.7 | `Q.7) Look at the picture answer the questions-(1x4=4)` | short | 4 × 1 | 4 | 1 (p.3) |
| Q.8 | `Q.8 Answer the following-( 2X4 = 8)` | short | 4 × 2 | 8 | – |
| Q.10 | `Q.10) Locate the following states/ UTs in the given map. (1 × 3 = 3)` | diagram-label (map) | 3 × 1 | 3 | 1 (p.4) |

### Pictures (7)
1–5. **Q. 6, p.2.** Pictures 1–5 are needed to answer, so all must be drawn:
   1. Doctor (white coat, stethoscope).
   2. Teacher at a board showing "2+3".
   3. Firefighter (helmet, hose, flames).
   4. Photo of a playground or play structure. This is a place, not an occupation.
   5. Photo of a conical hay hut, the Ch 1 "Bhela Ghar". This is not an occupation either.

   Only pictures 1–3 have answer lines.
6. **Q.7, p.3.** The scene is needed to answer and must be drawn. It shows:
   - a SCHOOL building and a POST OFFICE with a red postbox
   - a road and trees
   - a child planting a sapling
   - two adults repairing a wooden bench
   - two sweepers
7. **Q.10, p.4.** An outline map of India with state boundaries, which the child must mark. It is © mapsofworld.com, so we need an original simplified SVG with markers.

### Typos and oddities (kept as printed)
- **Numbering:** there is no Q.9 (Q.8 is followed by Q.10). The labels are inconsistent: "Q.1", "Q3.", "Q. 6", "Q.7)", "Q.10)".
- **Q.2:**
  - Option styles are mixed ("a." and "(a)").
  - Items 1 and 2 have no space after the number ("1.Where").
  - Item 4 ends "is called" with no blank, and its option reads "(d) pliers.".
  - Item 5 has "(b) Bela Ghar", but the textbook spells it "Bhela Ghar".
- **Q3:** item 4 "ROYFLAEV" has an extra A, so it does not unscramble exactly to FLYOVER. Item 2 is printed "BAKN -".
- **Q. 6:** pictures 4 and 5 are not occupations, yet 1×5 marks are printed.
- **Q.7:** the instruction is missing "and".
- **Q.8:** item 2 reads "2.What is the role of Public places?". Item 3 has a one-word answer (microphone) for 2 marks.

### Mark arithmetic
There are no section marks. The block marks sum to 5+5+5+2.5+2.5+5+4+8+3 = **40**, which matches the printed 40. Every printed product is correct.

### fallbackText
- **Title:** "कार्यपत्रक/ Worksheet (2026-27)". The Devanagari is garbled in the cache, so either add fallbackText or use the English part only.
- **Everything else:** the English question text in the cache matches the images, and there are no drawn-line blanks that were lost.

### ⚑ estimate: ~11
- Q. 6 items 4–5 (2)
- Q3(4) (1)
- Q.2(4) and Q.2(5) (2)
- Q.7(1) and Q.7(4) (2)
- Q.8(1) and Q.8(2) (2)
- Q.10 map rendering and item type (2)

### Issues for the owner
1. Printed Q.10 is section code "9" because Q.9 is missing.
2. Choose the accepted answers for Q. 6 pictures 4 and 5.
3. Q.10 needs an original map SVG and a non-drawing item type.
4. The missing Q.9 and the ROYFLAEV and Bela Ghar typos are kept as printed, each with a teacherNote.
